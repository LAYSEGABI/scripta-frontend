import React, { useEffect, useState, useMemo, useContext } from "react";
import { Book, RefreshCcw, AlertTriangle, UserX, CheckCircle, Layers } from "lucide-react"; // Adicionei 'Layers'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { SistemaContext } from "../context/SistemaContext"; 
import "../styles/dashboard.css";

const Dashboard = () => {
  const { livros, usuarios } = useContext(SistemaContext);
  const [emprestimos, setEmprestimos] = useState([]);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("historicoEmprestimos");
    if (dadosSalvos) {
      setEmprestimos(JSON.parse(dadosSalvos));
    }
  }, []);

  // --- CÁLCULOS ESTATÍSTICOS ---
  const stats = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];

    // 1. Total de Títulos (Cadastros únicos)
    const totalTitulos = livros.length;

    // 2. Total de Exemplares (Soma da quantidade de cada livro)
    // Verifica 'quantidadeTotal' ou 'quantidade' dependendo de como veio do backend
    const totalExemplares = livros.reduce((acc, livro) => {
        const qtd = parseInt(livro.quantidadeTotal) || parseInt(livro.quantidade) || 0;
        return acc + qtd;
    }, 0);

    const ativos = emprestimos.filter(e => e.status === 'Ativo').length;
    const atrasados = emprestimos.filter(e => e.status === 'Ativo' && e.dataDevolucaoPrevista < hoje).length;
    
    const idsComAtraso = emprestimos
      .filter(e => e.status === 'Ativo' && e.dataDevolucaoPrevista < hoje)
      .map(e => e.usuarioId);
    const penalizados = new Set(idsComAtraso).size;

    return { totalTitulos, totalExemplares, ativos, atrasados, penalizados };
  }, [livros, emprestimos]);

  // --- DADOS DO GRÁFICO ---
  const chartData = useMemo(() => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const dados = meses.map(m => ({ name: m, emprestimos: 0 }));

    emprestimos.forEach(emp => {
      if (emp.dataEmprestimo) {
        const mesIndex = new Date(emp.dataEmprestimo).getMonth();
        if (dados[mesIndex]) {
          dados[mesIndex].emprestimos += 1;
        }
      }
    });
    return dados;
  }, [emprestimos]);

  // --- ATIVIDADES RECENTES ---
  const atividadesRecentes = useMemo(() => {
    const ultimos = [...emprestimos].reverse().slice(0, 5);

    return ultimos.map(emp => {
      const nomeUsuario = usuarios.find(u => u.id === emp.usuarioId)?.nome || "Usuário Desconhecido";
      const tituloLivro = livros.find(l => l.id === emp.livroId)?.titulo || "Livro Desconhecido";
      const hoje = new Date().toISOString().split('T')[0];
      
      let tipo = "loan";
      let texto = `Empréstimo: ${tituloLivro}`;
      
      if (emp.status === 'Devolvido') {
        tipo = "returned";
        texto = `Livro devolvido: ${tituloLivro}`;
      } else if (emp.dataDevolucaoPrevista < hoje) {
        tipo = "late";
        texto = `Atraso: ${nomeUsuario}`;
      }

      return { id: emp.id, tipo, texto };
    });
  }, [emprestimos, usuarios, livros]);

  return (
    <div className="dashboard dashboard-container">
      <h1 className="dashboard-title">Dashboard Gerencial</h1>

      {/* Cards superiores */}
      <div className="dashboard-cards">
        
        {/* CARD 1: Títulos Únicos */}
        <div className="card">
          <div className="icon-wrapper green">
            <Book size={22} />
          </div>
          <div className="card-info">
            <p>Títulos Diferentes</p>
            <h2>{stats.totalTitulos}</h2>
          </div>
        </div>

        {/* CARD 2 (NOVO): Total de Exemplares Físicos */}
        <div className="card">
          <div className="icon-wrapper purple">
            <Layers size={22} />
          </div>
          <div className="card-info">
            <p>Acervo Total (Livros)</p>
            <h2>{stats.totalExemplares}</h2>
          </div>
        </div>

        {/* CARD 3: Empréstimos */}
        <div className="card">
          <div className="icon-wrapper blue">
            <RefreshCcw size={22} />
          </div>
          <div className="card-info">
            <p>Empréstimos Ativos</p>
            <h2>{stats.ativos}</h2>
          </div>
        </div>

        {/* CARD 4: Atrasos */}
        <div className="card">
          <div className="icon-wrapper red">
            <AlertTriangle size={22} />
          </div>
          <div className="card-info">
            <p>Livros Atrasados</p>
            <h2>{stats.atrasados}</h2>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="chart-card">
          <h3>Volume de Empréstimos (Anual)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="emprestimos" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: "#16a34a", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="activity-card">
          <h3>Atividades Recentes</h3>
          {atividadesRecentes.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Nenhuma atividade registrada.</p>
          ) : (
            <ul>
              {atividadesRecentes.map((item) => (
                <li key={item.id} className={item.tipo}>
                  {item.tipo === 'returned' && <CheckCircle size={14} style={{ display:'inline', marginRight: 6 }} />}
                  {item.tipo === 'loan' && <RefreshCcw size={14} style={{ display:'inline', marginRight: 6 }} />}
                  {item.tipo === 'late' && <AlertTriangle size={14} style={{ display:'inline', marginRight: 6 }} />}
                  <span dangerouslySetInnerHTML={{ __html: item.texto.replace(/: (.*)/, ': <strong>$1</strong>') }} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;