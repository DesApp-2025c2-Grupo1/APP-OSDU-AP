import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Reintegros } from "./pages/Reintegros";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50"> 
        <Routes>
          {/* El Layout envuelve a todas las rutas hijas */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} /> {/* index = la ruta por defecto ("/") */}
            <Route path="reintegros" element={<Reintegros />} />
            {/* Las demás las agregaremos después: <Route path="turnos" element={<Turnos />} /> */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;