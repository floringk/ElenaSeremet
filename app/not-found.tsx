import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-section">
      <div className="container not-found">
        <h1>Pagina nu a fost gasita</h1>
        <p>Linkul poate fi vechi sau invalid. Poti continua din pagina principala.</p>
        <p>
          <Link href="/" className="btn btn-primary focus-ring">
            Mergi la Acasa
          </Link>
        </p>
      </div>
    </section>
  );
}
