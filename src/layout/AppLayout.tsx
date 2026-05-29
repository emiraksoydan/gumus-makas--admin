import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, useLocation } from "react-router";
import { RouteDocumentTitle } from "../components/common/PageMeta";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import AdminAiChatPanel from "../components/adminAi/AdminAiChatPanel";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const location = useLocation();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <RouteDocumentTitle pathname={location.pathname} />
        <AppHeader />
        {/* key={location.pathname} sayfa değişiminde fade animasyonu yeniden tetikler */}
        <div
          key={location.pathname}
          className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 animate-page-fade"
        >
          <Outlet />
        </div>
        <AdminAiChatPanel />
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
