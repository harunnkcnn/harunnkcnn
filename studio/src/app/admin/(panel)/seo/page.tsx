import { SeoLab } from "@/components/admin/SeoLab";
import { list } from "@/lib/content";

export default async function SeoPage() {
  const [projects, posts] = await Promise.all([list("projects"), list("posts")]);
  return <SeoLab rows={[...projects.map((entity) => ({ entity, kind: "projects" as const })), ...posts.map((entity) => ({ entity, kind: "posts" as const }))]} />;
}
