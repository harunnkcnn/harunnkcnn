export function JsonLd({ data }: { data: unknown }) {
  // "<" kaçışlanır; veri içinde </script> olsa bile sayfa bozulmaz.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
