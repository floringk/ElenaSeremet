import { getNavLinks } from "@/lib/cms-navigation";
import { getServiceNavGroups } from "@/lib/nav-services";
import { SiteHeaderNav } from "@/components/layout/SiteHeaderNav";

export async function SiteHeader() {
  const [serviceGroups, navLinks] = await Promise.all([
    Promise.resolve(getServiceNavGroups()),
    getNavLinks()
  ]);
  return <SiteHeaderNav serviceGroups={serviceGroups} navLinks={navLinks} />;
}
