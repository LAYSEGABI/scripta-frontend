import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { SistemaProvider } from './context/SistemaContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Catalogo from './pages/Catalogo';
import Emprestimos from './pages/Emprestimos';
import ControleEstoque from './pages/ControleEstoque';

import Sidebar from './components/Sidebar'; 
import './styles/global.css';

const Layout = ({ children }) => {
  const location = useLocation();
  // Verifica se é a página de login
  const isLoginPage = location.pathname === '/';

  return (
    <div className="app-container" style={{ display: 'flex' }}>
      {/* Renderiza a Sidebar apenas se NÃO for login */}
      {!isLoginPage && <Sidebar />}
      
      {/* CORREÇÃO DO CSS: 
          Removemos o marginLeft: 250px. 
          Usamos flex: 1 para ocupar o espaço restante automaticamente.
          O overflow: 'hidden' evita barras de rolagem duplas.
      */}
      <main className="main-content" style={{ 
          flex: 1, 
          backgroundColor: '#f5f7f3ff', // Cor de fundo suave
          overflowY: 'auto'
      }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <SistemaProvider> 
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/emprestimos" element={<Emprestimos />} />
            <Route path="/controle-estoque" element={<ControleEstoque />} />
          </Routes>
        </Layout>
      </SistemaProvider>
    </Router>
  );
}

export default App;