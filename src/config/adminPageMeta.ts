export const ADMIN_FAVICON = "/images/logo/gumusmakaslogo.png";
export const ADMIN_BRAND_NAME = "Gümüş Makas";
export const ADMIN_SITE_TITLE = "Gümüş Makas Admin";

export interface BreadcrumbSegment {
  label: string;
  path: string;
}

export interface ResolvedPageMeta {
  title: string;
  parents: BreadcrumbSegment[];
}

const ROUTES: Record<string, ResolvedPageMeta> = {
  "/": { title: "Gösterge Paneli", parents: [] },
  "/users": { title: "Kullanıcılar", parents: [] },
  "/appointments": { title: "Randevular", parents: [] },
  "/schedule": { title: "Randevu Takvimi", parents: [] },
  "/map": { title: "Harita", parents: [] },
  "/free-barbers": { title: "Serbest Berberler", parents: [] },
  "/barberstores": { title: "Berber Salonları", parents: [] },
  "/earnings": { title: "Kazançlar", parents: [] },
  "/compare/stores": {
    title: "Salon Karşılaştırma",
    parents: [{ label: "İşletmeler", path: "/barberstores" }],
  },
  "/compare/free-barbers": {
    title: "Serbest Berber Karşılaştırma",
    parents: [{ label: "Serbest Berberler", path: "/free-barbers" }],
  },
  "/chairs": { title: "Koltuklar", parents: [{ label: "İşletmeler", path: "/barberstores" }] },
  "/service-offerings": { title: "Hizmetler", parents: [{ label: "İşletmeler", path: "/barberstores" }] },
  "/service-packages": { title: "Paketler", parents: [{ label: "İşletmeler", path: "/barberstores" }] },
  "/manuel-barbers": { title: "Manuel Berberler", parents: [{ label: "İşletmeler", path: "/barberstores" }] },
  "/categories": { title: "Kategoriler", parents: [] },
  "/help-guides": { title: "Yardım Rehberi", parents: [] },
  "/complaints": { title: "Şikayetler", parents: [] },
  "/social-moderation": { title: "Sosyal Moderasyon", parents: [] },
  "/requests": { title: "Talepler", parents: [] },
  "/blocked": { title: "Engellenenler", parents: [] },
  "/admins": { title: "Admin Yönetimi", parents: [] },
  "/audit-logs": { title: "Denetim Kayıtları", parents: [] },
  "/operation-claims": { title: "Sistem Rolleri", parents: [] },
  "/ratings": { title: "Değerlendirmeler", parents: [] },
  "/favorites": { title: "Favoriler", parents: [] },
  "/chat": { title: "Sohbetler", parents: [] },
  "/file-manager": { title: "Dosya Yöneticisi", parents: [] },
  "/saved-filters": { title: "Kayıtlı Filtreler", parents: [] },
  "/profile": { title: "Profil", parents: [] },
};

export function formatDocumentTitle(pageTitle: string): string {
  if (pageTitle.includes(ADMIN_SITE_TITLE)) return pageTitle;
  return `${pageTitle} | ${ADMIN_SITE_TITLE}`;
}

export function resolvePageMeta(pathname: string): ResolvedPageMeta {
  const path = pathname.replace(/\/$/, "") || "/";

  if (path.startsWith("/chat/") && path !== "/chat") {
    return {
      title: "Sohbet Detayı",
      parents: [{ label: "Sohbetler", path: "/chat" }],
    };
  }

  return ROUTES[path] ?? { title: "Sayfa", parents: [] };
}
