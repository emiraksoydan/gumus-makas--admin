import { Navigate, Outlet, useLocation } from "react-router";
import { useAppSelector } from "../../store/hooks";
import { selectIsAuthenticated } from "./authSlice";

export default function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
