import market from "../data/market.json";

export default function Home() {
  const fx = market.usdpen;
  return (
    <main>
      <header className="topbar">
        <div>
          <div className="brand">DECISION CAPITAL</div>
          <div className="tagline">Mercados complejos. Decisiones claras.</div>
        </div>
        <div className="sectionLabel">FX INTELLIGENCE</div>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">USD / PEN · MERCADO PERUANO</div>
          <h1>S/ {fx.last.toFixed(4)}</h1>
          <div className={fx.change < 0 ? "change down" : "change up"}>
            {fx.change < 0 ? "▼" : "▲"} {Math.abs(fx.change).toFixed(2)}%
          </div>
          <p className="updated">Última actualización: {market.updated}</p>
        </div>
        <div className="heroNote">
          <span>MONITOR DE MERCADO</span>
          <strong>USD/PEN</strong>
          <p>Precio, contexto global y lectura de mercado en un solo lugar.</p>
        </div>
      </section>

      <section className="stats">
        {[
          ["Apertura", fx.open],
          ["Máximo", fx.high],
          ["Mínimo", fx.low],
          ["Cierre", fx.close],
          ["Promedio", fx.average],
        ].map(([label, value]) => (
          <div className="card" key={String(label)}>
            <span>{label}</span>
            <strong>{Number(value).toFixed(4)}</strong>
          </div>
        ))}
      </section>

      <section className="marketStrip">
        {Object.entries(market.global).map(([label, value]) => (
          <div className="marketItem" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section className="contentGrid">
        <article className="panel chartPanel">
          <div className="panelTitle">
            <span>USD/PEN</span>
            <h2>Evolución de la sesión</h2>
          </div>
          <div className="chartPlaceholder">
            <div className="chartLine" />
            <p>Próxima etapa: gráfico con datos históricos del BCRP.</p>
          </div>
        </article>

        <article className="panel">
          <div className="panelTitle">
            <span>DECISION CAPITAL RESEARCH</span>
            <h2>¿Qué movió al dólar hoy?</h2>
          </div>
          <p className="comment">{market.comment}</p>
          <div className="drivers">
            <span>GLOBAL</span>
            <span>PERÚ</span>
            <span>BCRP</span>
            <span>FLUJOS</span>
            <span>TÉCNICO</span>
          </div>
        </article>
      </section>

      <footer>
        <div>DECISION CAPITAL</div>
        <div>FX Intelligence · Información de mercado, no recomendación de inversión.</div>
      </footer>
    </main>
  );
}
