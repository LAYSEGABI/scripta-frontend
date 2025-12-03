// const BASE_URL = "http://localhost:8082";
const BASE_URL = "https://usuario-service-production-14cf.up.railway.app";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token || token.trim() === "") {
    return { "Content-Type": "application/json" };
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token.trim()}`,
  };
};

export const UserService = {
  // --- LOGIN ---
  login: async (matricula, senha) => {
    console.log("Tentando login com:", matricula, senha);
    if (matricula && senha) {
      const usuarioFake = {
        id: 1,
        nome: "Administrador (Demo)",
        matricula: matricula,
        tipoDeConta: "ADMIN",
        email: "admin@demo.com"
      };
      localStorage.setItem("token", "token_demo_apresentacao_123");
      localStorage.setItem("usuario", JSON.stringify(usuarioFake));
      return Promise.resolve(usuarioFake);
    }
    throw new Error("Preencha login e senha.");
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

  // --- CRIAR ---
  criarUsuario: async (usuarioData) => {
    const payload = {
      nome: usuarioData.nome,
      matricula: usuarioData.matricula,
      senha: usuarioData.senha || "123456",
      tipoDeConta: usuarioData.tipoDeConta || "ALUNO",
      status: "ATIVO"
    };

    const response = await fetch(`${BASE_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Erro ao criar usuário.");
    
    try {
        return await response.json();
    } catch (e) {
        return { message: "Criado com sucesso" };
    }
  },

  // --- ATUALIZAR (ADICIONADO AGORA) ---
  atualizarUsuario: async (id, usuarioData) => {
    const payload = {
      nome: usuarioData.nome,
      matricula: usuarioData.matricula,
      senha: usuarioData.senha, // Manda a senha nova se tiver, ou vazia
      tipoDeConta: usuarioData.tipoDeConta,
      status: usuarioData.status
    };

    const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Erro ao atualizar usuário.");
    return true; // Retorna sucesso simples
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