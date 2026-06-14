import { Card } from "@/components/ui/Card";
import { splitPriceValue } from "@/lib/format-price";
import { pricingPlans } from "@/lib/site-data";

export function PricingCards() {
  return (
    <div className="grid-3 pricing-cards">
      {pricingPlans.map((plan) => {
        const featured = plan.name.includes("8");
        const { amount, currency } = splitPriceValue(plan.value);
        return (
          <Card
            key={plan.name}
            title={plan.name}
            description={plan.note}
            className={featured ? "model5-card-pricing model5-card-pricing--featured" : "model5-card-pricing"}
          >
            {featured ? <p className="pricing-badge">Recomandat</p> : null}
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
