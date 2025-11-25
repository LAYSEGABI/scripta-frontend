import { Home, Users, BookOpen, BarChart2, Settings, LogOut, RefreshCcw } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  
  {/* { name: "Catálogo de Livros", path: "/catalogo", icon: <BookOpen size={18} /> },*/}

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <Home size={18} /> },
    { name: "Usuários", path: "/usuarios", icon: <Users size={18} /> },
    { name: "Controle de Estoque", path: "/controle-estoque", icon: <BookOpen size={18} /> },
    { name: "Empréstimos", path: "/emprestimos", icon: <RefreshCcw size={18} /> },
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

      {/* Rodapé */}
      <div className="logout">
        <LogOut size={18} />
        <span>Sair</span>
      </div>
    </aside>
  );
};

export default Sidebar;
