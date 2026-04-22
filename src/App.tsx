import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Reintegros } from "./pages/Reintegros";
import { Recetas } from "./pages/Recetas";
import { Autorizaciones } from "./pages/Autorizaciones";
import { ConsultarCartilla } from "./pages/ConsultarCartilla";
import { Turnos } from "./pages/Turnos";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas — requieren autenticación */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="reintegros" element={<Reintegros />} />
                <Route path="recetas" element={<Recetas />} />
                <Route path="autorizaciones" element={<Autorizaciones />} />
                <Route path="cartilla" element={<ConsultarCartilla />} />
                <Route path="turnos" element={<Turnos />} />
              </Route>
            </Route>

            {/* Cualquier ruta desconocida redirige al dashboard por ahora falta paginas de error */}
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
