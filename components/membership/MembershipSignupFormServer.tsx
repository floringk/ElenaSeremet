import { MembershipSignupForm } from "@/components/membership/MembershipSignupForm";
import { getSubscriptionOptionNames } from "@/lib/cms-pricing";

type MembershipSignupFormServerProps = {
  sourcePage?: string;
  compact?: boolean;
  title?: string;
  id?: string;
};

export async function MembershipSignupFormServer(props: MembershipSignupFormServerProps) {
  const subscriptionOptions = await getSubscriptionOptionNames();
  return <MembershipSignupForm {...props} subscriptionOptions={subscriptionOptions} />;
}
