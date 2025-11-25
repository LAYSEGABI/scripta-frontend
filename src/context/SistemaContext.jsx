import React, { createContext, useState, useEffect, useContext } from 'react';
import { BookService } from '../services/BookService';
import { UserService } from '../services/UserServices'; // Verifique se o nome do arquivo é UserService.js ou UserServices.js

// eslint-disable-next-line react-refresh/only-export-components
export const SistemaContext = createContext();

export const SistemaProvider = ({ children }) => {
  // --- ESTADOS GLOBAIS ---
  const [usuarios, setUsuarios] = useState([]);
  const [livros, setLivros] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);

  // --- 1. DEFINIÇÃO DAS FUNÇÕES ---

  // --- FUNÇÕES DE LIVROS ---
  const carregarLivros = async () => {
    try {
      const dados = await BookService.listarLivros();
      const livrosFormatados = dados.map(l => ({
        ...l,
        quantidade: l.quantidadeTotal,      
        disponivel: l.quantidadeDisponivel  
      }));
      setLivros(livrosFormatados);
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    }
  };

  const adicionarLivro = async (novoLivro) => {
    try {
      const livroCriado = await BookService.criarLivro(novoLivro);
      const livroFormatado = {
        ...livroCriado,
        quantidade: livroCriado.quantidadeTotal,
        disponivel: livroCriado.quantidadeDisponivel
      };
      setLivros(prev => [...prev, livroFormatado]);
      return true;
    } catch (error) {
      alert("Erro ao salvar livro: " + error.message);
      return false;
    }
  };

  const importarLivroGoogle = async (isbn) => {
    try {
      const livroCriado = await BookService.importarPorIsbn(isbn);
      const livroFormatado = {
        ...livroCriado,
        quantidade: livroCriado.quantidadeTotal,
        disponivel: livroCriado.quantidadeDisponivel
      };
      setLivros(prev => [...prev, livroFormatado]);
      return true;
    } catch (error) {
      alert("Erro ao importar: " + error.message);
      return false;
    }
  };

  // NOVA FUNÇÃO: Remover Livro
  const removerLivro = async (id) => {
    try {
      // 1. Remove do Banco
      await BookService.deletarLivro(id);
      
      // 2. Remove da lista na tela (Filtra todos que NÃO são o ID removido)
      setLivros(prev => prev.filter(livro => livro.id !== id));
      return true;
    } catch (error) {
      alert("Erro ao excluir: " + error.message);
      return false;
    }
  };

  // --- FUNÇÕES DE USUÁRIOS ---
  const carregarUsuarios = async () => {
    try {
      const dados = await UserService.listarUsuarios();
      const usuariosFormatados = dados.map(u => ({
        ...u,
        cpf: u.matricula, 
        status: 'Ativo'
      }));
      setUsuarios(usuariosFormatados);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const adicionarUsuario = async (novoUsuario) => {
    try {
      const usuarioCriado = await UserService.criarUsuario(novoUsuario);
      const usuarioFormatado = {
        ...usuarioCriado,
        cpf: usuarioCriado.matricula,
        status: 'Ativo'
      };
      setUsuarios(prev => [...prev, usuarioFormatado]);
      return true;
    } catch (error) {
      alert("Erro ao cadastrar usuário: " + error.message);
      return false;
    }
  };

  // --- FUNÇÕES DE EMPRÉSTIMOS ---
  const registrarEmprestimo = async (novoEmprestimo) => {
    try {
      await BookService.decrementarEstoque(novoEmprestimo.livroId);
      
      const id = emprestimos.length > 0 ? Math.max(...emprestimos.map(e => e.id)) + 1 : 1;
      setEmprestimos(prev => [...prev, { ...novoEmprestimo, id }]);
      
      await carregarLivros();
      
      return true;
    } catch (error) {
      alert("Erro ao realizar empréstimo: " + error.message);
      return false;
    }
  };

  // --- 2. CARREGAMENTO INICIAL ---
  const carregarDados = async () => {
    await Promise.all([carregarLivros(), carregarUsuarios()]);
  };

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SistemaContext.Provider value={{ 
      // Estados
      usuarios, setUsuarios, 
      livros, setLivros, 
      emprestimos, setEmprestimos,
      
      // Ações
      adicionarLivro,
      importarLivroGoogle,
      removerLivro, // <--- ESTÁ AQUI AGORA
      adicionarUsuario,
      registrarEmprestimo,
      carregarDados 
    }}>
      {children}
    </SistemaContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSistema = () => {
    return useContext(SistemaContext);
};