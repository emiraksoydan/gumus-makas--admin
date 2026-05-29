import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { UserCircleIcon } from "../../icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout, selectAdminProfile } from "../../features/auth/authSlice";
import { useAdminLogoutMutation } from "../../features/auth/authApi";
import UserAvatar from "../common/UserAvatar";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const admin = useAppSelector(selectAdminProfile);
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [adminLogout, { isLoading }] = useAdminLogoutMutation();

  const toggleDropdown = () => setIsOpen((o) => !o);
  const closeDropdown = () => setIsOpen(false);

  const handleLogout = async () => {
    closeDropdown();
    try {
      if (refreshToken) {
        await adminLogout({ refreshToken }).unwrap().catch(() => {});
      }
    } finally {
      dispatch(logout());
      navigate("/signin", { replace: true });
    }
  };

  const displayName = admin?.fullName ?? "Yönetici";
  const displayEmail = admin?.email ?? "—";
  const firstName = displayName.split(" ")[0];
  const lastName = displayName.split(" ").slice(1).join(" ");

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-gray-700 transition-all duration-500 ease-in-out hover:bg-gray-100 hover:shadow-sm dropdown-toggle dark:text-gray-400 dark:hover:bg-white/[0.05]"
      >
        <UserAvatar firstName={firstName} lastName={lastName} imageUrl={admin?.profileImageUrl} size={36} />
        <span className="hidden font-medium text-theme-sm sm:block">{firstName}</span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-2 py-3">
          <UserAvatar firstName={firstName} lastName={lastName} imageUrl={admin?.profileImageUrl} size={44} />
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="block font-semibold text-gray-800 text-theme-sm dark:text-white/90 truncate">
              {displayName}
            </span>
            <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400 truncate">
              {displayEmail}
            </span>
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium uppercase text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
              Admin
            </span>
          </div>
        </div>

        <div className="my-2 border-t border-gray-200 dark:border-gray-800"></div>

        {/* Profil */}
        <Link
          to="/profile"
          onClick={closeDropdown}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-gray-700 transition-all duration-500 ease-in-out hover:bg-brand-50 hover:text-brand-600 hover:translate-x-0.5 dark:text-gray-300 dark:hover:bg-brand-500/15 dark:hover:text-brand-300"
        >
          <UserCircleIcon className="size-5" />
          <span className="text-theme-sm">Profilim</span>
        </Link>

        <div className="my-2 border-t border-gray-200 dark:border-gray-800"></div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-error-600 transition-all duration-500 ease-in-out hover:bg-error-500/10 hover:translate-x-0.5 disabled:opacity-50 dark:text-error-400"
        >
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
              fill="currentColor"
            />
          </svg>
          <span className="text-theme-sm">
            {isLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
          </span>
        </button>
      </Dropdown>
    </div>
  );
}
