import { Button } from "@/components/ui/Button";

export function ContactBlock() {
  return (
    <div className="card contact-block">
      <h3>Contact rapid</h3>
      <p>Email: hello@pilatesstudio.ro</p>
      <p>Telefon: +40 755 247 412</p>
      <p>Adresa: Bd. 1 Decembrie 1918, nr. 58, Bucuresti</p>
      <Button href="/contact" variant="secondary">
        Mergi la contact
      </Button>
    </div>
  );
}
