import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../../store/hooks";
import { selectIsAuthenticated } from "./authSlice";

/**
 * Auth ekranlarını (signin/forgot/reset) zaten giriş yapmış kullanıcılardan korur:
 * token varsa dashboard'a yönlendirir.
 */
export default function PublicOnlyRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
