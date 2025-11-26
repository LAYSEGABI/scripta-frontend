import React, { useState, useMemo, useContext } from "react";
import { SistemaContext } from "../context/SistemaContext";
// CORREÇÃO: Adicionei Edit e Trash2 aqui na lista
import { Search, Plus, BookDown, Edit, Trash2 } from "lucide-react";
import "../styles/controleEstoque.css";
import { BookService } from "../services/BookService";

export default function ControleEstoqueLivros() {
  const { livros, carregarLivros, importarLivroGoogle } =
    useContext(SistemaContext);

  const [modoImportacao, setModoImportacao] = useState(true);
  const [isbnImportacao, setIsbnImportacao] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [formulario, setFormulario] = useState({
    id: null,
    titulo: "",
    autor: "",
    isbn: "",
    quantidade: 1,
  });

  const [termoPesquisa, setTermoPesquisa] = useState("");

  const livrosFiltrados = useMemo(() => {
    if (!termoPesquisa) return livros;
    const termo = termoPesquisa.toLowerCase();
    return livros.filter(
      (livro) =>
        livro.titulo.toLowerCase().includes(termo) ||
        livro.autor.toLowerCase().includes(termo) ||
        livro.isbn.includes(termo)
    );
  }, [livros, termoPesquisa]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const valorTratado =
      name === "quantidade" ? Math.max(1, parseInt(value) || 1) : value;
    setFormulario({ ...formulario, [name]: valorTratado });
  };

  const handleImportar = async () => {
    if (!isbnImportacao) return alert("Digite um ISBN!");

    setCarregando(true);
    const sucesso = await importarLivroGoogle(isbnImportacao);
    setCarregando(false);

    if (sucesso) {
      alert("Livro encontrado e cadastrado com sucesso!");
      setIsbnImportacao("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formulario.id) {
        await BookService.atualizarLivro(formulario.id, formulario);
        alert("Livro atualizado com sucesso!");
      } else {
        await BookService.criarLivro(formulario);
        alert("Livro cadastrado com sucesso!");
      }

      // 2. A MÁGICA ACONTECE AQUI:
      // Isso força o React a ir no banco buscar a lista nova imediatamente
      await carregarLivros();

      setFormulario({
        id: null,
        titulo: "",
        autor: "",
        isbn: "",
        quantidade: 1,
      });
    } catch (error) {
      alert("Erro: " + error.message);
    }
  };

  const iniciarEdicao = (livro) => {
    setModoImportacao(false);
    setFormulario({
      id: livro.id,
      titulo: livro.titulo,
      autor: livro.autor,
      isbn: livro.isbn,
      quantidade: livro.quantidade || livro.quantidadeTotal,
    });
    window.scrollTo(0, 0);
  };

  const resetFormulario = () => {
    setFormulario({ id: null, titulo: "", autor: "", isbn: "", quantidade: 1 });
  };

  const excluirLivro = async (id, titulo) => {
    if (window.confirm(`Tem certeza que deseja excluir o livro "${titulo}"?`)) {
      try {
        await BookService.deletarLivro(id);
        alert("Livro excluído com sucesso!");

        // 3. ATUALIZA A LISTA TAMBÉM AO EXCLUIR
        await carregarLivros();
      } catch (error) {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  return (
    <div className="controle-estoque-container">
      <h1>📚 Controle de Estoque de Livros</h1>

      <div className="formulario-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ margin: 0 }}>
            {formulario.id
              ? "✏️ Editar Livro"
              : modoImportacao
              ? "☁️ Importar do Google"
              : "➕ Cadastro Manual"}
          </h2>

          {!formulario.id && (
            <button
              type="button"
              onClick={() => setModoImportacao(!modoImportacao)}
              style={{
                background: "transparent",
                color: "#2563eb",
                border: "1px solid #2563eb",
                padding: "5px 10px",
              }}
            >
              {modoImportacao ? "Mudar para Manual" : "Mudar para Importação"}
            </button>
          )}
        </div>

        {modoImportacao && !formulario.id ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Digite o ISBN (ex: 9788535909558)"
              value={isbnImportacao}
              onChange={(e) => setIsbnImportacao(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              onClick={handleImportar}
              disabled={carregando}
              style={{
                backgroundColor: "#7c3aed",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {carregando ? (
                "Buscando..."
              ) : (
                <>
                  <BookDown size={18} /> Importar
                </>
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="titulo"
              placeholder="Título"
              value={formulario.titulo}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="autor"
              placeholder="Autor"
              value={formulario.autor}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="isbn"
              placeholder="ISBN"
              value={formulario.isbn}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="quantidade"
              placeholder="Qtd"
              value={formulario.quantidade}
              onChange={handleChange}
              min="1"
              required
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" style={{ flex: 1 }}>
                {formulario.id ? "Salvar Alterações" : "Cadastrar Manualmente"}
              </button>
              {formulario.id && (
                <button
                  type="button"
                  onClick={() => {
                    resetFormulario();
                    setModoImportacao(true);
                  }}
                  style={{ backgroundColor: "#dc3545" }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <hr />
      <div className="pesquisa-container">
        <h2>🔍 Pesquisar no Acervo</h2>
        <input
          type="text"
          placeholder="Filtrar por Título, Autor ou ISBN..."
          value={termoPesquisa}
          onChange={(e) => setTermoPesquisa(e.target.value)}
        />
      </div>

      <h2>Lista de Livros ({livrosFiltrados.length})</h2>

      {livros.length === 0 ? (
        <p>Nenhum livro encontrado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>ISBN</th>
              <th>Estoque</th>
              <th>Disp.</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {livrosFiltrados.map((livro) => (
              <tr key={livro.id}>
                <td>
                  <strong>{livro.titulo}</strong>
                </td>
                <td>{livro.autor}</td>
                <td>{livro.isbn}</td>
                <td>{livro.quantidade}</td>
                <td style={{ color: "#166534", fontWeight: "bold" }}>
                  {livro.disponivel !== undefined ? livro.disponivel : "-"}
                </td>
                <td>
                  <button
                    onClick={() => iniciarEdicao(livro)}
                    className="btn-editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => excluirLivro(livro.id, livro.titulo)}
                    className="btn-excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
