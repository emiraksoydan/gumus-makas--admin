import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  logout,
  selectAdminProfile,
} from "../features/auth/authSlice";
import { useAdminLogoutMutation } from "../features/auth/authApi";
import UserAvatar from "../components/common/UserAvatar";

export default function SidebarWidget() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const admin = useAppSelector(selectAdminProfile);
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);
  const [adminLogout, { isLoading }] = useAdminLogoutMutation();

  const displayName = admin?.fullName ?? "Yönetici";
  const displayEmail = admin?.email ?? "—";
  const firstName = displayName.split(" ")[0];
  const lastName = displayName.split(" ").slice(1).join(" ");

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await adminLogout({ refreshToken }).unwrap().catch(() => {
          /* server logout başarısız olsa bile client logout devam etsin */
        });
      }
    } finally {
      dispatch(logout());
      navigate("/signin", { replace: true });
    }
  };

  return (
    <div className="mx-auto mb-6 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 dark:bg-white/[0.03]">
      <div className="mb-4 flex items-center gap-3">
        <UserAvatar
          firstName={firstName}
          lastName={lastName}
          imageUrl={admin?.profileImageUrl}
          size={40}
        />
        <div className="flex flex-col overflow-hidden leading-tight">
          <span className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
            {displayName}
          </span>
          <span className="truncate text-xs text-gray-500 dark:text-gray-400">
            {displayEmail}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className="flex w-full items-center justify-center rounded-lg bg-error-500 p-2.5 text-theme-sm font-medium text-white transition-colors duration-500 ease-in-out hover:bg-error-600 disabled:opacity-50"
      >
        {isLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
      </button>
    </div>
  );
}
