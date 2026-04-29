import { ReactNode } from "react";
import Image from "next/image";

type CardProps = {
  title: string;
  description: string;
  icon?: string;
  children?: ReactNode;
};

export function Card({ title, description, icon, children }: CardProps) {
  return (
    <article className="card">
      {icon ? <Image src={icon} alt="" width={48} height={48} /> : null}
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </article>
  );
}
