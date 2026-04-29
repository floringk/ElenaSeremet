import { Card } from "@/components/ui/Card";
import { services } from "@/lib/site-data";

export function ServiceGrid() {
  return (
    <div className="grid-3">
      {services.map((service) => (
        <Card key={service.title} title={service.title} description={service.description} icon={service.icon} />
      ))}
    </div>
  );
}
