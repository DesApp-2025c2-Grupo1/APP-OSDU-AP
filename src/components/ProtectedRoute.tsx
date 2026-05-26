import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  requiredRole?: "afiliado" | "prestador";
  children?: React.ReactNode;
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { isAuthenticated, usuario } = useAuth();

  if (!isAuthenticated) return <Navigate to="/welcome" replace />;

  if (requiredRole && usuario?.tipo !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-sm font-semibold">
          No tienes permiso para acceder a esta sección.
        </p>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
