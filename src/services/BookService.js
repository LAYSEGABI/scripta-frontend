// src/services/BookService.js

const API_URL = "https://usuario-service-production-14cf.up.railway.app/livros";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const BookService = {

  listarLivros: async () => {
    try {
      const response = await fetch(`${API_URL}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Erro ao buscar livros");
      return await response.json();
    } catch (error) {
      console.error("Erro de conexão:", error);
      return [];
    }
  },

  buscarLivros: async (termo) => {
    try {
      const response = await fetch(`${API_URL}/buscar`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(termo),
      });
      if (!response.ok) throw new Error("Erro na busca");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  criarLivro: async (livroData) => {
    const ano = parseInt(livroData.anoPublicacao);
    const qtd = parseInt(livroData.quantidade);

    const payload = {
      titulo: livroData.titulo,
      autor: livroData.autor,
      isbn: livroData.isbn,
      anoPublicacao: isNaN(ano) ? 2024 : ano,
      quantidadeTotal: isNaN(qtd) ? 1 : qtd,
      quantidadeDisponivel: isNaN(qtd) ? 1 : qtd,
    };

    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let erroMsg = "Erro ao cadastrar livro";
      try {
        const erroJson = await response.json();
        erroMsg = JSON.stringify(erroJson);
      } catch {
        erroMsg = await response.text();
      }
      throw new Error(erroMsg);
    }
    return await response.json();
  },

  // --- CORREÇÃO APLICADA AQUI ---
  atualizarLivro: async (id, livroData) => {
    const ano = parseInt(livroData.anoPublicacao);
    
    // Captura o campo 'quantidade' que vem do formulário React
    const qtd = parseInt(livroData.quantidade);

    const payload = {
      titulo: livroData.titulo,
      autor: livroData.autor,
      isbn: livroData.isbn,
      anoPublicacao: isNaN(ano) ? 2024 : ano,
      
      // Se 'qtd' for um número válido, enviamos para o Java.
      // Se for inválido (NaN), enviamos undefined para o Java ignorar e manter o valor antigo.
      quantidadeTotal: isNaN(qtd) ? undefined : qtd,
      quantidadeDisponivel: isNaN(qtd) ? undefined : qtd
    };

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Erro ao atualizar livro");

    return await response.json();
  },

  deletarLivro: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Erro ao excluir livro");
    return true;
  },

  importarPorIsbn: async (isbn) => {
    const response = await fetch(`${API_URL}/importar/${isbn}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Erro ao importar ISBN");
    return await response.json();
  },

  decrementarEstoque: async (id) => {
    const response = await fetch(`${API_URL}/${id}/estoque/decrementar`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao atualizar estoque");
    return true;
  },

  incrementarEstoque: async (id) => {
    const response = await fetch(`${API_URL}/${id}/estoque/incrementar`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao atualizar estoque");
    return true;
  }
};