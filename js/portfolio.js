/**
 * Script para carregar dinamicamente os itens do portfólio
 * Este arquivo deve ser incluído na página de portfólio do site principal
 */

document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados do portfólio
    loadPortfolioData();
});

/**
 * Carrega os dados do portfólio a partir do arquivo JSON
 */
async function loadPortfolioData() {
    try {
        // Mostrar indicador de carregamento
        showLoading();
        
        // Carregar arquivo JSON
        const response = await fetch('/data/portfolio_data.json');
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar dados: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Renderizar itens do portfólio
        renderPortfolioItems(data);
        
        // Esconder indicador de carregamento
        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar dados do portfólio:', error);
        showError('Não foi possível carregar os itens do portfólio. Por favor, tente novamente mais tarde.');
        hideLoading();
    }
}

/**
 * Renderiza os itens do portfólio na página
 * @param {Object} data - Dados do portfólio
 */
function renderPortfolioItems(data) {
    // Verificar se há itens
    if (!data || !data.items || data.items.length === 0) {
        showEmptyState();
        return;
    }
    
    // Obter container do portfólio
    const portfolioContainer = document.getElementById('portfolio-items');
    
    if (!portfolioContainer) {
        console.error('Container de portfólio não encontrado');
        return;
    }
    
    // Limpar conteúdo existente
    portfolioContainer.innerHTML = '';
    
    // Ordenar itens por data (mais recente primeiro)
    const sortedItems = [...data.items].sort((a, b) => {
        return new Date(b.date_added) - new Date(a.date_added);
    });
    
    // Criar elementos para cada item
    sortedItems.forEach(item => {
        // Criar elemento do item
        const itemElement = createPortfolioItem(item);
        
        // Adicionar ao container
        portfolioContainer.appendChild(itemElement);
    });
    
    // Inicializar filtros e modal de visualização
    initializeFilters();
    initializeViewModal();
}

/**
 * Cria um elemento HTML para um item do portfólio
 * @param {Object} item - Item do portfólio
 * @returns {HTMLElement} Elemento do item
 */
function createPortfolioItem(item) {
    // Criar elemento principal
    const itemElement = document.createElement('div');
    itemElement.className = 'portfolio-item';
    itemElement.setAttribute('data-category', item.category ? item.category.toLowerCase() : '');
    itemElement.setAttribute('data-id', item.id);

    // Ajuste: usar thumbnail, filename ou placeholder
    let thumbnailUrl = '/images/site/placeholder.jpg';
    if (item.images && item.images.length > 0) {
        if (item.images[0].thumbnail) {
            thumbnailUrl = item.images[0].thumbnail.startsWith('/') ? item.images[0].thumbnail : '/' + item.images[0].thumbnail;
        } else if (item.images[0].filename) {
            thumbnailUrl = item.images[0].filename.startsWith('/') ? item.images[0].filename : '/' + item.images[0].filename;
        }
    }
    
    // Criar HTML interno
    itemElement.innerHTML = `
        <div class="portfolio-item-image">
            <img src="${thumbnailUrl}" alt="${item.title || ''}" loading="lazy" class="gallery-main-img">
            <div class="portfolio-item-overlay">
                <div class="portfolio-item-actions">
                    <button class="view-item" data-id="${item.id}">Ver Detalhes</button>
                </div>
            </div>
        </div>
        <div class="portfolio-item-info">
            <h3>${item.title || ''}</h3>
            <span class="category">${item.category || ''}</span>
        </div>
    `;
    
    // Adicionar event listener para o botão de visualização
    const viewButton = itemElement.querySelector('.view-item');
    if (viewButton) {
        viewButton.addEventListener('click', () => {
            showItemDetails(item);
        });
    }
    
    return itemElement;
}

/**
 * Inicializa os filtros de categoria
 */
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.portfolio-filter button');
    
    if (!filterButtons.length) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover classe ativa de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar classe ativa ao botão clicado
            button.classList.add('active');
            
            // Obter categoria selecionada
            const category = button.getAttribute('data-filter');
            
            // Filtrar itens
            filterItems(category);
        });
    });
}

/**
 * Filtra os itens do portfólio por categoria
 * @param {string} category - Categoria para filtrar
 */
function filterItems(category) {
    const items = document.querySelectorAll('.portfolio-item');
    
    items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Inicializa o modal de visualização de detalhes
 */
function initializeViewModal() {
    // Verificar se o modal já existe
    let modal = document.getElementById('portfolio-modal');
    
    // Se não existir, criar
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'portfolio-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-body">
                    <div class="item-details">
                        <h2 id="modal-title"></h2>
                        <div class="item-category" id="modal-category"></div>
                        <div class="item-description" id="modal-description"></div>
                    </div>
                    <div class="item-gallery">
                        <div class="main-image">
                            <img id="modal-main-image" src="" alt="">
                        </div>
                        <div class="image-thumbnails" id="modal-thumbnails"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar event listener para fechar o modal
        const closeButton = modal.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Fechar modal ao clicar fora do conteúdo
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

/**
 * Exibe os detalhes de um item no modal
 * @param {Object} item - Item do portfólio
 */
function showItemDetails(item) {
    const modal = document.getElementById('portfolio-modal');
    
    if (!modal) return;
    
    // Preencher dados do item
    document.getElementById('modal-title').textContent = item.title || '';
    document.getElementById('modal-category').textContent = item.category || '';
    document.getElementById('modal-description').textContent = item.description || '';
    
    // Preencher imagem principal
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage && item.images && item.images.length > 0) {
        let mainImgUrl = '/images/site/placeholder.jpg';
        if (item.images[0].filename) {
            mainImgUrl = item.images[0].filename.startsWith('/') ? item.images[0].filename : '/' + item.images[0].filename;
        } else if (item.images[0].thumbnail) {
            mainImgUrl = item.images[0].thumbnail.startsWith('/') ? item.images[0].thumbnail : '/' + item.images[0].thumbnail;
        }
        mainImage.src = mainImgUrl;
        mainImage.alt = item.title || '';
    }
    
    // Preencher miniaturas
    const thumbnailsContainer = document.getElementById('modal-thumbnails');
    if (thumbnailsContainer && item.images && item.images.length > 1) {
        thumbnailsContainer.innerHTML = '';
        
        item.images.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            if (index === 0) thumbnail.classList.add('active');
            
            let thumbUrl = '/images/site/placeholder.jpg';
            if (image.thumbnail) {
                thumbUrl = image.thumbnail.startsWith('/') ? image.thumbnail : '/' + image.thumbnail;
            } else if (image.filename) {
                thumbUrl = image.filename.startsWith('/') ? image.filename : '/' + image.filename;
            }
            
            thumbnail.innerHTML = `<img src="${thumbUrl}" alt="${image.alt || item.title || ''}">`;
            
            // Adicionar event listener para trocar imagem principal
            thumbnail.addEventListener('click', () => {
                let mainImgUrl = '/images/site/placeholder.jpg';
                if (image.filename) {
                    mainImgUrl = image.filename.startsWith('/') ? image.filename : '/' + image.filename;
                } else if (image.thumbnail) {
                    mainImgUrl = image.thumbnail.startsWith('/') ? image.thumbnail : '/' + image.thumbnail;
                }
                mainImage.src = mainImgUrl;
                mainImage.alt = image.alt || item.title || '';
                
                // Atualizar classe ativa
                document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
                thumbnail.classList.add('active');
            });
            
            thumbnailsContainer.appendChild(thumbnail);
        });
    } else if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = '';
    }
    
    // Exibir modal
    modal.style.display = 'flex';
}

/**
 * Exibe estado vazio quando não há itens
 */
function showEmptyState() {
    const portfolioContainer = document.getElementById('portfolio-items');
    
    if (!portfolioContainer) return;
    
    portfolioContainer.innerHTML = `
        <div class="empty-state">
            <p>Nenhum item encontrado no portfólio.</p>
        </div>
    `;
}

/**
 * Exibe mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    const portfolioContainer = document.getElementById('portfolio-items');
    
    if (!portfolioContainer) return;
    
    portfolioContainer.innerHTML = `
        <div class="error-state">
            <p>${message}</p>
        </div>
    `;
}

/**
 * Exibe indicador de carregamento
 */
function showLoading() {
    const portfolioContainer = document.getElementById('portfolio-items');
    
    if (!portfolioContainer) return;
    
    portfolioContainer.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Carregando itens do portfólio...</p>
        </div>
    `;
}

/**
 * Esconde indicador de carregamento
 */
function hideLoading() {
    // O loading será substituído pelo conteúdo quando os dados forem carregados
}