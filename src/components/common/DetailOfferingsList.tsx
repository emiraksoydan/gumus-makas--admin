import DetailSectionTitle from "./DetailSectionTitle";

interface OfferingItem {
  id?: string;
  serviceName: string;
  price: number;
}

export default function DetailOfferingsList({
  title,
  offerings,
}: {
  title?: string;
  offerings: OfferingItem[];
}) {
  if (!offerings.length) return null;

  return (
    <div className="sm:col-span-2">
      <DetailSectionTitle icon="service" title={title ?? "Hizmetler"} count={offerings.length} />
      <ul className="space-y-2">
        {offerings.map((o, i) => (
          <li
            key={o.id ?? i}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-2.5 text-sm dark:border-white/[0.05] dark:bg-white/[0.03]"
          >
            <span>{o.serviceName}</span>
            <span className="font-medium">
              {Number(o.price).toLocaleString("tr-TR")} ₺
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
