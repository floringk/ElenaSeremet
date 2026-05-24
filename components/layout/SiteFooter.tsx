import Link from "next/link";

import { getServiceNavGroups } from "@/lib/nav-services";
import { navLinks, schedule } from "@/lib/site-data";

export async function SiteFooter() {
  const serviceGroups = getServiceNavGroups();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <section className="footer-col footer-col--contact">
          <h3>Contact</h3>
          <p>Bd. 1 Decembrie 1918, nr. 58</p>
          <p>București, Sector 3</p>
          <p>
            <a href="tel:+40755247412" className="focus-ring">
              +40 755 247 412
            </a>
          </p>
        </section>

        <section className="footer-col footer-col--schedule">
          <h3>Program</h3>
          {schedule.map((item) => (
            <p key={item.day}>
              {item.day}: {item.hours}
            </p>
          ))}
        </section>

        <section className="footer-col footer-col--nav">
          <h3>Navigare</h3>
          <ul className="footer-nav-list">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="focus-ring">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="footer-col footer-col--services">
          <h3>Servicii</h3>
          <p className="footer-services-overview">
            <Link href="/servicii" className="focus-ring footer-services-all">
              Toate serviciile
            </Link>
          </p>
          <div className="footer-service-groups">
            {serviceGroups.map((group) => (
              <div key={group.label} className="footer-service-group">
                <p className="footer-service-group-label">{group.label}</p>
                <ul className="footer-nav-list footer-nav-list--compact">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="focus-ring">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="container footer-bottom">
        <p className="footer-tagline">Studio în București</p>
        <p className="footer-copy">© Pilates Studio Elena Seremet. Toate drepturile rezervate.</p>
      </div>
    </footer>
  );
}
