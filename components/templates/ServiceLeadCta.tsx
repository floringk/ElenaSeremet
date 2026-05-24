import Link from "next/link";

export function ServiceLeadCta() {
  return (
    <div className="service-lead-cta">
      <Link href="/preturi" className="btn btn-secondary focus-ring">
        Prețuri & abonamente
      </Link>
      <Link href="/schedules" className="btn btn-primary focus-ring">
        Program clase
      </Link>
      <Link href="/inscriere#inscriere-studio" className="btn btn-secondary focus-ring">
        Înscriere studio
      </Link>
      <Link href="/contact" className="btn btn-secondary focus-ring">
        Contact
      </Link>
    </div>
  );
}
