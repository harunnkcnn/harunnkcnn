import { SiteForm } from "@/components/admin/SiteForm";
import { getSettings } from "@/lib/content";

export default async function SitePage() {
  return <SiteForm initial={await getSettings()} />;
}
