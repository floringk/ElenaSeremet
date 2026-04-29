import { Card } from "@/components/ui/Card";
import { pricingPlans } from "@/lib/site-data";

export function PricingCards() {
  return (
    <div className="grid-3">
      {pricingPlans.map((plan) => (
        <Card key={plan.name} title={plan.name} description={plan.note}>
          <p className="price-value">{plan.value}</p>
        </Card>
      ))}
    </div>
  );
}
