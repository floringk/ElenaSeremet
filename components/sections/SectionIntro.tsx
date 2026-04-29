type SectionIntroProps = {
  label: string;
  title: string;
  text: string;
};

export function SectionIntro({ label, title, text }: SectionIntroProps) {
  return (
    <>
      <p className="section-label">{label}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </>
  );
}
