import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

interface AdminPlaceholderProps {
  title: string;
  description?: string;
}

export default function AdminPlaceholder({
  title,
  description,
}: AdminPlaceholderProps) {
  return (
    <>
      <PageMeta
        title={`${title} | Gümüş Makas Admin`}
        description={description ?? title}
      />
      <PageBreadcrumb pageTitle={title} />
      <div className="rounded-2xl border border-gray-200 bg-white p-10 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mx-auto max-w-md text-center">
          <h2 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90">
            {title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bu sayfa yakında eklenecek. Backend endpoint'leri hazır, frontend
            kısmı bir sonraki fazda yapılandırılacak.
          </p>
        </div>
      </div>
    </>
  );
}
