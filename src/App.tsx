import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Reintegros } from "./pages/Reintegros";
import { Recetas } from "./pages/Recetas";
import { Autorizaciones } from "./pages/Autorizaciones";
import { ConsultarCartilla } from "./pages/ConsultarCartilla";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="reintegros" element={<Reintegros />} />
            <Route path="recetas" element={<Recetas />} />
            <Route path="autorizaciones" element={<Autorizaciones />} />
            <Route path="cartilla" element={<ConsultarCartilla />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;