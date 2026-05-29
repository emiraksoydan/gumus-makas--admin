import { Link, useLocation } from "react-router";
import { resolvePageMeta, type BreadcrumbSegment } from "../../config/adminPageMeta";

interface PageBreadcrumbProps {
  pageTitle?: string;
  parents?: BreadcrumbSegment[];
}

const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({ pageTitle, parents }) => {
  const { pathname } = useLocation();
  const resolved = resolvePageMeta(pathname);
  const title = pageTitle ?? resolved.title;
  const trail = parents ?? resolved.parents;

  const isHome = pathname === "/" || pathname === "";

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h2>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            {isHome ? (
              <span className="text-sm text-gray-800 dark:text-white/90">Ana Sayfa</span>
            ) : (
              <Link
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                to="/"
              >
                Ana Sayfa
                <ChevronSep />
              </Link>
            )}
          </li>
          {trail.map((item) => (
            <li key={item.path} className="inline-flex items-center gap-1.5">
              <Link
                to={item.path}
                className="text-sm text-gray-500 transition hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
              >
                {item.label}
              </Link>
              <ChevronSep />
            </li>
          ))}
          {!isHome ? (
            <li className="text-sm text-gray-800 dark:text-white/90">{title}</li>
          ) : null}
        </ol>
      </nav>
    </div>
  );
};

function ChevronSep() {
  return (
    <svg
      className="stroke-current text-gray-400"
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PageBreadcrumb;
