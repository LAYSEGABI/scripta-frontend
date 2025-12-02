// const BASE_URL = "http://localhost:8082";

const BASE_URL = "https://usuario-service-production-14cf.up.railway.app";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  
  // Se não tem token ou ele é apenas espaços vazios, retorna objeto vazio
  if (!token || token.trim() === "") {
    return {
      "Content-Type": "application/json"
    };
  }

  // Se tem token, garante que não tem espaços extras
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token.trim()}`,
  };
};

export const UserService = {

  // --- LOGIN ---
  login: async (matricula, senha) => {
    console.log("Tentando login com:", matricula, senha);

    // Aceita qualquer login, ou defina um específico se quiser
    // Aqui estou aceitando se digitar qualquer coisa
    if (matricula && senha) {
      
      const usuarioFake = {
        id: 1,
        nome: "Administrador (Demo)",
        matricula: matricula,
        tipoDeConta: "ADMIN",
        email: "admin@demo.com"
      };

      // Salva um token falso e o usuário no navegador para o sistema achar que está logado
      localStorage.setItem("token", "token_demo_apresentacao_123");
      localStorage.setItem("usuario", JSON.stringify(usuarioFake));

      // Retorna sucesso imediato
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

  // --- CRIAR (CORRIGIDO) ---
 // --- CRIAR (SIMPLIFICADO PARA APRESENTAÇÃO) ---
  criarUsuario: async (usuarioData) => {
    
    // Monta apenas o payload que o Backend espera agora
    const payload = {
      nome: usuarioData.nome,
      matricula: usuarioData.matricula, // Agora a matrícula vai direta, sem limpar CPF
      senha: usuarioData.senha || "123456", // Senha padrão se não preencher
      tipoDeConta: usuarioData.tipoDeConta || "ALUNO",
      status: "ATIVO"
    };

    console.log("Enviando payload:", payload);

    const response = await fetch(`${BASE_URL}/usuarios`, {
      method: "POST",
      // Como removemos a segurança, nem precisaria de header, mas mal não faz
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar usuário.");
    }
    
    // Tenta ler o JSON, se falhar (vazio), retorna sucesso genérico
    try {
        return await response.json();
    } catch (e) {
        return { message: "Criado com sucesso" };
    }
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