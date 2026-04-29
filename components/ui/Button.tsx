import Link from "next/link";
import { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function Button({ href, children, variant = "primary" }: ButtonProps) {
  return (
    <Link href={href} className={`btn btn-${variant} focus-ring`}>
      {children}
    </Link>
  );
}
