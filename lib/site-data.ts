export const navLinks = [
  { href: "/", label: "Acasă" },
  { href: "/despre-noi", label: "Despre noi" },
  { href: "/servicii", label: "Servicii" },
  { href: "/galerie", label: "Galerie" },
  { href: "/preturi", label: "Prețuri" },
  { href: "/schedules", label: "Program" },
  { href: "/inscriere", label: "Înscriere" },
  { href: "/contact", label: "Contact" }
];

export const services = [
  {
    title: "Pilates Mat",
    description: "Clase în grup, variate și adaptate nivelului tău.",
    icon: "/content/images/Classes.svg",
    href: "/pilates-mat"
  },
  {
    title: "Ședințe private",
    description: "Antrenament personalizat, unu la unu.",
    icon: "/content/images/illustration-woman-2.svg",
    href: "/sedinte-private"
  },
  {
    title: "Yogalates",
    description: "Fuziune de yoga și pilates pentru flexibilitate și liniște.",
    icon: "/content/images/hatha.svg",
    href: "/yogalates-stretching"
  }
] as const;

export const pricingPlans = [
  { name: "4 ședințe", value: "280 RON", note: "Flexibil pentru ritm ușor." },
  { name: "8 ședințe", value: "520 RON", note: "Cel mai ales pentru progres constant." },
  { name: "12 ședințe", value: "720 RON", note: "Pentru obiective active și continuitate." }
];

export const schedule = [
  { day: "Luni - Vineri", hours: "08:30 - 21:00" },
  { day: "Sâmbătă", hours: "09:00 - 14:00" },
  { day: "Duminică", hours: "Închis" }
];

export const team = [
  {
    name: "Elena Seremet",
    image: "/content/images/Elena-scaled.jpg",
    href: "/elena-seremet"
  },
  {
    name: "Gabriela Ostafe",
    image: "/content/images/Gabriela-scaled-e1756931846824-849x1024.jpg",
    href: "/gabriela-ostafe"
  },
  {
    name: "Adelina Csolti",
    image: "/content/images/Adelina-scaled.jpg",
    href: "/adelina-csolti"
  }
] as const;

/** Instructor bios linked from the team grid */
export const instructorProfileSlugs = ["elena-seremet", "gabriela-ostafe", "adelina-csolti"] as const;
