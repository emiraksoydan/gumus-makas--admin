import { Helmet, HelmetProvider } from "react-helmet-async";
import {
  ADMIN_FAVICON,
  ADMIN_SITE_TITLE,
  formatDocumentTitle,
  resolvePageMeta,
} from "../../config/adminPageMeta";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const shortTitle = title.includes(" | ") ? title.split(" | ")[0]! : title;
  const docTitle = formatDocumentTitle(shortTitle);

  return (
    <Helmet>
      <title>{docTitle}</title>
      <meta name="description" content={description} />
      <link rel="icon" type="image/png" href={ADMIN_FAVICON} />
      <link rel="apple-touch-icon" href={ADMIN_FAVICON} />
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <Helmet defaultTitle={ADMIN_SITE_TITLE}>
      <link rel="icon" type="image/png" href={ADMIN_FAVICON} />
      <link rel="apple-touch-icon" href={ADMIN_FAVICON} />
    </Helmet>
    {children}
  </HelmetProvider>
);

/** Route değişiminde PageMeta olmayan sayfalar için yedek başlık */
export function RouteDocumentTitle({ pathname }: { pathname: string }) {
  const { title } = resolvePageMeta(pathname);
  return (
    <Helmet>
      <title>{formatDocumentTitle(title)}</title>
    </Helmet>
  );
}

export default PageMeta;
