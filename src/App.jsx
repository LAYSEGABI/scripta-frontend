import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SistemaProvider } from "./context/SistemaContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Catalogo from "./pages/Catalogo";
import ControleEstoque from "./pages/ControleEstoque";
import Emprestimos from "./pages/Emprestimos";

const App = () => {
  return (
    <SistemaProvider>
      <Router>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 bg-gray-50 min-h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/usuarios" element={<Usuarios />} />
              {/*  <Route path="/catalogo" element={<Catalogo />} />*/}
              <Route path="/controle-estoque" element={<ControleEstoque />} />
              <Route path="/emprestimos" element={<Emprestimos />} />
            </Routes>
          </div>
        </div>
      </Router>
    </SistemaProvider>
  );
};

export default App;
