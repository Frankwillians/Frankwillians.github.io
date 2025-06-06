/**
 * Arquivo principal de inicialização do painel administrativo
 * Coordena a inicialização dos módulos e configurações globais
 */

let AuthInstance;
let PortfolioInstance;

document.addEventListener(\'DOMContentLoaded\', () => {
    AuthInstance = new Auth();
    PortfolioInstance = new Portfolio();

    // Verificar autenticação ao carregar a página
    if (AuthInstance.checkAuth()) {
        // Se autenticado, carregar dados do portfólio
        PortfolioInstance.loadData();
    }
    
    // Configurar filtros e busca na página de gerenciamento
    setupFiltersAndSearch();
});

// Configurar filtros e busca
function setupFiltersAndSearch() {
    const searchInput = document.getElementById(\'search-posts\');
    const filterCategory = document.getElementById(\'filter-category\');
    
    if (searchInput) {
        searchInput.addEventListener(\'input\', filterPosts);
    }
    
    if (filterCategory) {
        filterCategory.addEventListener(\'change\', filterPosts);
    }
}

// Filtrar posts com base na busca e categoria
function filterPosts() {
    const searchInput = document.getElementById(\'search-posts\');
    const filterCategory = document.getElementById(\'filter-category\');
    const postsGrid = document.getElementById(\'posts-grid\');
    
    if (!searchInput || !filterCategory || !postsGrid || !PortfolioInstance.data) {
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilter = filterCategory.value;
    
    // Obter todos os cards de post
    const postCards = postsGrid.querySelectorAll(\'.post-card\');
    
    postCards.forEach(card => {
        const postId = card.getAttribute(\'data-id\');
        const post = PortfolioInstance.data.items.find(item => item.id === postId);
        
        if (!post) return;
        
        const titleMatches = post.title.toLowerCase().includes(searchTerm);
        const descriptionMatches = post.description.toLowerCase().includes(searchTerm);
        const categoryMatches = categoryFilter === \'all\' || post.category === categoryFilter;
        
        // Mostrar ou esconder com base nos filtros
        if ((titleMatches || descriptionMatches) && categoryMatches) {
            card.style.display = \'block\';
        } else {
            card.style.display = \'none\';
        }
    });
}

// Função para criar diretórios necessários se não existirem
async function ensureDirectoriesExist() {
    try {
        const repo = AuthInstance.getRepo();
        const token = AuthInstance.getToken();
        
        if (!repo || !token) return;
        
        // Verificar/criar diretório de dados
        try {
            await GitHubAPI.getFileContent(\'data\');
        } catch (error) {
            // Se o diretório não existe, criar um arquivo README.md nele
            await GitHubAPI.saveFile(\'data/README.md\', \'# Portfolio Data\\n\\nThis directory contains data files for the portfolio.\', null);
        }
        
        // Verificar/criar diretório de imagens do portfólio
        try {
            await GitHubAPI.getFileContent(\'images/portfolio\');
        } catch (error) {
            // Se o diretório não existe, criar um arquivo README.md nele
            await GitHubAPI.saveFile(\'images/portfolio/README.md\', \'# Portfolio Images\\n\\nThis directory contains images for portfolio items.\', null);
        }
    } catch (error) {
        console.error(\'Erro ao verificar diretórios:\', error);
    }
}


