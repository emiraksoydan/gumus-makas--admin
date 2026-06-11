import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import AppointmentSchedulePage from "./pages/Schedule/AppointmentSchedulePage";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import PublicOnlyRoute from "./features/auth/PublicOnlyRoute";
import UsersPage from "./pages/Users/UsersPage";
import AdminsPage from "./pages/Admins/AdminsPage";
import AuditLogsPage from "./pages/AuditLogs/AuditLogsPage";
import ChatThreadsListPage from "./pages/Chat/ChatThreadsListPage";
import ChatThreadDetailPage from "./pages/Chat/ChatThreadDetailPage";
import FileManagerPage from "./pages/FileManager/FileManagerPage";
import CategoriesPage from "./pages/Categories/CategoriesPage";
import HelpGuidesPage from "./pages/HelpGuides/HelpGuidesPage";
import OperationClaimsPage from "./pages/OperationClaims/OperationClaimsPage";
import AppointmentsPage from "./pages/Appointments/AppointmentsPage";
import BarberStoresPage from "./pages/BarberStores/BarberStoresPage";
import ChairsPage from "./pages/Chairs/ChairsPage";
import ServiceOfferingsPage from "./pages/ServiceOfferings/ServiceOfferingsPage";
import ServicePackagesPage from "./pages/ServicePackages/ServicePackagesPage";
import ManuelBarbersPage from "./pages/ManuelBarbers/ManuelBarbersPage";
import ComplaintsPage from "./pages/Complaints/ComplaintsPage";
import RequestsPage from "./pages/Requests/RequestsPage";
import BlockedPage from "./pages/Blocked/BlockedPage";
import RatingsPage from "./pages/Ratings/RatingsPage";
import FavoritesPage from "./pages/Favorites/FavoritesPage";
import SavedFiltersPage from "./pages/SavedFilters/SavedFiltersPage";
import FreeBarbersPage from "./pages/FreeBarbers/FreeBarbersPage";
import NotificationsPage from "./pages/Notifications/NotificationsPage";
import MapPage from "./pages/Map/MapPage";
import EarningsPage from "./pages/Earnings/EarningsPage";
import CompareStoresPage from "./pages/Compare/CompareStoresPage";
import CompareFreeBarbersPage from "./pages/Compare/CompareFreeBarbersPage";
import SocialModerationPage from "./pages/SocialModeration/SocialModerationPage";
import "./features/earnings/adminEarningsApi";
import "./features/adminAi/adminAiApi";
import "./features/socialModeration/socialModerationApi";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Protected (admin) layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/schedule" element={<AppointmentSchedulePage />} />
              <Route path="/calendar" element={<Navigate to="/schedule" replace />} />
              <Route path="/blank" element={<Blank />} />

              {/* Admin yönetim sayfaları — Faz 2'de gerçek içerik eklenecek */}
              <Route path="/users" element={<UsersPage />} />
              <Route path="/admins" element={<AdminsPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/barberstores" element={<BarberStoresPage />} />
              <Route path="/earnings" element={<EarningsPage />} />
              <Route path="/compare/stores" element={<CompareStoresPage />} />
              <Route path="/compare/free-barbers" element={<CompareFreeBarbersPage />} />
              <Route path="/free-barbers" element={<FreeBarbersPage />} />
              <Route path="/chairs" element={<ChairsPage />} />
              <Route path="/service-offerings" element={<ServiceOfferingsPage />} />
              <Route path="/service-packages" element={<ServicePackagesPage />} />
              <Route path="/manuel-barbers" element={<ManuelBarbersPage />} />
              <Route path="/complaints" element={<ComplaintsPage />} />
              <Route path="/social-moderation" element={<SocialModerationPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/blocked" element={<BlockedPage />} />
              <Route path="/ratings" element={<RatingsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/chat" element={<ChatThreadsListPage />} />
              <Route path="/chat/:threadId" element={<ChatThreadDetailPage />} />
              <Route path="/chat-threads" element={<Navigate to="/chat" replace />} />
              <Route path="/file-manager" element={<FileManagerPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/help-guides" element={<HelpGuidesPage />} />
              <Route path="/operation-claims" element={<OperationClaimsPage />} />
              <Route path="/saved-filters" element={<SavedFiltersPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>

          {/* Auth layout (public only — token varsa /'e yönlendirir) */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
