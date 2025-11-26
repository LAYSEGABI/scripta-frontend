// src/services/UserServices.js

const BASE_URL = "http://localhost:8081"; // Porta do servidor de Usuários

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const cleanToken = token ? token.trim() : "";
  return {
    "Content-Type": "application/json",
    Authorization: cleanToken ? `Bearer ${cleanToken}` : "",
  };
};

export const UserService = {

  // --- LOGIN ---
  login: async (matricula, senha) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula, senha }),
    });

    if (!response.ok) {
      throw new Error("Login falhou. Verifique matrícula e senha.");
    }

    const data = await response.json();
    return data;
  },

  // --- LISTAR ---
  listarUsuarios: async () => {
    try {
      const response = await fetch(`${BASE_URL}/usuarios`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Erro ao buscar usuários");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // --- CRIAR (CORRIGIDO) ---
  criarUsuario: async (usuarioData) => {
    const payload = {
      nome: usuarioData.nome,
      // Campos que estavam faltando:
      email: usuarioData.email,
      dataNascimento: usuarioData.dataNascimento, 
      status: usuarioData.status ? usuarioData.status.toUpperCase() : "ATIVO", // Garante maiúsculo
      
      // Campos já existentes:
      matricula: (usuarioData.matricula || usuarioData.cpf).replace(/\D/g, ""),
      senha: usuarioData.senha || "123456789012",
      tipoDeConta: usuarioData.tipoDeConta || "ALUNO",
    };

    const response = await fetch(`${BASE_URL}/usuarios`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const erroTexto = await response.text();
      let erroMsg = erroTexto;
      
      try {
          const erroJson = JSON.parse(erroTexto);
          if(erroJson.message) erroMsg = erroJson.message;
      } catch { }

      throw new Error(erroMsg || "Erro ao criar usuário");
    }
    return await response.json();
  },

  // --- PERFIL ---
  meuPerfil: async () => {
    const response = await fetch(`${BASE_URL}/usuarios/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao buscar perfil");
    return await response.json();
  },

  // --- DELETAR ---
  deletarUsuario: async (id) => {
    const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const erro = await response.text();
      throw new Error(erro || "Erro ao excluir usuário");
    }
    return true;
  },
};