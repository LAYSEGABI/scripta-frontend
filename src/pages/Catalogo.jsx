import React, { useState, useMemo } from 'react';
import '../styles/catalogo.css'; 


const DADOS_CATALOGO = [
    { id: 1, titulo: 'O Alquimista', autor: 'Paulo Coelho', disponivel: 5, total: 10 },
    { id: 2, titulo: 'Dom Casmurro', autor: 'Machado de Assis', disponivel: 2, total: 5 },
    // ... mais livros
];

function Catalogo() {
 
const [livros] = useState(DADOS_CATALOGO);
    const [termoPesquisa, setTermoPesquisa] = useState('');

    const livrosFiltrados = useMemo(() => {
        const termo = termoPesquisa.toLowerCase();
        return livros.filter(livro =>
            livro.titulo.toLowerCase().includes(termo) ||
            livro.autor.toLowerCase().includes(termo)
        );
    }, [livros, termoPesquisa]);
    
    // Função para simular o clique no botão "Ver Detalhes"
    const handleDetalhes = (titulo) => {
        alert(`Abrindo detalhes do livro: ${titulo}`);
    };

    return (
        <div className="catalogo-container">
            <div className="catalogo-header">
                <h1>Catálogo de Livros</h1>
                {/* Você pode adicionar aqui o seletor de tema e info do admin */}
                <div className="admin-info">Bibliotecário Admin</div>
            </div>

            {/* BARRA DE PESQUISA */}
            <div className="catalogo-pesquisa">
                <input
                    type="text"
                    placeholder="🔍 Buscar por Título, Autor ou ISBN..."
                    value={termoPesquisa}
                    onChange={(e) => setTermoPesquisa(e.target.value)}
                />
            </div>

            {/* GRID DE CARDS */}
            <div className="catalogo-grid">
                {livrosFiltrados.map(livro => (
                    <div className="catalogo-card" key={livro.id}>
                        {/* Imagem de Capa (Placeholder verde) */}
                        <div className="catalogo-capa-placeholder">
                            Scripta
                        </div>
                        
                        {/* Conteúdo do Card */}
                        <div className="catalogo-conteudo">
                            <h3>{livro.titulo}</h3>
                            <p>{livro.autor}</p>
                            
                            <div className="catalogo-disponivel">
                                Disponível: **{livro.disponivel} / {livro.total}**
                            </div>

                            <button 
                                className="catalogo-btn-detalhes" 
                                onClick={() => handleDetalhes(livro.titulo)}
                            >
                                Ver Detalhes
                            </button>
                        </div>
                    </div>
                ))}

                {/* Placeholder para itens vazios (Como na sua imagem) */}
                <div className="catalogo-card placeholder"></div>
                <div className="catalogo-card placeholder"></div>
            </div>
        </div>
    );
}

export default Catalogo;