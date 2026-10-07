import fs from "node:fs/promises";
import path from "node:path";

const API_URL =
  "https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04645PD-PD04646PD/json";

const DATA_PATH = path.join(process.cwd(), "data", "usdpen.json");
const PUBLIC_PATH = path.join(process.cwd(), "public", "usdpen.json");

const MONTHS = {
  ene: 1, jan: 1,
  feb: 2,
  mar: 3,
  abr: 4, apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  ago: 8, aug: 8,
  sep: 9, set: 9,
  oct: 10,
  nov: 11,
  dic: 12, dec: 12,
};

function toNumber(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim().replace(",", ".");
  if (!normalized || /^n\.?d\.?$/i.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function isoDate(year, month, day) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseBcrpDate(label) {
  if (!label) return null;
  const raw = String(label).trim();

  let m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return isoDate(Number(m[1]), Number(m[2]), Number(m[3]));

  m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    let year = Number(m[3]);
    if (year < 100) year += year >= 70 ? 1900 : 2000;
    return isoDate(year, Number(m[2]), Number(m[1]));
  }

  const cleaned = raw
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, "");

  m = cleaned.match(/^(\d{1,2})([a-záéíóúñ]{3})(\d{2,4})$/i);
  if (m) {
    const month = MONTHS[m[2].normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
    if (month) {
      let year = Number(m[3]);
      if (year < 100) year += year >= 70 ? 1900 : 2000;
      return isoDate(year, month, Number(m[1]));
    }
  }

  return null;
}

function round4(value) {
  return Number(Number(value).toFixed(4));
}

function calcMid(buy, sell) {
  return round4((buy + sell) / 2);
}

async function readExisting() {
  try {
    return JSON.parse(await fs.readFile(DATA_PATH, "utf8"));
  } catch {
    return null;
  }
}

const response = await fetch(API_URL, {
  headers: {
    "user-agent": "Decision-Capital-FX/1.0",
    accept: "application/json",
  },
});

if (!response.ok) {
  throw new Error(`BCRP API returned HTTP ${response.status}`);
}

const payload = await response.json();
const periods = Array.isArray(payload?.periods) ? payload.periods : [];

const valid = periods
  .map((period) => {
    const buy = toNumber(period?.values?.[0]);
    const sell = toNumber(period?.values?.[1]);
    const date = parseBcrpDate(period?.name);
    if (buy === null || sell === null || !date) return null;
    return {
      date,
      label: String(period.name),
      buy: round4(buy),
      sell: round4(sell),
      close: calcMid(buy, sell),
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.date.localeCompare(b.date));

if (!valid.length) {
  throw new Error("No valid BCRP closing observations were returned.");
}

const latest = valid.at(-1);
const previous = valid.at(-2) ?? null;
const existing = await readExisting();

if (existing?.date && latest.date < existing.date) {
  console.log(
    `BCRP latest date (${latest.date}) is older than current stored date (${existing.date}). No update made.`
  );
  process.exit(0);
}

const previousClose = previous?.close ?? existing?.previousClose ?? null;
const change = previousClose === null ? null : round4(latest.close - previousClose);
const changePct =
  previousClose === null
    ? null
    : Number((((latest.close / previousClose) - 1) * 100).toFixed(2));

const nowLima = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Lima",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
}).format(new Date()).replace(", ", "T");

const output = {
  date: latest.date,
  close: latest.close,
  buy: latest.buy,
  sell: latest.sell,
  previousClose,
  change,
  changePct,
  source: "BCRP",
  series: {
    buy: "PD04645PD",
    sell: "PD04646PD",
  },
  bcrpPeriodLabel: latest.label,
  updatedAtLima: `${nowLima}-05:00`,
};

const json = JSON.stringify(output, null, 2) + "\n";
await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
await fs.mkdir(path.dirname(PUBLIC_PATH), { recursive: true });
await fs.writeFile(DATA_PATH, json);
await fs.writeFile(PUBLIC_PATH, json);

console.log("USD/PEN BCRP data updated:", output);
