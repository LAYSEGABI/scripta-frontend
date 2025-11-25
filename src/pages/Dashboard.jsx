import React, { useEffect, useState, useMemo, useContext } from "react";
import { Book, RefreshCcw, AlertTriangle, UserX, Clock, CheckCircle } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { SistemaContext } from "../context/SistemaContext"; // Ajuste o caminho se necessário
import "../styles/dashboard.css";

const Dashboard = () => {
  // 1. Puxa dados globais
  const { livros, usuarios } = useContext(SistemaContext);

  // 2. Carrega Empréstimos do LocalStorage (igual fizemos na tela de Empréstimos)
  const [emprestimos, setEmprestimos] = useState([]);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("historicoEmprestimos");
    if (dadosSalvos) {
      setEmprestimos(JSON.parse(dadosSalvos));
    }
  }, []);

  // 3. Cálculos dos Cards (KPIs)
  const stats = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];

    // Total de livros (Simples: tamanho do array)
    const totalLivros = livros.length;

    // Empréstimos Ativos (Status 'Ativo')
    const ativos = emprestimos.filter(e => e.status === 'Ativo').length;

    // Livros Atrasados (Ativos + Data prevista menor que hoje)
    const atrasados = emprestimos.filter(e => e.status === 'Ativo' && e.dataDevolucaoPrevista < hoje).length;

    // Alunos Penalizados (Lógica: Contar quantos usuários únicos têm livros atrasados)
    // Se quiser algo mais complexo, precisaria de um campo 'status' no usuário, mas isso serve por hora.
    const idsComAtraso = emprestimos
      .filter(e => e.status === 'Ativo' && e.dataDevolucaoPrevista < hoje)
      .map(e => e.usuarioId);
    const penalizados = new Set(idsComAtraso).size; // Set remove duplicatas

    return { totalLivros, ativos, atrasados, penalizados };
  }, [livros, emprestimos]);

  // 4. Lógica do Gráfico (Agrupar empréstimos por mês)
  const chartData = useMemo(() => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    // Cria estrutura base com 0
    const dados = meses.map(m => ({ name: m, emprestimos: 0 }));

    emprestimos.forEach(emp => {
      if (emp.dataEmprestimo) {
        const mesIndex = new Date(emp.dataEmprestimo).getMonth(); // 0 = Jan, 1 = Fev...
        // Incrementa o contador daquele mês
        if (dados[mesIndex]) {
          dados[mesIndex].emprestimos += 1;
        }
      }
    });

    // Opcional: Cortar para mostrar apenas até o mês atual ou os últimos 6 meses
    // Por enquanto retorna o ano todo para ficar bonito no gráfico
    return dados;
  }, [emprestimos]);

  // 5. Atividades Recentes (Pegar os últimos 5 empréstimos baseados no ID ou Data)
  const atividadesRecentes = useMemo(() => {
    // Clona o array e inverte para pegar os últimos adicionados
    const ultimos = [...emprestimos].reverse().slice(0, 5);

    return ultimos.map(emp => {
      const nomeUsuario = usuarios.find(u => u.id === emp.usuarioId)?.nome || "Usuário Desconhecido";
      const tituloLivro = livros.find(l => l.id === emp.livroId)?.titulo || "Livro Desconhecido";
      const hoje = new Date().toISOString().split('T')[0];
      
      let tipo = "loan"; // Padrão: Empréstimo novo
      let texto = `Empréstimo: ${tituloLivro}`;
      
      if (emp.status === 'Devolvido') {
        tipo = "returned";
        texto = `Livro devolvido: ${tituloLivro}`;
      } else if (emp.dataDevolucaoPrevista < hoje) {
        tipo = "late";
        texto = `Atraso: ${nomeUsuario}`;
      }

      return { id: emp.id, tipo, texto, usuario: nomeUsuario };
    });
  }, [emprestimos, usuarios, livros]);

  return (
    <div className="dashboard dashboard-container">
      <h1 className="dashboard-title">Dashboard Gerencial</h1>

      {/* Cards superiores com DADOS REAIS */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="icon-wrapper green">
            <Book size={22} />
          </div>
          <div className="card-info">
            <p>Total de Livros</p>
            <h2>{stats.totalLivros}</h2>
          </div>
        </div>

        <div className="card">
          <div className="icon-wrapper blue">
            <RefreshCcw size={22} />
          </div>
          <div className="card-info">
            <p>Empréstimos Ativos</p>
            <h2>{stats.ativos}</h2>
          </div>
        </div>

        <div className="card">
          <div className="icon-wrapper orange">
            <UserX size={22} />
          </div>
          <div className="card-info">
            <p>Alunos com Atraso</p>
            <h2>{stats.penalizados}</h2>
          </div>
        </div>

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

      {/* Gráfico e atividades */}
      <div className="dashboard-content">
        <div className="chart-card">
          <h3>Volume de Empréstimos (Anual)</h3>
          {/* ResponsiveContainer faz o gráfico se ajustar ao tamanho da div pai */}
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="emprestimos" 
                stroke="#16a34a" 
                strokeWidth={3} 
                dot={{ r: 4, fill: "#16a34a", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }} 
              />
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
                  
                  {/* Renderiza o texto com HTML seguro simples */}
                  <span dangerouslySetInnerHTML={{ 
                    __html: item.texto.replace(/: (.*)/, ': <strong>$1</strong>') 
                  }} />
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