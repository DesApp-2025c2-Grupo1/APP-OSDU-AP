import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginSelector } from "./pages/LoginSelector";
import { LoginAfiliado } from "./pages/LoginAfiliado";
import { LoginPrestador } from "./pages/LoginPrestador";
import { Welcome } from "./pages/Welcome";
import { Register } from "./pages/Register";
import { ChangePassword } from "./pages/ChangePassword";
import { AfiliadosRoutes } from "./modules/afiliados/routes";
import { PrestadoresRoutes } from "./modules/prestadores/routes";

function AppRoutes() {
  const { isAuthenticated, usuario } = useAuth();

  if (isAuthenticated && usuario?.mustChangePassword) {
    return (
      <Routes>
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="*" element={<Navigate to="/change-password" replace />} />
      </Routes>
    );
  }

  const defaultAuthRedirect = usuario?.tipo === "prestador" ? "/prestadores" : "/";

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/welcome" element={!isAuthenticated ? <Welcome /> : <Navigate to={defaultAuthRedirect} />} />

      {/* Selector de rol */}
      <Route path="/login" element={!isAuthenticated ? <LoginSelector /> : <Navigate to={defaultAuthRedirect} />} />

      {/* Logins específicos */}
      <Route path="/login/afiliado" element={!isAuthenticated ? <LoginAfiliado /> : <Navigate to={defaultAuthRedirect} />} />
      <Route path="/login/prestador" element={!isAuthenticated ? <LoginPrestador /> : <Navigate to={defaultAuthRedirect} />} />

      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Módulo Afiliados */}
      {AfiliadosRoutes}

      {/* Módulo Prestadores */}
      {PrestadoresRoutes}

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to={isAuthenticated ? defaultAuthRedirect : "/welcome"} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
