import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import { HorizontaLDots } from "../icons";
import AppIcon from "../components/icons/AppIcon";
import type { AppIconName } from "../components/icons/app-icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import SidebarChatThreads from "./SidebarChatThreads";

type NavItem = {
  name: string;
  icon: AppIconName;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navIcon = (name: AppIconName) => <AppIcon name={name} className="size-6" />;

// Ana menü — sıkça kullanılan yönetim sayfaları
const navItems: NavItem[] = [
  {
    icon: "dashboard",
    name: "Gösterge Paneli",
    path: "/",
  },
  {
    icon: "users",
    name: "Kullanıcılar",
    path: "/users",
  },
  {
    icon: "calendar",
    name: "Randevular",
    path: "/appointments",
  },
  {
    icon: "time",
    name: "Randevu Takvimi",
    path: "/schedule",
  },
  {
    icon: "map",
    name: "Harita",
    path: "/map",
  },
  {
    icon: "freeBarber",
    name: "Serbest Berberler",
    subItems: [
      { name: "Liste", path: "/free-barbers" },
      { name: "Karşılaştırma", path: "/compare/free-barbers" },
    ],
  },
  {
    icon: "money",
    name: "Kazançlar",
    path: "/earnings",
  },
  {
    icon: "business",
    name: "İşletmeler",
    subItems: [
      { name: "Berber Salonları", path: "/barberstores" },
      { name: "Salon Karşılaştırma", path: "/compare/stores" },
      { name: "Koltuklar", path: "/chairs" },
      { name: "Manuel Berberler", path: "/manuel-barbers" },
    ],
  },
  {
    icon: "service",
    name: "Hizmetler",
    path: "/service-offerings",
  },
  {
    icon: "package",
    name: "Paketler",
    path: "/service-packages",
  },
  {
    icon: "category",
    name: "Kategoriler",
    path: "/categories",
  },
  {
    icon: "help",
    name: "Yardım Rehberi",
    path: "/help-guides",
  },
];

// Yönetim eylemleri — şikayet/talep/engelleme + admin mgmt + audit
const managementItems: NavItem[] = [
  {
    icon: "inbox",
    name: "Bildirim Gönder",
    path: "/notifications",
  },
  {
    icon: "complaint",
    name: "Şikayetler",
    path: "/complaints",
  },
  {
    icon: "image",
    name: "Sosyal Moderasyon",
    path: "/social-moderation",
  },
  {
    icon: "request",
    name: "Talepler",
    path: "/requests",
  },
  {
    icon: "blocked",
    name: "Engellenenler",
    path: "/blocked",
  },
  {
    icon: "admin",
    name: "Admin Yönetimi",
    path: "/admins",
  },
  {
    icon: "audit",
    name: "Denetim Kayıtları",
    path: "/audit-logs",
  },
  {
    icon: "roles",
    name: "Sistem Rolleri",
    path: "/operation-claims",
  },
];

// Diğer veri görüntülemeler
const othersItems: NavItem[] = [
  {
    icon: "rating",
    name: "Değerlendirmeler",
    path: "/ratings",
  },
  {
    icon: "favorite",
    name: "Favoriler",
    path: "/favorites",
  },
  {
    icon: "chat",
    name: "Sohbet",
    path: "/chat",
  },
  {
    icon: "fileManager",
    name: "Dosya Yöneticisi",
    path: "/file-manager",
  },
  {
    icon: "savedFilter",
    name: "Kayıtlı Filtreler",
    path: "/saved-filters",
  },
];

type MenuType = "main" | "management" | "others";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: MenuType;
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) =>
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(`${path}/`)),
    [location.pathname],
  );

  useEffect(() => {
    let submenuMatched = false;
    (["main", "management", "others"] as MenuType[]).forEach((menuType) => {
      const items =
        menuType === "main"
          ? navItems
          : menuType === "management"
            ? managementItems
            : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType, index });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: MenuType) => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) return null;
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: MenuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              type="button"
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group outline-none focus:outline-none focus-visible:ring-0 ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {navIcon(nav.icon)}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <AppIcon
                  name="chevronDown"
                  className={`ml-auto size-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group outline-none focus:outline-none focus-visible:ring-0 ${
                  isActive(nav.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {navIcon(nav.icon)}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType &&
                  openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item outline-none focus:outline-none focus-visible:ring-0 ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const showSectionLabels = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-6 flex items-center gap-3 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center gap-3 outline-none focus:outline-none focus-visible:ring-0">
          <img
            src="/images/logo/gumusmakaslogo.png"
            alt="Gümüş Makas"
            className="w-10 h-10 object-contain"
          />
          {showSectionLabels && (
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold text-gray-800 dark:text-white/90">
                Gümüş Makas
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Yönetim Paneli
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !showSectionLabels ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showSectionLabels ? (
                  "Menü"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !showSectionLabels ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showSectionLabels ? (
                  "Yönetim"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(managementItems, "management")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !showSectionLabels ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showSectionLabels ? "Diğer" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        <SidebarChatThreads />
        {showSectionLabels ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
