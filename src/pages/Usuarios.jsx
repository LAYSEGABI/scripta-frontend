import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  Trash2,
  Search,
  UserPlus,
  Save,
  X,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { SistemaContext } from "../context/SistemaContext";
import { UserService } from "../services/UserServices"; 
import "../styles/usuarios.css";

export default function Usuarios() {
  const { usuarios, carregarUsuarios } = useContext(SistemaContext);

  const [formulario, setFormulario] = useState({
    nome: "",
    matricula: "",
    status: "ATIVO",
    senha: "",
    tipoDeConta: "ALUNO",
  });

  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [erroValidacao, setErroValidacao] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (carregarUsuarios) {
      carregarUsuarios();
    }
  }, [carregarUsuarios]);

  const usuariosFiltrados = useMemo(() => {
    if (!termoPesquisa) return usuarios;
    const termo = termoPesquisa.toLowerCase();
    return usuarios.filter(
      (usuario) =>
        usuario.nome.toLowerCase().includes(termo) ||
        (usuario.matricula && usuario.matricula.toLowerCase().includes(termo))
    );
  }, [usuarios, termoPesquisa]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  // --- MODO APENAS CADASTRO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroValidacao("");
    setLoading(true);

    try {
      if (formulario.senha && formulario.senha.length > 0 && formulario.senha.length < 3) {
        setErroValidacao("A senha é muito curta.");
        setLoading(false);
        return;
      }

      // CRIAÇÃO DIRETA (Ignora qualquer ID)
      await UserService.criarUsuario(formulario);
      alert("Usuário cadastrado com sucesso!");

      resetFormulario();
      if (carregarUsuarios) await carregarUsuarios();

    } catch (error) {
      setErroValidacao("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id, nome) => {
    if (window.confirm(`Excluir "${nome}"?`)) {
      try {
        await UserService.deletarUsuario(id);
        alert("Excluído!");
        if (carregarUsuarios) await carregarUsuarios();
      } catch (error) {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  const resetFormulario = () => {
    setFormulario({
      nome: "",
      matricula: "",
      status: "ATIVO",
      senha: "",
      tipoDeConta: "ALUNO",
    });
    setErroValidacao("");
  };

  const getStatusColor = (status) => {
    const s = status ? status.toUpperCase() : "ATIVO";
    return s === "ATIVO" ? "badge-ativo" : "badge-inativo";
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-content">
        <header>
          <div className="header-titulo">
            <UserPlus className="icone-titulo" size={32} />
            <h1>Gerenciamento de Usuários</h1>
          </div>
          <div className="header-actions">
            <button
              onClick={() => carregarUsuarios && carregarUsuarios()}
              className="btn-icon"
              title="Recarregar Lista"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
        </header>

        {/* --- CARD DE CADASTRO --- */}
        <div className="card">
          <div className="card-header">
            <UserPlus size={24} style={{ color: "#2563eb" }} />
            <span>Novo Usuário</span>
          </div>

          <form onSubmit={handleSubmit} className="form-container" autoComplete="off">
            <div className="form-grid">
              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  name="nome"
                  value={formulario.nome}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Ex: Maria Silva"
                />
              </div>
              <div className="form-group">
                <label>Matrícula / Login</label>
                <input
                  type="text"
                  name="matricula"
                  value={formulario.matricula}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Ex: 2023001"
                />
              </div>
              <div className="form-group">
                <label>Tipo de Conta</label>
                <select
                  name="tipoDeConta"
                  value={formulario.tipoDeConta}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="ALUNO">Aluno</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="BIBLIOTECARIO">Bibliotecário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  name="senha"
                  value={formulario.senha}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Senha (Padrão: 123456)"
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formulario.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>
            </div>

            {erroValidacao && (
              <div className="msg-erro">
                <AlertCircle size={16} />
                {erroValidacao}
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={18} />
                {loading ? "Salvando..." : "Cadastrar"}
              </button>
              
              <button type="button" onClick={resetFormulario} className="btn btn-secondary">
                  <X size={18} /> Limpar
              </button>
            </div>
          </form>
        </div>

        {/* --- LISTAGEM (Sem botão editar) --- */}
        <div className="card">
          <div className="pesquisa-wrapper">
            <h2 className="titulo-secao">Usuários Cadastrados ({usuariosFiltrados.length})</h2>
            <div className="input-pesquisa-container">
              <Search className="icone-pesquisa" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className="input-pesquisa"
              />
            </div>
          </div>
          <div className="tabela-container">
            {usuarios.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                <p>Nenhum usuário encontrado.</p>
              </div>
            ) : (
              <table className="tabela-usuarios">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Matrícula</th>
                    <th>Tipo</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                    <th style={{ textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="celula-info"><div style={{ fontWeight: 600 }}>{usuario.nome}</div></td>
                      <td style={{ fontFamily: "monospace" }}>{usuario.matricula || usuario.cpf}</td>
                      <td><span style={{ fontSize: "0.85rem", color: "#6366f1", fontWeight: "bold" }}>{usuario.tipoDeConta}</span></td>
                      <td style={{ textAlign: "center" }}><span className={`badge ${getStatusColor(usuario.status)}`}>{usuario.status || "ATIVO"}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          
                          {/* Botão de editar foi removido */}
                          
                          <button onClick={() => handleExcluir(usuario.id, usuario.nome)} className="btn-icon excluir" title="Excluir">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}