import market from "../data/market.json";

export default function Home() {
  const fx = market.usdpen;

  return (
    <main>
      <header className="siteHeader">
        <div className="wrap headerInner">
          <a className="logo" href="#">DC FX Intelligence</a>
          <nav>
            <a href="#mercado">Mercado hoy</a>
            <a href="#reporte">Reporte diario</a>
            <a href="#premium">Premium</a>
          </nav>
        </div>
      </header>

      <section className="heroSection">
        <div className="wrap heroGrid">
          <div>
            <div className="kicker">ANÁLISIS DIARIO SOBRE DÓLAR Y MERCADOS</div>
            <h1>Analizamos la tendencia del dólar para ayudarte a tomar decisiones, mejor informado.</h1>
            <p className="heroText">
              Una plataforma diseñada para inversionistas, tesorerías y empresas que necesitan más que un precio: contexto, dirección, niveles clave y lectura macro antes de tomar decisiones.
            </p>
            <div className="bulletRow">
              <span>Tipo de cambio en vivo</span>
              <span>Comentario de apertura y cierre</span>
              <span>Noticias y eventos clave</span>
            </div>
            <div className="actions">
              <a className="btn primary" href="#reporte">Recibir reporte diario</a>
              <a className="btn secondary" href="#mercado">Ver comentario del día</a>
            </div>
          </div>
          <div className="heroCard">
            <div className="heroCardTop">USD/PEN</div>
            <div className="heroPrice">S/ {fx.close.toFixed(4)}</div>
            <div className="heroLabel">Cierre oficial BCRP</div>
            <div className="heroMeta">Actualizado: {market.updated}</div>
          </div>
        </div>
      </section>

      <section id="mercado" className="section whiteSection">
        <div className="wrap">
          <div className="sectionEyebrow">MERCADO EN VIVO</div>
          <h2>USD/PEN</h2>

          <div className="marketBox">
            <div className="mainQuote">
              <span className="quoteLabel">Cierre oficial BCRP</span>
              <strong>S/ {fx.close.toFixed(4)}</strong>
              <small>{market.updated}</small>
            </div>
            <div className="marketStats">
              <div><span>Cierre previo</span><strong>{fx.previousClose ?? "--"}</strong></div>
              <div><span>Sesgo del día</span><strong>{fx.bias}</strong></div>
              <div><span>Rango intradía</span><strong>{fx.range}</strong></div>
              <div><span>Dato oficial</span><strong>BCRP</strong></div>
            </div>
          </div>
          <div className="sourceLine">Fuente: BCRP | Análisis propio</div>
        </div>
      </section>

      <section id="reporte" className="section softSection">
        <div className="wrap reportGrid">
          <article>
            <div className="sectionEyebrow">COMENTARIO DEL DÍA</div>
            <h2>Comentario Cierre – USD/PEN</h2>
            <p className="reportText">{market.comment}</p>
            <a className="textLink" href="#suscripcion">Regístrate para recibir el análisis completo →</a>
          </article>
          <aside className="signupCard" id="suscripcion">
            <h3>Recibe el análisis diario del dólar</h3>
            <p>Contexto, factores de mercado y lectura profesional del USD/PEN en un solo lugar.</p>
            <input placeholder="Nombre" />
            <input placeholder="Correo electrónico" type="email" />
            <button>Quiero recibir el reporte</button>
          </aside>
        </div>
      </section>

      <section className="section whiteSection">
        <div className="wrap">
          <div className="sectionEyebrow">QUÉ ESTÁ PASANDO HOY</div>
          <h2>Variables que marcan el rumbo del dólar</h2>
          <div className="globalGrid">
            {market.global.map((item) => (
              <div className="globalCard" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section navySection">
        <div className="wrap">
          <div className="sectionEyebrow gold">POR QUÉ DC FX INTELLIGENCE</div>
          <h2>Mantente informado, como los inversionistas profesionales.</h2>
          <div className="valueGrid">
            <div><div className="iconCircle">◉</div><h3>Análisis institucional</h3><p>Interpretación de mercado con estándar de mesa de dinero, gestión de portafolios y lectura macro consistente.</p></div>
            <div><div className="iconCircle">↔</div><h3>Especialización en USD/PEN</h3><p>Foco en flujos, BCRP, eventos locales y correlación con el dólar global.</p></div>
            <div><div className="iconCircle">△</div><h3>Decisiones accionables</h3><p>Sesgo, niveles, escenarios y señales útiles para empresas, tesorerías e inversionistas.</p></div>
          </div>
        </div>
      </section>

      <section id="premium" className="section premiumSection">
        <div className="wrap premiumGrid">
          <div>
            <div className="sectionEyebrow">DC FX INTELLIGENCE PREMIUM</div>
            <h2>Una capa más profunda para quienes administran riesgo cambiario.</h2>
            <p>Lectura táctica, niveles clave, escenarios y seguimiento histórico.</p>
          </div>
          <div className="premiumCard">
            <h3>Incluye</h3>
            <ul>
              <li>Estrategia diaria y sesgo operativo</li>
              <li>Niveles de soporte y resistencia</li>
              <li>Escenarios probables de corto plazo</li>
              <li>Reporte semanal y mensual</li>
            </ul>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap footerInner">
          <div>
            <strong>DC FX Intelligence</strong>
            <span>Decision Capital</span>
          </div>
          <div>Información de mercado. No constituye recomendación de inversión.</div>
        </div>
      </footer>
    </main>
  );
}
