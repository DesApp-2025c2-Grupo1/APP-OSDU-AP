import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Reintegros } from "./pages/Reintegros";
import { Recetas } from "./pages/Recetas";
import { Autorizaciones } from "./pages/Autorizaciones";
import { ConsultarCartilla } from "./pages/ConsultarCartilla";
import { Turnos } from "./pages/Turnos";
import { Welcome } from "./pages/Welcome";
import { Register } from "./pages/Register";
import { AdminAffiliates } from "./pages/AdminAffiliates";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/welcome" element={!isAuthenticated ? <Welcome /> : <Navigate to="/" />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

      {/* Rutas protegidas — requieren autenticación */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="reintegros" element={<Reintegros />} />
          <Route path="recetas" element={<Recetas />} />
          <Route path="autorizaciones" element={<Autorizaciones />} />
          <Route path="cartilla" element={<ConsultarCartilla />} />
          <Route path="turnos" element={<Turnos />} />
          
          {/* Ruta de Admin (podría protegerse más con roles) */}
          <Route path="admin/affiliates" element={<AdminAffiliates />} />
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/welcome"} />} />
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
