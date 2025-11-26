import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Trash2, Edit, Search, UserPlus, Save, X, AlertCircle, RefreshCcw } from 'lucide-react';
import { SistemaContext } from '../context/SistemaContext';
import { UserService } from '../services/UserServices'; // Confirme se o arquivo é UserServices.js ou UserService.js
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
  if (!dataISO) return '-';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
};

export default function Usuarios() {
  const { usuarios, adicionarUsuario, carregarUsuarios } = useContext(SistemaContext);
  
  const [formulario, setFormulario] = useState({
    id: null, nome: '', email: '', cpf: '', dataNascimento: '', status: 'Ativo', senha: ''
  });
  
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [erroValidacao, setErroValidacao] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega a lista ao abrir a tela
  useEffect(() => {
    if (carregarUsuarios) {
        carregarUsuarios();
    }
  }, [carregarUsuarios]);

  const usuariosFiltrados = useMemo(() => {
    if (!termoPesquisa) return usuarios;
    const termo = termoPesquisa.toLowerCase();
    return usuarios.filter(usuario =>
      usuario.nome.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo) ||
      (usuario.cpf && usuario.cpf.includes(termo)) ||
      (usuario.matricula && usuario.matricula.includes(termo))
    );
  }, [usuarios, termoPesquisa]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cpf') { value = mascaraCPF(value); setErroValidacao(''); }
    setFormulario({ ...formulario, [name]: value });
  };

  // --- SALVAR ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroValidacao('');
    setLoading(true);

    try {
        // CORREÇÃO: Validação de CPF usando a função utilitária
        if (!validarCPF(formulario.cpf)) { 
            setErroValidacao('CPF inválido.'); 
            setLoading(false);
            return; 
        }

        const sucesso = await adicionarUsuario(formulario);

        if (sucesso) {
            alert("Operação realizada com sucesso!");
            resetFormulario();
            if (carregarUsuarios) await carregarUsuarios();
        } else {
            setErroValidacao("Erro ao conectar com o servidor. Tente novamente.");
        }
    } catch (error) {
        setErroValidacao("Erro inesperado: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  // --- EXCLUIR ---
  const handleExcluir = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
      try {
        await UserService.deletarUsuario(id);
        alert("Usuário excluído!");
        if (carregarUsuarios) await carregarUsuarios();
        else window.location.reload();
      } catch (error) {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  const iniciarEdicao = (usuario) => {
    setFormulario({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email || '',
        cpf: usuario.cpf || usuario.matricula || '',
        dataNascimento: usuario.dataNascimento || '',
        status: usuario.status || 'Ativo',
        senha: '' 
    });
    setErroValidacao('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const resetFormulario = () => {
    setFormulario({ id: null, nome: '', email: '', cpf: '', dataNascimento: '', status: 'Ativo', senha: '' });
    setErroValidacao('');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Ativo': return 'badge-ativo';
      case 'Inativo': return 'badge-inativo';
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
          <div className="header-actions">
             <button onClick={() => carregarUsuarios && carregarUsuarios()} className="btn-icon" title="Recarregar Lista">
                <RefreshCcw size={20} />
             </button>
          </div>
        </header>

        <div className="card">
          <div className="card-header">
            {formulario.id ? <Edit size={24} style={{ color: '#f59e0b' }} /> : <UserPlus size={24} style={{ color: '#2563eb' }} />}
            <span>{formulario.id ? 'Editar Usuário' : 'Novo Cadastro'}</span>
          </div>

          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-grid">
              <div className="form-group">
                <label>Nome Completo</label>
                <input type="text" name="nome" value={formulario.nome} onChange={handleChange} required className="form-input" />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formulario.email} onChange={handleChange} className="form-input" />
              </div>

              <div className="form-group">
                <label>CPF</label>
                <input type="text" name="cpf" value={formulario.cpf} onChange={handleChange} maxLength="14" required className="form-input" />
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
                {loading ? 'Salvando...' : (formulario.id ? 'Salvar Alterações' : 'Cadastrar')}
              </button>
              
              {formulario.id && (
                <button type="button" onClick={resetFormulario} className="btn btn-secondary">
                  <X size={18} /> Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="pesquisa-wrapper">
            <h2 className="titulo-secao">
              Usuários Cadastrados ({usuariosFiltrados.length})
            </h2>
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
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                <p>Nenhum usuário encontrado.</p>
                <p style={{fontSize: '0.9rem'}}>Verifique se o Back-end está rodando e se a porta está correta.</p>
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
                        <div style={{ fontWeight: 600 }}>{usuario.nome}</div>
                        <small>{usuario.email}</small>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {usuario.cpf || usuario.matricula}
                      </td>
                      <td>{formatarDataBR(usuario.dataNascimento)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${getStatusColor(usuario.status || 'Ativo')}`}>
                          {usuario.status || 'Ativo'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => iniciarEdicao(usuario)} className="btn-icon editar">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleExcluir(usuario.id, usuario.nome)} className="btn-icon excluir">
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