import { notFound } from "next/navigation";
import { EntityEditor } from "@/components/admin/EntityEditor";
import { blankEntity, LABELS } from "@/lib/blank";
import { getById } from "@/lib/content";
import type { Collection } from "@/lib/types";

export default async function EditPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  if (!(collection in LABELS)) notFound();
  const c = collection as Collection;
  const entity = id === "new" ? blankEntity(c) : await getById(c, id);
  if (!entity) notFound();
  return <EntityEditor key={entity.id || "new"} collection={c} initial={entity} />;
}
