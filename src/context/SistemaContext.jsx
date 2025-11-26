import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { BookService } from '../services/BookService';
import { UserService } from '../services/UserServices'; // Confirme se o arquivo é UserServices.js mesmo

// eslint-disable-next-line react-refresh/only-export-components
export const SistemaContext = createContext();

export const SistemaProvider = ({ children }) => {
  // --- ESTADOS GLOBAIS ---
  const [usuarios, setUsuarios] = useState([]);
  const [livros, setLivros] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);

  // --- 1. DEFINIÇÃO DAS FUNÇÕES ---

  // --- FUNÇÕES DE LIVROS ---
  // useCallback garante que a função não mude de referência a cada render
  const carregarLivros = useCallback(async () => {
    try {
      const dados = await BookService.listarLivros();
      // Mapeia para garantir compatibilidade com o front antigo
      const livrosFormatados = dados.map(l => ({
        ...l,
        quantidade: l.quantidadeTotal,      
        disponivel: l.quantidadeDisponivel  
      }));
      setLivros(livrosFormatados);
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    }
  }, []);

  const adicionarLivro = async (novoLivro) => {
    try {
      await BookService.criarLivro(novoLivro);
      await carregarLivros(); // Atualiza a lista automaticamente
      return true;
    } catch (error) {
      alert("Erro ao salvar livro: " + error.message);
      return false;
    }
  };

  const importarLivroGoogle = async (isbn) => {
    try {
      await BookService.importarPorIsbn(isbn);
      await carregarLivros(); // Atualiza a lista automaticamente
      return true;
    } catch (error) {
      alert("Erro ao importar: " + error.message);
      return false;
    }
  };

  const removerLivro = async (id) => {
    try {
      await BookService.deletarLivro(id);
      await carregarLivros(); // Atualiza a lista automaticamente
      return true;
    } catch (error) {
      alert("Erro ao excluir: " + error.message);
      return false;
    }
  };

  // --- FUNÇÕES DE USUÁRIOS ---
  const carregarUsuarios = useCallback(async () => {
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
  }, []);

  const adicionarUsuario = async (novoUsuario) => {
    try {
      const usuarioCriado = await UserService.criarUsuario(novoUsuario);
      // Atualiza lista localmente ou recarrega do banco
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
      
      // Atualiza estado local de empréstimos
      const id = emprestimos.length > 0 ? Math.max(...emprestimos.map(e => e.id)) + 1 : 1;
      setEmprestimos(prev => [...prev, { ...novoEmprestimo, id }]);
      
      // Importante: Atualiza os livros para baixar o estoque na visualização
      await carregarLivros();
      
      return true;
    } catch (error) {
      alert("Erro ao realizar empréstimo: " + error.message);
      return false;
    }
  };

  // --- 2. CARREGAMENTO INICIAL ---
  const carregarDados = useCallback(async () => {
    await Promise.all([carregarLivros(), carregarUsuarios()]);
  }, [carregarLivros, carregarUsuarios]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return (
    <SistemaContext.Provider value={{ 
      // Estados
      usuarios, setUsuarios, 
      livros, setLivros, 
      emprestimos, setEmprestimos,
      
      // Ações Exportadas
      carregarLivros, // <--- IMPORTANTE: Exposto para ser usado no ControleEstoque.jsx
      carregarUsuarios,
      adicionarLivro,
      importarLivroGoogle,
      removerLivro,
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