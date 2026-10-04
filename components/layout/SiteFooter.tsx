import Link from "next/link";

import { getNavLinks } from "@/lib/cms-navigation";
import { getProgram } from "@/lib/cms-program";
import { getStudioChrome } from "@/lib/cms-studio";
import { getServiceNavGroups } from "@/lib/nav-services";

export async function SiteFooter() {
  const [serviceGroups, navLinks, program, studio] = await Promise.all([
    Promise.resolve(getServiceNavGroups()),
    getNavLinks(),
    getProgram(),
    getStudioChrome()
  ]);
  const featuredServices = serviceGroups.flatMap((group) => group.items).slice(0, 6);
  const hours = program.openingHours;

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <section className="footer-col footer-col--studio">
          <h3>Studio</h3>
          <p className="footer-studio-name">{studio.studioName}</p>
          <p>{studio.addressLine1}</p>
          <p>{studio.addressLine2}</p>
          <p>
            <a href={studio.phoneHref} className="focus-ring">
              {studio.phoneDisplay}
            </a>
          </p>
        </section>

        <section className="footer-col footer-col--schedule">
          <h3>Program</h3>
          {hours.map((item) => (
            <p key={item.day}>
              <span className="footer-schedule-day">{item.day}</span>
              <span className="footer-schedule-hours">{item.hours}</span>
            </p>
          ))}
          <p className="footer-schedule-link">
            <Link href="/schedules" className="focus-ring">
              Vezi orele claselor →
            </Link>
          </p>
        </section>

        <section className="footer-col footer-col--links">
          <h3>Linkuri</h3>
          <ul className="footer-nav-list">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="focus-ring">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="footer-services-short">
            <p className="footer-service-group-label">Servicii</p>
            <ul className="footer-nav-list footer-nav-list--compact">
              <li>
                <Link href="/servicii" className="focus-ring footer-services-all">
                  Toate serviciile
                </Link>
              </li>
              {featuredServices.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="focus-ring">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
      <div className="container footer-bottom">
        <p className="footer-tagline">Studio în București</p>
        <p className="footer-copy">
          © {studio.studioName}. Toate drepturile rezervate.{" "}
          <Link href="/politica-cookie" className="focus-ring footer-legal-link">
            Politica de cookie-uri
          </Link>
        </p>
      </div>
    </footer>
  );
}
