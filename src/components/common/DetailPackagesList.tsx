export interface PackageItem {
  id?: string;
  packageName: string;
  totalPrice: number;
  items?: { serviceName: string }[];
  serviceNamesSnapshot?: string;
}

export default function DetailPackagesList({
  title,
  packages,
}: {
  title?: string;
  packages: PackageItem[];
}) {
  if (!packages.length) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title ?? `Paketler (${packages.length})`}
      </p>
      <ul className="space-y-2">
        {packages.map((pkg, i) => {
          const itemNames =
            pkg.items?.map((x) => x.serviceName).filter(Boolean) ??
            (pkg.serviceNamesSnapshot
              ? pkg.serviceNamesSnapshot.split(",").map((s) => s.trim()).filter(Boolean)
              : []);

          return (
            <li
              key={pkg.id ?? i}
              className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-2.5 text-sm dark:border-white/[0.05] dark:bg-white/[0.03]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {pkg.packageName}
                </span>
                <span className="shrink-0 font-medium">
                  {Number(pkg.totalPrice).toLocaleString("tr-TR")} ₺
                </span>
              </div>
              {itemNames.length > 0 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {itemNames.join(" · ")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
