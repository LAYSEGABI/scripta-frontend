// src/services/BookService.js

const API_URL = "http://localhost:8082/livros"; // Porta definida no README

// Função auxiliar para pegar o cabeçalho com Token (se tiver login)
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // Vamos salvar isso depois na tela de login
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const BookService = {
  // GET /livros - Lista todos (Público)
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

  // GET /livros/buscar - Busca por texto (Público)
  // O README diz "Body Raw String", mas GET com body não é padrão web.
  // Vou tentar passar como query param que é o padrão Spring, ou body se for muito específico.
  buscarLivros: async (termo) => {
    try {
      // Tentativa padrão REST (Query Param)
      const response = await fetch(`${API_URL}/buscar?q=${termo}`);
      if (!response.ok) throw new Error("Erro na busca");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // POST /livros - Cria novo (Requer Login - Bibliotecário)
  criarLivro: async (livroData) => {
    // Mapeando os campos do seu formulário para o JSON que o Java espera (vide README)
    const payload = {
      titulo: livroData.titulo,
      autor: livroData.autor,
      isbn: livroData.isbn,
      anoPublicacao: parseInt(livroData.anoPublicacao) || 2024, // Padrão caso vazio
      quantidadeTotal: parseInt(livroData.quantidade),
      quantidadeDisponivel: parseInt(livroData.quantidade), // Inicialmente igual ao total
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const erro = await response.text();
      throw new Error(erro || "Erro ao cadastrar livro");
    }
    return await response.json();
  },

  // DELETE /livros/{id} - Excluir livro
  deletarLivro: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Erro ao excluir livro");
    return true;
  },

  // POST /livros/importar/{isbn} - Importa do Google (Requer Login)
  importarPorIsbn: async (isbn) => {
    const response = await fetch(`${API_URL}/importar/${isbn}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Erro ao importar ISBN");
    return await response.json();
  },

  // PUT /livros/{id}/estoque/decrementar (Para Empréstimo)
  decrementarEstoque: async (id) => {
    const response = await fetch(`${API_URL}/${id}/estoque/decrementar`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao atualizar estoque");
    return true;
  },

  // PUT /livros/{id}/estoque/incrementar (Para Devolução)
  incrementarEstoque: async (id) => {
    const response = await fetch(`${API_URL}/${id}/estoque/incrementar`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao atualizar estoque");
    return true;
  },
};
