import { Route } from "react-router-dom";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import PrestadoresLayout from "./components/PrestadoresLayout";
import Dashboard from "./pages/Dashboard";
import Solicitudes from "./pages/Solicitudes";
import Turnos from "./pages/Turnos";
import Situaciones from "./pages/Situaciones";
import HistoriaClinica from "./pages/HistoriaClinica";

export const PrestadoresRoutes = (
  <Route element={<ProtectedRoute requiredRole="prestador" />}>
    <Route path="/prestadores" element={<PrestadoresLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="solicitudes" element={<Solicitudes />} />
      <Route path="turnos" element={<Turnos />} />
      <Route path="situaciones" element={<Situaciones />} />
      <Route path="historia" element={<HistoriaClinica />} />
    </Route>
  </Route>
);
