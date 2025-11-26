// src/services/BookService.js

const API_URL = "http://localhost:8082/livros";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const BookService = {
  // 1. LISTAR TODOS
  listarLivros: async () => {
    try {
      const response = await fetch(`${API_URL}`);
      if (!response.ok) throw new Error("Erro ao buscar livros");
      return await response.json();
    } catch (error) {
      console.error("Erro de conexão:", error);
      return [];
    }
  },

  // 2. BUSCAR
  buscarLivros: async (termo) => {
    try {
      const response = await fetch(`${API_URL}/buscar`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: termo
      });
      if (!response.ok) throw new Error("Erro na busca");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // 3. CRIAR (POST)
  criarLivro: async (livroData) => {
    // BLINDAGEM: Garante que números não vão como null/NaN
    const ano = parseInt(livroData.anoPublicacao);
    const qtd = parseInt(livroData.quantidade);

    const payload = {
      titulo: livroData.titulo,
      autor: livroData.autor,
      isbn: livroData.isbn,
      anoPublicacao: isNaN(ano) ? 2024 : ano,
      quantidadeTotal: isNaN(qtd) ? 0 : qtd,
      quantidadeDisponivel: isNaN(qtd) ? 0 : qtd,
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let erroMsg = "Erro ao cadastrar livro";
      try {
        const erroJson = await response.json();
        // Se vier objeto de erro complexo, converte pra string
        if (typeof erroJson === 'object') {
             erroMsg = JSON.stringify(erroJson);
        } else {
             erroMsg = erroJson.message || erroMsg;
        }
      } catch {
        erroMsg = await response.text();
      }
      throw new Error(erroMsg);
    }
    return await response.json();
  },

  // 4. ATUALIZAR (PUT)
  atualizarLivro: async (id, livroData) => {
    // BLINDAGEM: Garante que números não vão como null/NaN
    const ano = parseInt(livroData.anoPublicacao);
    const qtd = parseInt(livroData.quantidade);

    const payload = {
      titulo: livroData.titulo,
      autor: livroData.autor,
      isbn: livroData.isbn,
      anoPublicacao: isNaN(ano) ? 2024 : ano,
      quantidadeTotal: isNaN(qtd) ? 0 : qtd,
    };

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let erroMsg = "Erro ao atualizar livro";
      try {
        const erroJson = await response.json();
        if (typeof erroJson === 'object') {
             erroMsg = JSON.stringify(erroJson);
        } else {
             erroMsg = erroJson.message || erroMsg;
        }
      } catch {
        erroMsg = await response.text();
      }
      throw new Error(erroMsg);
    }
    return await response.json();
  },

  // 5. DELETAR (DELETE)
  deletarLivro: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Erro ao excluir livro");
    return true;
  },

  // 6. IMPORTAR (POST)
  importarPorIsbn: async (isbn) => {
    const response = await fetch(`${API_URL}/importar/${isbn}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Erro ao importar ISBN");
    return await response.json();
  },

  // 7. DECREMENTAR ESTOQUE (PUT)
  decrementarEstoque: async (id) => {
    const response = await fetch(`${API_URL}/${id}/estoque/decrementar`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao atualizar estoque");
    return true;
  },

  // 8. INCREMENTAR ESTOQUE (PUT)
  incrementarEstoque: async (id) => {
    const response = await fetch(`${API_URL}/${id}/estoque/incrementar`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao atualizar estoque");
    return true;
  }
};