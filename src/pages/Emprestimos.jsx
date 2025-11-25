import React, { useState, useMemo, useEffect, useRef, useContext, useCallback} from 'react';
import { Trash2, Edit, Search, BookOpen, Save, X, AlertCircle, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import { SistemaContext } from '../context/SistemaContext'; 
import '../styles/usuarios.css';

// --- COMPONENTE INTERNO: SELECT PESQUISÁVEL ---
const SelectPesquisavel = ({ label, options, value, onChange, placeholder, displayField }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    if (value) {
      const selectedOption = options.find(opt => opt.id === parseInt(value));
      if (selectedOption) setSearchTerm(selectedOption[displayField]);
    } else {
      setSearchTerm('');
    }
  }, [value, options, displayField]);

  const filteredOptions = options.filter(opt => 
    opt[displayField].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option.id);
    setSearchTerm(option[displayField]);
    setIsOpen(false);
  };

  return (
    <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
      <label>{label}</label>
      <div className="relative">
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') onChange('');
          }}
          onClick={() => setIsOpen(true)}
        />
        <ChevronDown size={16} style={{ position: 'absolute', right: '10px', top: '12px', color: '#a0aec0', pointerEvents: 'none' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, 
          backgroundColor: 'white', border: '1px solid #cbd5e0', 
          borderRadius: '6px', marginTop: '4px', maxHeight: '200px', 
          overflowY: 'auto', zIndex: 50, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt)}
                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f7fafc' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#eff6ff'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                {opt[displayField]}
                
                {opt.disponivel !== undefined && (
                   <span style={{
                     fontSize: '0.8rem', 
                     color: opt.disponivel > 0 ? '#166534' : '#ef4444', 
                     marginLeft: '6px', 
                     fontWeight: 500
                   }}>
                     (Estoque Restante: {opt.disponivel})
                   </span>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: '8px 12px', color: '#a0aec0' }}>Nenhum resultado encontrado.</div>
          )}
        </div>
      )}
    </div>
  );
};

// --- HELPERS GERAIS ---
const formatarDataBR = (dataISO) => {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
};

const getHojeISO = () => new Date().toISOString().split('T')[0];

const calcularDataDevolucao = (dataInicio) => {
  if (!dataInicio) return '';
  const data = new Date(dataInicio);
  data.setDate(data.getDate() + 30);
  return data.toISOString().split('T')[0];
};

// --- COMPONENTE PRINCIPAL ---
export default function Emprestimos() {
  
  // 1. CONTEXTO: Mantemos apenas usuarios e livros vindo do sistema global
  // Removemos 'emprestimos' e 'setEmprestimos' daqui para criar localmente com persistência
  const { usuarios, livros } = useContext(SistemaContext);

  // 1.1 ESTADO LOCAL COM PERSISTÊNCIA (LOCALSTORAGE)
  // Ao iniciar, tenta ler do navegador. Se não houver, começa array vazio.
  const [emprestimos, setEmprestimos] = useState(() => {
    const dadosSalvos = localStorage.getItem("historicoEmprestimos");
    return dadosSalvos ? JSON.parse(dadosSalvos) : [];
  });

  // 1.2 EFEITO PARA SALVAR AUTOMATICAMENTE
  // Toda vez que 'emprestimos' mudar, salva no navegador
  useEffect(() => {
    localStorage.setItem("historicoEmprestimos", JSON.stringify(emprestimos));
  }, [emprestimos]);


  const [formulario, setFormulario] = useState({
    id: null,
    usuarioId: '',
    livroId: '',
    dataEmprestimo: getHojeISO(),
    dataDevolucaoPrevista: calcularDataDevolucao(getHojeISO()),
    status: 'Ativo',
  });

  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [erroValidacao, setErroValidacao] = useState('');

  // 2. EFEITO: Recalcula data de devolução se a data de empréstimo mudar
  useEffect(() => {
    if (formulario.dataEmprestimo) {
      const novaDataDevolucao = calcularDataDevolucao(formulario.dataEmprestimo);
      setFormulario(prev => ({ ...prev, dataDevolucaoPrevista: novaDataDevolucao }));
    }
  }, [formulario.dataEmprestimo]);

  // 3. CALCULO DE ESTOQUE DISPONÍVEL
 const getEstoqueDisponivel = useCallback((livroId, emprestimoIdParaIgnorar = null) => {
  const livro = livros.find(l => l.id === parseInt(livroId));
  if (!livro) return 0;

  const emprestados = emprestimos.filter(e => 
    e.livroId === parseInt(livroId) && 
    (e.status === 'Ativo' || e.status === 'Atrasado') &&
    e.id !== emprestimoIdParaIgnorar 
  ).length;

  return livro.quantidade - emprestados;
}, [livros, emprestimos]);

  // 4. LISTA DE LIVROS INTELIGENTE (Para o Select)
 const livrosComEstoqueCalculado = useMemo(() => {
  return livros.map(livro => ({
    ...livro,
    disponivel: getEstoqueDisponivel(livro.id, formulario.id)
  }));
}, [ formulario.id, livros, getEstoqueDisponivel]);

  // 5. LISTA DE EMPRÉSTIMOS PROCESSADA (Status Atrasado Dinâmico)
  const listaProcessada = useMemo(() => {
    const hoje = getHojeISO();
    return emprestimos.map(emp => {
      let statusCalculado = emp.status;
      if (emp.status === 'Ativo' && emp.dataDevolucaoPrevista < hoje) {
        statusCalculado = 'Atrasado';
      }
      return { ...emp, statusExibicao: statusCalculado };
    });
  }, [emprestimos]);

  // --- HANDLERS ---
  const handleChange = (name, value) => {
    setFormulario(prev => ({ ...prev, [name]: value }));
    setErroValidacao('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErroValidacao('');

    if (!formulario.usuarioId || !formulario.livroId) {
      setErroValidacao('Selecione um usuário e um livro.');
      return;
    }

    const emprestimosAtivosDoUsuario = emprestimos.filter(emp => 
      emp.usuarioId === parseInt(formulario.usuarioId) && 
      (emp.status === 'Ativo' || emp.status === 'Atrasado') &&
      emp.id !== formulario.id
    );

    if (formulario.status === 'Ativo' && emprestimosAtivosDoUsuario.length >= 5) {
      setErroValidacao(`Este usuário já possui 5 empréstimos pendentes. É necessário devolver um livro antes.`);
      return;
    }

    const disponivel = getEstoqueDisponivel(formulario.livroId, formulario.id);
    if (formulario.status === 'Ativo' && disponivel <= 0) {
      const livroNome = livros.find(l => l.id === parseInt(formulario.livroId))?.titulo;
      setErroValidacao(`O livro "${livroNome}" não está disponível no estoque.`);
      return;
    }

    const novoEmprestimo = { 
      ...formulario, 
      usuarioId: parseInt(formulario.usuarioId),
      livroId: parseInt(formulario.livroId)
    };

    if (formulario.id) {
      setEmprestimos(emprestimos.map(e => e.id === novoEmprestimo.id ? novoEmprestimo : e));
    } else {
      const novoId = emprestimos.length > 0 ? Math.max(...emprestimos.map(e => e.id)) + 1 : 1;
      setEmprestimos([...emprestimos, { ...novoEmprestimo, id: novoId }]);
    }
    resetFormulario();
  };

  const iniciarEdicao = (emp) => {
    setFormulario({ ...emp, status: emp.status });
    setErroValidacao('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const excluirEmprestimo = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      setEmprestimos(emprestimos.filter(e => e.id !== id));
    }
  };

  const resetFormulario = () => {
    setFormulario({ 
      id: null, 
      usuarioId: '', 
      livroId: '', 
      dataEmprestimo: getHojeISO(), 
      dataDevolucaoPrevista: calcularDataDevolucao(getHojeISO()),
      status: 'Ativo' 
    });
    setErroValidacao('');
  };

  // Helpers Visuais
  const getStatusColor = (status) => {
    switch(status) {
      case 'Ativo': return 'badge-ativo';
      case 'Devolvido': return 'badge-inativo';
      case 'Atrasado': return 'badge-suspenso';
      default: return 'badge-inativo';
    }
  };

  const getNomeUsuario = (id) => usuarios.find(u => u.id === id)?.nome || 'Usuário Removido';
  const getTituloLivro = (id) => livros.find(l => l.id === id)?.titulo || 'Livro Removido';

  // Filtro da Tabela
  const emprestimosFiltrados = listaProcessada.filter(emp => {
    const termo = termoPesquisa.toLowerCase();
    const usuario = usuarios.find(u => u.id === parseInt(emp.usuarioId));
    const livro = livros.find(l => l.id === parseInt(emp.livroId));
    return (
      (usuario && usuario.nome.toLowerCase().includes(termo)) ||
      (livro && livro.titulo.toLowerCase().includes(termo)) ||
      emp.statusExibicao.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="usuarios-container">
      <div className="usuarios-content">
        <header>
          <div className="header-titulo">
            <BookOpen className="icone-titulo" size={32} />
            <h1>Controle de Empréstimos</h1>
          </div>
          <p className="header-subtitulo">Gerencie a saída e devolução de livros do acervo.</p>
        </header>

        {/* --- CARD FORMULÁRIO --- */}
        <div className="card" style={{ overflow: 'visible' }}>
          <div className="card-header">
            {formulario.id ? <Edit size={24} style={{ color: '#f59e0b' }} /> : <BookOpen size={24} style={{ color: '#2563eb' }} />}
            <span>{formulario.id ? 'Editar Empréstimo' : 'Novo Empréstimo'}</span>
          </div>

          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-grid">
              
              <SelectPesquisavel 
                label="Usuário"
                placeholder="Busque o usuário..."
                options={usuarios}
                displayField="nome"
                value={formulario.usuarioId}
                onChange={(val) => handleChange('usuarioId', val)}
              />

              <SelectPesquisavel 
                label="Livro"
                placeholder="Busque o livro..."
                options={livrosComEstoqueCalculado}
                displayField="titulo"
                value={formulario.livroId}
                onChange={(val) => handleChange('livroId', val)}
              />

              <div className="form-group">
                <label>Data Empréstimo</label>
                <input 
                  type="date" 
                  name="dataEmprestimo" 
                  value={formulario.dataEmprestimo} 
                  onChange={(e) => handleChange('dataEmprestimo', e.target.value)} 
                  required 
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label>Previsão Devolução (Padrão: 30 dias)</label>
                <input 
                  type="date" 
                  name="dataDevolucaoPrevista" 
                  value={formulario.dataDevolucaoPrevista} 
                  onChange={(e) => handleChange('dataDevolucaoPrevista', e.target.value)} 
                  required 
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select 
                  name="status" 
                  value={formulario.status} 
                  onChange={(e) => handleChange('status', e.target.value)} 
                  className="form-select"
                >
                  <option value="Ativo">Ativo (Em Curso)</option>
                  <option value="Devolvido">Devolvido (Finalizado)</option>
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
                {formulario.id ? 'Salvar Alterações' : 'Registrar Saída'}
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
              Empréstimos Registrados 
              <span className="contador-registros">({emprestimosFiltrados.length})</span>
            </h2>
            <div className="input-pesquisa-container">
              <Search className="icone-pesquisa" />
              <input
                type="text"
                placeholder="Pesquisar usuário, livro ou status..."
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className="input-pesquisa"
              />
            </div>
          </div>

          <div className="tabela-container">
            {emprestimosFiltrados.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <p>Nenhum registro encontrado.</p>
              </div>
            ) : (
              <table className="tabela-usuarios">
                <thead>
                  <tr>
                    <th>Usuário / Livro</th>
                    <th>Datas</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {emprestimosFiltrados.map((emp) => (
                    <tr key={emp.id}>
                      <td className="celula-info">
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {getNomeUsuario(emp.usuarioId)}
                        </div>
                        <small className="flex items-center gap-1">
                           <BookOpen size={12} style={{ display: 'inline', marginRight: '4px' }}/> 
                           {getTituloLivro(emp.livroId)}
                        </small>
                      </td>
                      
                      <td style={{ fontSize: '0.9rem', color: '#475569' }}>
                        <div><span style={{fontWeight: 600}}>Saída:</span> {formatarDataBR(emp.dataEmprestimo)}</div>
                        <div style={{
                          color: emp.statusExibicao === 'Atrasado' ? '#dc2626' : 'inherit',
                          fontWeight: emp.statusExibicao === 'Atrasado' ? 'bold' : 'normal'
                        }}>
                          Prev: {formatarDataBR(emp.dataDevolucaoPrevista)}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${getStatusColor(emp.statusExibicao)}`}>
                          {emp.statusExibicao === 'Atrasado' && <Clock size={12} style={{marginRight: 4, display: 'inline'}} />}
                          {emp.statusExibicao === 'Devolvido' && <CheckCircle size={12} style={{marginRight: 4, display: 'inline'}} />}
                          {emp.statusExibicao}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => iniciarEdicao(emp)} className="btn-icon editar" title="Editar / Devolver">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => excluirEmprestimo(emp.id)} className="btn-icon excluir" title="Excluir Registro">
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