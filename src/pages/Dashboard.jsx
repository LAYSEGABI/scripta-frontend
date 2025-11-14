import { Book, RefreshCcw, AlertTriangle, UserX } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import "../styles/dashboard.css";

const data = [
  { name: "Jan", emprestimos: 120 },
  { name: "Fev", emprestimos: 98 },
  { name: "Mar", emprestimos: 140 },
  { name: "Abr", emprestimos: 90 },
  { name: "Mai", emprestimos: 160 },
  { name: "Jun", emprestimos: 130 },
];

const Dashboard = () => {
  return (
    <div  className="dashboard dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Cards superiores */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="icon-wrapper green">
            <Book size={22} />
          </div>
          <div className="card-info">
            <p>Total de Livros</p>
            <h2>12.450</h2>
          </div>
        </div>

        <div className="card">
          <div className="icon-wrapper blue">
            <RefreshCcw size={22} />
          </div>
          <div className="card-info">
            <p>Empréstimos Ativos</p>
            <h2>312</h2>
          </div>
        </div>

        <div className="card">
          <div className="icon-wrapper orange">
            <UserX size={22} />
          </div>
          <div className="card-info">
            <p>Alunos Penalizados</p>
            <h2>14</h2>
          </div>
        </div>

        <div className="card">
          <div className="icon-wrapper red">
            <AlertTriangle size={22} />
          </div>
          <div className="card-info">
            <p>Livros Atrasados</p>
            <h2>23</h2>
          </div>
        </div>
      </div>

      {/* Gráfico e atividades */}
      <div className="dashboard-content">
        <div className="chart-card">
          <h3>Empréstimos por Mês</h3>
          <LineChart width={550} height={220} data={data}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="emprestimos" stroke="#16a34a" strokeWidth={2} />
          </LineChart>
        </div>

        <div className="activity-card">
          <h3>Atividades Recentes</h3>
          <ul>
            <li className="returned">📗 Livro devolvido: <strong>Dom Casmurro</strong></li>
            <li className="loan">🔄 Empréstimo: <strong>O Alquimista</strong></li>
            <li className="user">👤 Novo usuário: <strong>Ana Silva</strong></li>
            <li className="late">⚠️ Devolução atrasada: <strong>João B.</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
