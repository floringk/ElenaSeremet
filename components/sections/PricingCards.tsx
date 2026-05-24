import { Card } from "@/components/ui/Card";
import { splitPriceValue } from "@/lib/format-price";
import { pricingPlans } from "@/lib/site-data";

export function PricingCards() {
  return (
    <div className="grid-3">
      {pricingPlans.map((plan) => {
        const { amount, currency } = splitPriceValue(plan.value);
        return (
          <Card key={plan.name} title={plan.name} description={plan.note}>
            <p className="price-value">
              <span className="price-value-amount">{amount}</span>
              {currency ? <span className="price-value-currency">{currency}</span> : null}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
