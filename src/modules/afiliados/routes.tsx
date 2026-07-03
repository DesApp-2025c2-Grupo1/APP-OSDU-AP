import { Route } from "react-router-dom";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Autorizaciones } from "./pages/Autorizaciones";
import { Recetas } from "./pages/Recetas";
import { ConsultarCartilla } from "./pages/ConsultarCartilla";
import { Turnos } from "./pages/Turnos";
import { Reintegros } from "./pages/Reintegros";
import { AdminAffiliates } from "./pages/AdminAffiliates";

export const AfiliadosRoutes = (
  <Route element={<ProtectedRoute requiredRole="afiliado" />}>
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="autorizaciones" element={<Autorizaciones />} />
      <Route path="recetas" element={<Recetas />} />
      <Route path="cartilla" element={<ConsultarCartilla />} />
      <Route path="turnos" element={<Turnos />} />
      <Route path="reintegros" element={<Reintegros />} />
      <Route path="admin/affiliates" element={<AdminAffiliates />} />
    </Route>
  </Route>
);
