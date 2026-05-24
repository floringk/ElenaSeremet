import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-section">
      <div className="container not-found">
        <h1>Pagina nu a fost găsită</h1>
        <p>Linkul poate fi vechi sau invalid. Poți continua din pagina principală.</p>
        <p>
          <Link href="/" className="btn btn-primary focus-ring">
            Mergi la Acasă
          </Link>
        </p>
      </div>
    </section>
  );
}
