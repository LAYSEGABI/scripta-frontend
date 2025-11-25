const API_URL = "http://localhost:8081/usuarios"; // Porta padrão do Spring é 8080 ou 8081 (verifique no console ao rodar)

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const UserService = {
  // GET /usuarios - Lista todos (Pode precisar de login dependendo da config)
  listarUsuarios: async () => {
    try {
      const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Erro ao buscar usuários");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // POST /usuarios - Cadastro
  criarUsuario: async (usuarioData) => {
    // Convertendo para o formato que o Java espera (visto no Teste)
    // ... dentro de criarUsuario ...
    const payload = {
      nome: usuarioData.nome,
      // Remove pontos e traços, enviando apenas números para o Java
      matricula: (usuarioData.matricula || usuarioData.cpf).replace(/\D/g, ""),
      senha: usuarioData.senha || "SenhaForte123456",
      tipoDeConta: usuarioData.tipoDeConta || "ALUNO",
    };

    console.log("Enviando para o Java:", payload);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Cadastro geralmente é público ou requer admin
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const erro = await response.text();
      throw new Error(erro || "Erro ao criar usuário");
    }
    return await response.json();
  },

  // GET /usuarios/me - Perfil Logado
  meuPerfil: async () => {
    const response = await fetch(`${API_URL}/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao buscar perfil");
    return await response.json();
  },
};
