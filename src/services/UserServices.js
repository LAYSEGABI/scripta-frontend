// src/services/UserServices.js

const API_URL = "http://localhost:8081/usuarios"; // Confirme se a porta é 8081 ou 8082

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const UserService = {
  // GET
  listarUsuarios: async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error("Erro ao buscar usuários");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // POST
  criarUsuario: async (usuarioData) => {
    const payload = {
      nome: usuarioData.nome,
      matricula: (usuarioData.matricula || usuarioData.cpf).replace(/\D/g, ""),
      senha: usuarioData.senha || "SenhaForte123456",
      tipoDeConta: usuarioData.tipoDeConta || "ALUNO",
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const erro = await response.text();
      throw new Error(erro || "Erro ao criar usuário");
    }
    return await response.json();
  },

  // GET Me
  meuPerfil: async () => {
    const response = await fetch(`${API_URL}/me`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Erro ao buscar perfil");
    return await response.json();
  },

  // --- NOVA FUNÇÃO (DELETE) ---
  deletarUsuario: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const erro = await response.text();
        throw new Error(erro || "Erro ao excluir usuário");
    }
    return true;
  }
};