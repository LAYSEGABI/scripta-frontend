import React, { useState, useMemo, useContext } from 'react';
import { Trash2, Edit, Search, UserPlus, Save, X, AlertCircle } from 'lucide-react';
// IMPORTANTE: Verifique se o caminho está correto
import { SistemaContext } from '../context/SistemaContext'; 
import '../styles/usuarios.css';

// --- FUNÇÕES UTILITÁRIAS ---
const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf === '') return false;
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  return true;
};

const mascaraCPF = (valor) => {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const formatarDataBR = (dataISO) => {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
};

export default function Usuarios() {
  // Pegando a função do contexto
  const { usuarios, adicionarUsuario } = useContext(SistemaContext); 
  
  const [formulario, setFormulario] = useState({
    id: null, nome: '', email: '', cpf: '', dataNascimento: '', status: 'Ativo',
  });
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [erroValidacao, setErroValidacao] = useState('');

  const usuariosFiltrados = useMemo(() => {
    if (!termoPesquisa) return usuarios;
    const termo = termoPesquisa.toLowerCase();
    return usuarios.filter(usuario =>
      usuario.nome.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo) ||
      usuario.cpf.includes(termo)
    );
  }, [usuarios, termoPesquisa]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cpf') { value = mascaraCPF(value); setErroValidacao(''); }
    setFormulario({ ...formulario, [name]: value });
  };

  // --- A FUNÇÃO DE ENVIO CORRIGIDA ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    console.log("Botão Clicado! Dados:", formulario); // Debug

    setErroValidacao('');

    // Validação de CPF
    if (!validarCPF(formulario.cpf)) { 
        setErroValidacao('O CPF informado é inválido.'); 
        return; 
    }

    // Tenta cadastrar no Backend via Contexto
    // Passamos o formulário inteiro. O UserService vai limpar o CPF lá dentro.
    const sucesso = await adicionarUsuario(formulario);

    if (sucesso) {
        alert("Usuário salvo com sucesso!");
        resetFormulario();
    } else {
        setErroValidacao("Erro ao salvar no servidor. Verifique se o Back-end está rodando.");
    }
  };

  const iniciarEdicao = (usuario) => {
    setFormulario(usuario);
    setErroValidacao('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const resetFormulario = () => {
    setFormulario({ id: null, nome: '', email: '', cpf: '', dataNascimento: '', status: 'Ativo' });
    setErroValidacao('');
  };

  // Função placeholder para excluir (ainda não conectada ao Java)
  const excluirUsuario = (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
      alert("Funcionalidade de exclusão ainda não implementada no Back-end.");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Ativo': return 'badge-ativo';
      case 'Inativo': return 'badge-inativo';
      case 'Suspenso': return 'badge-suspenso';
      default: return 'badge-inativo';
    }
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-content">
        <header>
          <div className="header-titulo">
            <UserPlus className="icone-titulo" size={32} />
            <h1>Gerenciamento de Usuários</h1>
          </div>
          <p className="header-subtitulo">Cadastre e gerencie o acesso dos usuários do sistema.</p>
        </header>

        {/* --- CARD DE CADASTRO --- */}
        <div className="card">
          <div className="card-header">
            {formulario.id ? <Edit size={24} style={{ color: '#f59e0b' }} /> : <UserPlus size={24} style={{ color: '#2563eb' }} />}
            <span>{formulario.id ? 'Editar Usuário' : 'Novo Cadastro'}</span>
          </div>

          {/* O formulário deve ter o onSubmit apontando para handleSubmit */}
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-grid">
              
              <div className="form-group">
                <label>Nome Completo</label>
                <input type="text" name="nome" value={formulario.nome} onChange={handleChange} required className="form-input" placeholder="Ex: João Silva" />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formulario.email} onChange={handleChange} required className="form-input" placeholder="email@exemplo.com" />
              </div>

              <div className="form-group">
                <label>CPF</label>
                <input type="text" name="cpf" value={formulario.cpf} onChange={handleChange} maxLength="14" required className={`form-input ${erroValidacao ? 'erro' : ''}`} placeholder="000.000.000-00" />
              </div>

              <div className="form-group">
                <label>Data de Nascimento</label>
                <input type="date" name="dataNascimento" value={formulario.dataNascimento} onChange={handleChange} className="form-input" />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formulario.status} onChange={handleChange} className="form-select">
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Suspenso">Suspenso</option>
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
              <button type="submit" className="btn btn-primary">
                <Save size={18} />
                {formulario.id ? 'Salvar Alterações' : 'Cadastrar'}
              </button>
              
              {formulario.id && (
                <button type="button" onClick={resetFormulario} className="btn btn-secondary">
                  <X size={18} />
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- LISTAGEM --- */}
        <div className="card">
          <div className="pesquisa-wrapper">
            <h2 className="titulo-secao">
              Usuários Cadastrados <span className="contador-registros">({usuariosFiltrados.length})</span>
            </h2>
            <div className="input-pesquisa-container">
              <Search className="icone-pesquisa" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou email..."
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className="input-pesquisa"
              />
            </div>
          </div>

          <div className="tabela-container">
            {usuarios.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <p>Nenhum registro encontrado.</p>
              </div>
            ) : (
              <table className="tabela-usuarios">
                <thead>
                  <tr>
                    <th>Nome / Email</th>
                    <th>CPF</th>
                    <th>Nascimento</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="celula-info">
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{usuario.nome}</div>
                        <small>{usuario.email}</small>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#475569', fontSize: '0.9rem' }}>
                        {usuario.cpf}
                      </td>
                      {/* Data de nascimento pode vir vazia do Java se não mapeamos, tratei aqui */}
                      <td>{usuario.dataNascimento ? formatarDataBR(usuario.dataNascimento) : '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${getStatusColor(usuario.status)}`}>
                          {usuario.status || 'Ativo'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => iniciarEdicao(usuario)} className="btn-icon editar" title="Editar">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => excluirUsuario(usuario.id, usuario.nome)} className="btn-icon excluir" title="Excluir">
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