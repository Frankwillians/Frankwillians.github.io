// JavaScript específico para a página de portfólio

document.addEventListener('DOMContentLoaded', function() {
    // Filtros de portfólio
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class de todos os botões do mesmo grupo
            const parentGroup = this.closest('.filter-group');
            parentGroup.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Adiciona active class ao botão clicado
            this.classList.add('active');
            
            // Obtém os filtros ativos de cada grupo
            const activeFilters = {};
            document.querySelectorAll('.filter-group').forEach(group => {
                const activeButton = group.querySelector('.filter-btn.active');
                const filterType = activeButton.closest('.filter-group').querySelector('h3').textContent.replace(':', '').trim().toLowerCase();
                activeFilters[filterType] = activeButton.getAttribute('data-filter');
            });
            
            // Filtra os projetos
            projectItems.forEach(item => {
                let shouldShow = true;
                
                // Verifica cada filtro ativo
                Object.keys(activeFilters).forEach(filterType => {
                    const filterValue = activeFilters[filterType];
                    if (filterValue !== 'all') {
                        if (!item.classList.contains(filterValue)) {
                            shouldShow = false;
                        }
                    }
                });
                
                if (shouldShow) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Modal de detalhes do projeto
    const projectViewButtons = document.querySelectorAll('.project-view-btn');
    
    projectViewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const projectId = this.getAttribute('data-project');
            const modal = document.getElementById(`modal-${projectId}`);
            
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                
                // Fecha o modal ao clicar no X
                const closeButton = modal.querySelector('.modal-close');
                closeButton.addEventListener('click', function() {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                });
                
                // Fecha o modal ao clicar fora do conteúdo
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                });
                
                // Navegação entre thumbnails
                const thumbnails = modal.querySelectorAll('.thumbnail-images img');
                const mainImage = modal.querySelector('.main-image img');
                
                thumbnails.forEach(thumb => {
                    thumb.addEventListener('click', function() {
                        // Remove classe active de todas as thumbnails
                        thumbnails.forEach(t => t.classList.remove('active'));
                        
                        // Adiciona classe active à thumbnail clicada
                        this.classList.add('active');
                        
                        // Atualiza a imagem principal
                        mainImage.src = this.src;
                        mainImage.alt = this.alt;
                    });
                });
            } else {
                console.error(`Modal para o projeto ${projectId} não encontrado.`);
            }
        });
    });
    
    // Cria modais dinamicamente para projetos que não têm modal específico
    document.querySelectorAll('.project-view-btn').forEach(button => {
        const projectId = button.getAttribute('data-project');
        if (!document.getElementById(`modal-${projectId}`)) {
            const projectCard = button.closest('.project-card');
            const projectTitle = projectCard.querySelector('.project-info h3').textContent;
            const projectDesc = projectCard.querySelector('.project-info p').textContent;
            const projectImage = projectCard.querySelector('.project-image img').src;
            
            // Cria o modal
            const modalHTML = `
            <div class="project-modal" id="modal-${projectId}">
                <div class="modal-content">
                    <span class="modal-close">&times;</span>
                    <div class="modal-body">
                        <div class="modal-gallery">
                            <div class="main-image">
                                <img src="${projectImage}" alt="${projectTitle}">
                            </div>
                            <div class="thumbnail-images">
                                <img src="${projectImage}" alt="${projectTitle}" class="active">
                            </div>
                        </div>
                        <div class="modal-info">
                            <h2>${projectTitle}</h2>
                            <p class="modal-subtitle">Action Figure</p>
                            
                            <div class="modal-description">
                                <p>${projectDesc}</p>
                                <p>Esta action figure foi criada com atenção aos detalhes e acabamento artístico premium, destacando as características únicas do personagem.</p>
                            </div>
                            
                            <div class="modal-specs">
                                <div class="spec-item">
                                    <span class="spec-label">Tecnologia:</span>
                                    <span class="spec-value">${projectId.includes('resina') ? 'Impressão em Resina' : 'Impressão FDM (Filamento)'}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Material:</span>
                                    <span class="spec-value">${projectId.includes('resina') ? 'Resina Fotossensível' : 'PLA'}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Acabamento:</span>
                                    <span class="spec-value">Pintura manual com técnicas profissionais</span>
                                </div>
                            </div>
                            
                            <div class="modal-cta">
                                <a href="contato.html" class="btn btn-primary">Solicitar Orçamento Similar</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            
            // Adiciona o modal ao final do body
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    });
});
