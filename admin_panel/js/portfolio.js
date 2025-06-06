/**
 * Módulo de gerenciamento do portfólio
 * Gerencia operações de CRUD para os itens do portfólio
 */

class Portfolio {
    constructor() {
        this.data = null;
        this.selectedItemId = null;
        this.uploadedImages = [];
        
        // Elementos do DOM
        this.addPostForm = document.getElementById('add-post-form');
        this.postsGrid = document.getElementById('posts-grid');
        this.imageUploadArea = document.getElementById('image-upload-area');
        this.imagePreviews = document.getElementById('image-previews');
        this.deleteModal = document.getElementById('delete-modal');
        this.confirmDeleteBtn = document.getElementById('confirm-delete');
        this.cancelDeleteBtn = document.getElementById('cancel-delete');
        
        // Inicialização
        this.init();
    }
    
    init() {
        // Adicionar event listeners
        if (this.addPostForm) {
            this.addPostForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePost();
            });
        }
        
        if (this.imageUploadArea) {
            const fileInput = document.getElementById('post-images');
            fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
            
            // Drag and drop
            this.imageUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.imageUploadArea.classList.add('dragover');
            });
            
            this.imageUploadArea.addEventListener('dragleave', () => {
                this.imageUploadArea.classList.remove('dragover');
            });
            
            this.imageUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                this.imageUploadArea.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    fileInput.files = e.dataTransfer.files;
                    this.handleImageUpload({ target: fileInput });
                }
            });
        }
        
        // Configurar modal de exclusão
        if (this.confirmDeleteBtn) {
            this.confirmDeleteBtn.addEventListener('click', () => this.deleteSelectedPost());
        }
        
        if (this.cancelDeleteBtn) {
            this.cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
        }
    }
    
    // Carregar dados do portfólio
    async loadData() {
        if (!Auth.isAuthenticated) {
            return;
        }
        
        UI.showLoading('Carregando dados do portfólio...');
        
        try {
            // Garantir que o arquivo de dados existe
            this.data = await GitHubAPI.ensureDataFileExists();
            
            // Atualizar UI
            this.updateDashboard();
            this.renderPosts();
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            UI.showNotification('Erro ao carregar dados do portfólio', 'error');
        } finally {
            UI.hideLoading();
        }
    }
    
    // Atualizar informações do dashboard
    updateDashboard() {
        if (!this.data) return;
        
        const totalPosts = document.getElementById('total-posts');
        const resinPosts = document.getElementById('resin-posts');
        const fdmPosts = document.getElementById('fdm-posts');
        const recentPostsList = document.getElementById('recent-posts-list');
        
        if (totalPosts) {
            totalPosts.textContent = this.data.items.length;
        }
        
        if (resinPosts) {
            const resinCount = this.data.items.filter(item => item.category === 'Resina').length;
            resinPosts.textContent = resinCount;
        }
        
        if (fdmPosts) {
            const fdmCount = this.data.items.filter(item => item.category === 'FDM').length;
            fdmPosts.textContent = fdmCount;
        }
        
        if (recentPostsList) {
            // Ordenar por data e pegar os 5 mais recentes
            const recentItems = [...this.data.items]
                .sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
                .slice(0, 5);
            
            if (recentItems.length === 0) {
                recentPostsList.innerHTML = '<p>Nenhum post encontrado.</p>';
                return;
            }
            
            let html = '<ul class="recent-posts-list">';
            
            recentItems.forEach(item => {
                html += `
                    <li>
                        <div class="recent-post-item">
                            <h5>${item.title}</h5>
                            <span class="category">${item.category}</span>
                            <span class="date">${this.formatDate(item.date_added)}</span>
                        </div>
                    </li>
                `;
            });
            
            html += '</ul>';
            recentPostsList.innerHTML = html;
        }
    }
    
    // Renderizar lista de posts
    renderPosts() {
        if (!this.postsGrid || !this.data) return;
        
        if (this.data.items.length === 0) {
            this.postsGrid.innerHTML = '<p>Nenhum post encontrado. Adicione seu primeiro post!</p>';
            return;
        }
        
        // Ordenar por data (mais recente primeiro)
        const sortedItems = [...this.data.items].sort((a, b) => {
            return new Date(b.date_added) - new Date(a.date_added);
        });
        
        let html = '';
        
        sortedItems.forEach(item => {
            // Pegar a primeira imagem como thumbnail
            const thumbnail = item.images && item.images.length > 0 
                ? item.images[0].thumbnail 
                : '';
            
            html += `
                <div class="post-card" data-id="${item.id}">
                    <div class="post-card-image">
                        <img src="https://frankwillians.github.io/${thumbnail}" alt="${item.title}">
                    </div>
                    <div class="post-card-content">
                        <h4 class="post-card-title">${item.title}</h4>
                        <span class="post-card-category">${item.category}</span>
                        <p class="post-card-date">${this.formatDate(item.date_added)}</p>
                        <div class="post-card-actions">
                            <button class="delete-post" data-id="${item.id}">Excluir</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        this.postsGrid.innerHTML = html;
        
        // Adicionar event listeners para botões de exclusão
        const deleteButtons = this.postsGrid.querySelectorAll('.delete-post');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.showDeleteModal(id);
            });
        });
    }
    
    // Manipular upload de imagens
    handleImageUpload(event) {
        const files = event.target.files;
        
        if (!files || files.length === 0) return;
        
        // Limitar número de imagens (opcional)
        if (this.uploadedImages.length + files.length > 10) {
            alert('Você pode fazer upload de no máximo 10 imagens por post.');
            return;
        }
        
        // Processar cada arquivo
        Array.from(files).forEach(file => {
            // Verificar se é uma imagem
            if (!file.type.startsWith('image/')) {
                alert(`O arquivo "${file.name}" não é uma imagem válida.`);
                return;
            }
            
            // Ler arquivo como Data URL
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                
                // Adicionar à lista de imagens
                this.uploadedImages.push({
                    file: file,
                    data: imageData,
                    name: file.name
                });
                
                // Atualizar previews
                this.updateImagePreviews();
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Atualizar previews de imagens
    updateImagePreviews() {
        if (!this.imagePreviews) return;
        
        this.imagePreviews.innerHTML = '';
        
        this.uploadedImages.forEach((image, index) => {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            
            const img = document.createElement('img');
            img.src = image.data;
            img.alt = `Preview ${index + 1}`;
            
            const removeBtn = document.createElement('div');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', () => this.removeImage(index));
            
            preview.appendChild(img);
            preview.appendChild(removeBtn);
            this.imagePreviews.appendChild(preview);
        });
    }
    
    // Remover imagem da lista
    removeImage(index) {
        this.uploadedImages.splice(index, 1);
        this.updateImagePreviews();
    }
    
    // Salvar novo post
    async savePost() {
        if (!this.addPostForm) return;
        
        const title = document.getElementById('post-title').value;
        const description = document.getElementById('post-description').value;
        const category = document.getElementById('post-category').value;
        const featured = document.getElementById('post-featured').checked;
        
        if (!title || !description || !category) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        if (this.uploadedImages.length === 0) {
            alert('Por favor, faça upload de pelo menos uma imagem.');
            return;
        }
        
        UI.showLoading('Salvando post...');
        
        try {
            // Gerar ID único para o post
            const postId = `item_${this.generateId()}`;
            const dateAdded = new Date().toISOString();
            
            // Fazer upload das imagens
            const imagePromises = this.uploadedImages.map(async (image, index) => {
                const extension = this.getFileExtension(image.name);
                const isMain = index === 0;
                
                // Gerar nomes de arquivo
                const filename = `${postId}_${isMain ? 'main' : `detail_${index}`}.${extension}`;
                const thumbnailFilename = `${postId}_${isMain ? 'thumb' : `detail_${index}_thumb`}.${extension}`;
                
                // Fazer upload da imagem principal
                await GitHubAPI.uploadImage(filename, image.data);
                
                // Para simplificar, usamos a mesma imagem como thumbnail
                // Em uma implementação real, redimensionaríamos a imagem
                await GitHubAPI.uploadImage(thumbnailFilename, image.data);
                
                return {
                    filename: `${GitHubAPI.imageDir}${filename}`,
                    thumbnail: `${GitHubAPI.imageDir}${thumbnailFilename}`,
                    alt: isMain ? title : `Detalhe ${index} de ${title}`
                };
            });
            
            const images = await Promise.all(imagePromises);
            
            // Criar objeto do post
            const newPost = {
                id: postId,
                title,
                description,
                category,
                date_added: dateAdded,
                images,
                featured
            };
            
            // Adicionar ao array de itens
            this.data.items.push(newPost);
            this.data.last_updated = dateAdded;
            
            // Salvar arquivo JSON atualizado
            const { content, sha } = await GitHubAPI.getFileContent(GitHubAPI.dataFile);
            await GitHubAPI.saveFile(
                GitHubAPI.dataFile,
                JSON.stringify(this.data, null, 2),
                sha
            );
            
            // Atualizar UI
            this.updateDashboard();
            this.renderPosts();
            
            // Limpar formulário
            this.resetForm();
            
            // Mostrar mensagem de sucesso
            alert('Post adicionado com sucesso!');
            
            // Voltar para o dashboard
            UI.showView('dashboard');
            
        } catch (error) {
            console.error('Erro ao salvar post:', error);
            alert('Erro ao salvar post. Por favor, tente novamente.');
        } finally {
            UI.hideLoading();
        }
    }
    
    // Mostrar modal de confirmação de exclusão
    showDeleteModal(id) {
        this.selectedItemId = id;
        this.deleteModal.classList.add('active');
    }
    
    // Fechar modal de exclusão
    closeDeleteModal() {
        this.deleteModal.classList.remove('active');
        this.selectedItemId = null;
    }
    
    // Excluir post selecionado
    async deleteSelectedPost() {
        if (!this.selectedItemId) return;
        
        UI.showLoading('Excluindo post...');
        
        try {
            // Encontrar o post pelo ID
            const postIndex = this.data.items.findIndex(item => item.id === this.selectedItemId);
            
            if (postIndex === -1) {
                throw new Error('Post não encontrado');
            }
            
            const post = this.data.items[postIndex];
            
            // Excluir imagens associadas
            const imagePromises = post.images.map(async (image) => {
                // Extrair apenas o nome do arquivo do caminho completo
                const filename = image.filename.split('/').pop();
                const thumbnailFilename = image.thumbnail.split('/').pop();
                
                try {
                    await GitHubAPI.deleteFile(`${GitHubAPI.imageDir}${filename}`);
                    await GitHubAPI.deleteFile(`${GitHubAPI.imageDir}${thumbnailFilename}`);
                } catch (error) {
                    console.error(`Erro ao excluir imagem ${filename}:`, error);
                    // Continuar mesmo se falhar a exclusão de uma imagem
                }
            });
            
            await Promise.all(imagePromises);
            
            // Remover post do array
            this.data.items.splice(postIndex, 1);
            this.data.last_updated = new Date().toISOString();
            
            // Salvar arquivo JSON atualizado
            const { content, sha } = await GitHubAPI.getFileContent(GitHubAPI.dataFile);
            await GitHubAPI.saveFile(
                GitHubAPI.dataFile,
                JSON.stringify(this.data, null, 2),
                sha
            );
            
            // Atualizar UI
            this.updateDashboard();
            this.renderPosts();
            
            // Mostrar mensagem de sucesso
            alert('Post excluído com sucesso!');
            
        } catch (error) {
            console.error('Erro ao excluir post:', error);
            alert('Erro ao excluir post. Por favor, tente novamente.');
        } finally {
            UI.hideLoading();
            this.closeDeleteModal();
        }
    }
    
    // Resetar formulário
    resetForm() {
        if (!this.addPostForm) return;
        
        this.addPostForm.reset();
        this.uploadedImages = [];
        this.updateImagePreviews();
    }
    
    // Gerar ID sequencial
    generateId() {
        if (!this.data || !this.data.items) return '001';
        
        // Encontrar o maior ID atual
        const ids = this.data.items
            .map(item => item.id.replace('item_', ''))
            .map(id => parseInt(id, 10))
            .filter(id => !isNaN(id));
        
        const maxId = ids.length > 0 ? Math.max(...ids) : 0;
        const nextId = maxId + 1;
        
        // Formatar com zeros à esquerda
        return nextId.toString().padStart(3, '0');
    }
    
    // Obter extensão do arquivo
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
    
    // Formatar data
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Exportar para uso global
window.Portfolio = new Portfolio();
