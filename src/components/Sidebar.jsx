import React from 'react';
import { Home, Users, BookOpen, RefreshCcw, LogOut, Library } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Função para deslogar
  const handleLogout = () => {
    // 1. Limpa os dados da sessão
    localStorage.removeItem("token");
    localStorage.removeItem("usuario_matricula");
    
    // 2. Manda o usuário de volta para o Login
    navigate("/");
  };

  const menuItems = [
    // CORREÇÃO: O caminho do dashboard agora é /dashboard, não /
    { name: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
    { name: "Usuários", path: "/usuarios", icon: <Users size={18} /> },
    { name: "Controle de Estoque", path: "/controle-estoque", icon: <BookOpen size={18} /> },
    { name: "Empréstimos", path: "/emprestimos", icon: <RefreshCcw size={18} /> },
    // Se quiser ativar o catálogo depois, é só descomentar:
    // { name: "Catálogo (Público)", path: "/catalogo", icon: <Library size={18} /> },
  ];

  return (
    <aside className="sidebar">
      {/* Topo */}
      <div className="sidebar-header">
        <span role="img" aria-label="livro" className="logo-icon">📚</span>
        <h2 className="logo-text">Scripta</h2>
      </div>

      {/* Menu */}
      <nav className="menu">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`menu-link ${location.pathname === item.path ? "active" : ""}`}
              >
                <span className="menu-icon">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Rodapé - Botão Sair com funcionalidade */}
      <div className="logout" onClick={handleLogout} style={{ cursor: 'pointer' }}>
        <LogOut size={18} />
        <span>Sair</span>
      </div>
    </aside>
  );
};

export default Sidebar;