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
    description: "Clase in grup, variate si adaptate nivelului tau.",
    icon: "/content/images/Classes.svg",
    href: "/pilates-mat"
  },
  {
    title: "Sedinte private",
    description: "Antrenament personalizat, unu la unu.",
    icon: "/content/images/illustration-woman-2.svg",
    href: "/sedinte-private"
  },
  {
    title: "Yogalates",
    description: "Fuziune de yoga si pilates pentru flexibilitate si liniste.",
    icon: "/content/images/hatha.svg",
    href: "/yogalates-stretching"
  }
] as const;

export const pricingPlans = [
  { name: "4 sedinte", value: "280 RON", note: "Flexibil pentru ritm usor." },
  { name: "8 sedinte", value: "520 RON", note: "Cel mai ales pentru progres constant." },
  { name: "12 sedinte", value: "720 RON", note: "Pentru obiective active si continuitate." }
];

export const schedule = [
  { day: "Luni - Vineri", hours: "08:30 - 21:00" },
  { day: "Sambata", hours: "09:00 - 14:00" },
  { day: "Duminica", hours: "Inchis" }
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
