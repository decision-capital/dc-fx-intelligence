import fs from "node:fs/promises";
import path from "node:path";

const BCRP_PAGE = "https://www.bcrp.gob.pe/operaciones-monetarias-y-cambiarias.html";
const API_URL =
  "https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04645PD-PD04646PD/json";

const DATA_PATH = path.join(process.cwd(), "data", "usdpen.json");
const PUBLIC_PATH = path.join(process.cwd(), "public", "usdpen.json");

const MONTHS = {
  ene: 1, jan: 1, feb: 2, mar: 3, abr: 4, apr: 4, may: 5, jun: 6,
  jul: 7, ago: 8, aug: 8, sep: 9, set: 9, oct: 10, nov: 11, dic: 12, dec: 12,
};

function cleanText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&iacute;/gi, "í")
    .replace(/&aacute;/gi, "á")
    .replace(/&eacute;/gi, "é")
    .replace(/&oacute;/gi, "ó")
    .replace(/&uacute;/gi, "ú")
    .replace(/&ntilde;/gi, "ñ")
    .replace(/&ndash;|&mdash;/gi, "-")
    .replace(/&#44;/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

function num(s) {
  if (s == null) return null;
  const n = Number(String(s).replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

function round4(x) {
  return Number(Number(x).toFixed(4));
}

function toISODate(day, monthText, year) {
  const key = monthText.toLowerCase().slice(0, 3)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const month = MONTHS[key];
  if (!month) return null;
  return `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}

function limaYear() {
  return Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima", year: "numeric"
  }).format(new Date()));
}

async function readExisting() {
  try { return JSON.parse(await fs.readFile(DATA_PATH, "utf8")); }
  catch { return null; }
}

async function fetchHomepageData() {
  const res = await fetch(BCRP_PAGE, {
    headers: {
      "user-agent": "Mozilla/5.0 Decision-Capital-FX/1.0",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) throw new Error(`BCRP homepage HTTP ${res.status}`);
  const html = await res.text();
  const text = cleanText(html);

  const tcIndex = text.search(/TIPO DE CAMBIO\s*\(TC\)/i);
  if (tcIndex < 0) throw new Error("TIPO DE CAMBIO block not found");
  const block = text.slice(tcIndex, tcIndex + 5000);

  const header = block.match(/([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2})\.?\s*(\d{1,2})\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2})\.?\s*(\d{1,2})/);
  if (!header) throw new Error("BCRP date headers not found");

  const year = limaYear();
  const date = toISODate(Number(header[2]), header[1], year);
  const previousDate = toISODate(Number(header[4]), header[3], year);
  if (!date) throw new Error("Could not parse BCRP current date");

  const getTwo = (label) => {
    const re = new RegExp(label + "\\.?\\s+([0-9]+[,.][0-9]+)\\s+([0-9]+[,.][0-9]+)", "i");
    const m = block.match(re);
    return m ? [num(m[1]), num(m[2])] : [null, null];
  };

  const [low, prevLow] = getTwo("M[ií]nimo");
  const [high, prevHigh] = getTwo("M[aá]ximo");
  const [average, prevAverage] = getTwo("Promedio");
  const [open, prevOpen] = getTwo("Apertura");
  const [close, previousClose] = getTwo("Cierre");

  if ([low, high, average, open, close].some(v => v === null)) {
    throw new Error("One or more current BCRP homepage values could not be parsed");
  }

  return {
    date,
    previousDate,
    open: round4(open),
    close: round4(close),
    previousClose: previousClose === null ? null : round4(previousClose),
    low: round4(low),
    high: round4(high),
    average: round4(average),
    source: "BCRP homepage / Datatec",
    raw: { prevOpen, prevLow, prevHigh, prevAverage }
  };
}

async function fetchApiFallback() {
  const res = await fetch(API_URL, {
    headers: { "user-agent": "Decision-Capital-FX/1.0", accept: "application/json" },
  });
  if (!res.ok) throw new Error(`BCRP API HTTP ${res.status}`);
  const payload = await res.json();
  const periods = Array.isArray(payload?.periods) ? payload.periods : [];
  if (!periods.length) throw new Error("No BCRP API observations");

  const last = periods.at(-1);
  const prev = periods.at(-2);
  const buy = num(last?.values?.[0]);
  const sell = num(last?.values?.[1]);
  if (buy === null || sell === null) throw new Error("Invalid API observation");

  const label = String(last?.name || "");
  const m = label.match(/(\d{1,2})\s*([A-Za-zÁÉÍÓÚÑáéíóúñ]{3})\s*(\d{2,4})/);
  let date = null;
  if (m) {
    let y = Number(m[3]); if (y < 100) y += 2000;
    date = toISODate(Number(m[1]), m[2], y);
  }

  const prevBuy = num(prev?.values?.[0]);
  const prevSell = num(prev?.values?.[1]);

  return {
    date,
    open: null,
    close: round4((buy + sell)/2),
    previousClose: (prevBuy !== null && prevSell !== null) ? round4((prevBuy + prevSell)/2) : null,
    low: null,
    high: null,
    average: null,
    buy: round4(buy),
    sell: round4(sell),
    source: "BCRPData API",
  };
}

const existing = await readExisting();

let latest;
try {
  latest = await fetchHomepageData();
  console.log("Using BCRP homepage data.");
} catch (err) {
  console.warn("Homepage parse failed:", err.message);
  latest = await fetchApiFallback();
  console.log("Using BCRPData API fallback.");
}

if (!latest.date) throw new Error("No valid date available from BCRP");

if (existing?.date && latest.date < existing.date) {
  console.log(`Latest BCRP date (${latest.date}) is older than stored date (${existing.date}). No update made.`);
  process.exit(0);
}

const change =
  latest.previousClose == null ? null : round4(latest.close - latest.previousClose);
const changePct =
  latest.previousClose == null ? null :
  Number((((latest.close / latest.previousClose) - 1) * 100).toFixed(2));

const nowLima = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Lima",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
  hour12: false,
}).format(new Date()).replace(", ", "T");

const output = {
  date: latest.date,
  close: latest.close,
  previousClose: latest.previousClose,
  open: latest.open ?? null,
  low: latest.low ?? null,
  high: latest.high ?? null,
  average: latest.average ?? null,
  buy: latest.buy ?? null,
  sell: latest.sell ?? null,
  change,
  changePct,
  source: latest.source,
  updatedAtLima: `${nowLima}-05:00`
};

const json = JSON.stringify(output, null, 2) + "\n";
await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
await fs.mkdir(path.dirname(PUBLIC_PATH), { recursive: true });
await fs.writeFile(DATA_PATH, json);
await fs.writeFile(PUBLIC_PATH, json);

console.log("USD/PEN BCRP data updated:", output);
