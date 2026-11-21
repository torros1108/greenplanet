import Link from "next/link";

export function StoreFooter() {
  return <footer className="site-footer">
    <div className="footer-brand">
      <strong>Greenplanet</strong>
      <p>Gaveæsker, babyprodukter, wellness og activewear fra udvalgte brands.</p>
      <p className="footer-company">CVR 44640376<br />Bøgevejen 6, 2850 Nærum</p>
      <div className="social-icons" aria-label="Kontakt">
        <a className="instagram-link" href="https://www.instagram.com/greenplanet.dk/" target="_blank" rel="noreferrer" aria-label="Greenplanet på Instagram">ig</a>
        <a href="mailto:hello@greenplanet.dk" aria-label="Send e-mail til hello@greenplanet.dk">@</a>
      </div>
    </div>
    <div className="footer-links">
      <div><span>Shop</span><Link href="/gaveaesker">Gaveæsker</Link><Link href="/babygaver">Baby & barsel</Link><Link href="/wellness">Velvære</Link><Link href="/move">Move</Link><Link href="/#builder">Byg selv</Link></div>
      <div><span>Kundeservice</span><Link href="/kontakt">Kontakt</Link><Link href="/levering">Levering</Link><Link href="/returnering">Returnering</Link></div>
      <div><span>Jura</span><Link href="/juridisk">Juridisk overblik</Link><Link href="/handelsbetingelser">Handelsbetingelser</Link><Link href="/privatlivspolitik">Privatlivspolitik</Link><Link href="/cookiepolitik">Cookiepolitik</Link></div>
    </div>
  </footer>;
}
