import { getServiceNavGroups } from "@/lib/nav-services";
import { SiteHeaderNav } from "@/components/layout/SiteHeaderNav";

export async function SiteHeader() {
  const serviceGroups = getServiceNavGroups();
  return <SiteHeaderNav serviceGroups={serviceGroups} />;
}
