import Link from "next/link";
import { schedule } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <section>
          <h3>Contact</h3>
          <p>Bd. 1 Decembrie 1918, nr. 58</p>
          <p>Bucuresti, Sector 3</p>
          <p>
            <a href="tel:+40755247412" className="focus-ring">
              +40 755 247 412
            </a>
          </p>
        </section>
        <section>
          <h3>Program</h3>
          {schedule.map((item) => (
            <p key={item.day}>
              {item.day}: {item.hours}
            </p>
          ))}
        </section>
        <section>
          <h3>Linkuri</h3>
          <p>
            <Link href="/preturi" className="focus-ring">
              Preturi
            </Link>
          </p>
          <p>
            <Link href="/program" className="focus-ring">
              Program
            </Link>
          </p>
          <p>
            <Link href="/contact" className="focus-ring">
              Contact
            </Link>
          </p>
        </section>
      </div>
      <div className="container footer-bottom">© Pilates Studio Elena Seremet. Toate drepturile rezervate.</div>
    </footer>
  );
}
