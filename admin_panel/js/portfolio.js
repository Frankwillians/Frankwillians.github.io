// Função global para upload de imagem para o Imgur
async function uploadImageToImgur(file, clientId) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
            Authorization: 'Client-ID 0b5d1b4c5980da8' // coloque seu Client ID do Imgur
        },
        body: formData
    });

    const data = await response.json();
    if (!data.success) {
        throw new Error('Erro ao enviar imagem para o Imgur: ' + (data.data.error || ''));
    }
    return data.data.link; // URL direta da imagem
}

class Portfolio {
    constructor() {
        this.data = { items: [], last_updated: null };
        this.uploadedImages = [];
        this.selectedItemId = null;
        this.isEditing = false;
        this.thumbnailIndex = 0; // Índice da miniatura

        // Elementos do formulário
        this.addPostForm = document.getElementById('add-post-form');
        this.postsGrid = document.getElementById('posts-grid');
        this.imagePreviews = document.getElementById('image-previews');
        this.postTitleInput = document.getElementById('post-title');
        this.postDescriptionInput = document.getElementById('post-description');
        this.postCategorySelect = document.getElementById('post-category');
        this.postFeaturedCheckbox = document.getElementById('post-featured');
        this.savePostBtn = document.getElementById('save-post-btn');

        this.loadData();
        this.setupEvents();
    }

    setupEvents() {
        if (this.addPostForm) {
            this.addPostForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePost();
            });
        }
        const fileInput = document.getElementById('post-images');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
    }

    loadData() {
        try {
            const content = localStorage.getItem('portfolio_data');
            if (content) {
                this.data = JSON.parse(content);
            } else {
                this.data = { items: [], last_updated: null };
            }
            this.renderPosts();
            this.updatePostCount();
        } catch (error) {
            alert('Erro ao carregar dados do portfólio');
        }
    }

    renderPosts() {
        if (!this.postsGrid || !this.data) return;
        if (this.data.items.length === 0) {
            this.postsGrid.innerHTML = '<p>Nenhum post encontrado. Adicione seu primeiro post!</p>';
            return;
        }
        let html = '';
        this.data.items.forEach(item => {
            // Usa o índice salvo ou 0 como padrão
            const thumbIdx = typeof item.thumbnailIndex === 'number' ? item.thumbnailIndex : 0;
            const thumbnail = item.images && item.images.length > 0 && item.images[thumbIdx]
                ? (item.images[thumbIdx].thumbnail ? item.images[thumbIdx].thumbnail : item.images[thumbIdx].data)
                : '';
            html += `
                <div class="post-card" data-id="${item.id}">
                    <div class="post-card-image">
                        <img src="${thumbnail}" alt="${item.title}">
                    </div>
                    <div class="post-card-content">
                        <h4 class="post-card-title">${item.title}</h4>
                        <span class="post-card-category">${item.category}</span>
                        <div class="post-card-actions">
                            <button class="edit-post" data-id="${item.id}">Editar</button>
                            <button class="delete-post" data-id="${item.id}">Excluir</button>
                        </div>
                    </div>
                </div>
            `;
        });
        this.postsGrid.innerHTML = html;

        // Eventos de editar/excluir
        this.postsGrid.querySelectorAll('.edit-post').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.editPost(id);
            });
        });
        this.postsGrid.querySelectorAll('.delete-post').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.deletePost(id);
            });
        });
    }

    handleImageUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        if (this.uploadedImages.length + files.length > 10) {
            alert('Você pode fazer upload de no máximo 10 imagens por post.');
            return;
        }
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                alert(`O arquivo "${file.name}" não é uma imagem válida.`);
                return;
            }
            this.uploadedImages.push({
                file,
                name: file.name
            });
        });
        this.updateImagePreviews();
    }

    updateImagePreviews() {
        if (!this.imagePreviews) return;
        this.imagePreviews.innerHTML = '';
        this.uploadedImages.forEach((image, index) => {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            if (index === this.thumbnailIndex) {
                preview.classList.add('thumbnail-selected');
            }
            const img = document.createElement('img');
            img.alt = `Preview ${index + 1}`;
            const removeBtn = document.createElement('div');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.removeImage(index);
            });

            // Botão apenas visual
            const thumbBtn = document.createElement('button');
            thumbBtn.type = 'button';
            thumbBtn.className = 'set-thumbnail-btn';
            thumbBtn.textContent = 'Miniatura';
            thumbBtn.tabIndex = -1;
            thumbBtn.style.pointerEvents = "none";

            // Botão de crop só na thumbnail
            let cropBtn = null;
            if (index === this.thumbnailIndex) {
                cropBtn = document.createElement('button');
                cropBtn.type = 'button';
                cropBtn.className = 'crop-thumbnail-btn';
                cropBtn.textContent = 'Crop';
                cropBtn.style.marginLeft = "8px";
                cropBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.openCropper(index);
                });
            }

            preview.addEventListener('click', () => {
                this.thumbnailIndex = index;
                this.updateImagePreviews();
            });

            // Mostra o preview da thumbnail cropada se existir
            if (index === this.thumbnailIndex && image.thumbnailCropped) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                    preview.appendChild(img);
                    preview.appendChild(thumbBtn);
                    if (cropBtn) preview.appendChild(cropBtn);
                    preview.appendChild(removeBtn);
                    this.imagePreviews.appendChild(preview);
                };
                reader.readAsDataURL(image.thumbnailCropped);
            } else if (image.file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                    preview.appendChild(img);
                    preview.appendChild(thumbBtn);
                    if (cropBtn) preview.appendChild(cropBtn);
                    preview.appendChild(removeBtn);
                    this.imagePreviews.appendChild(preview);
                };
                reader.readAsDataURL(image.file);
            } else if (image.data) {
                img.src = image.data;
                preview.appendChild(img);
                preview.appendChild(thumbBtn);
                if (cropBtn) preview.appendChild(cropBtn);
                preview.appendChild(removeBtn);
                this.imagePreviews.appendChild(preview);
            }
        });
    }

    // Função para crop da thumbnail usando Cropper.js
    openCropper(index) {
        const image = this.uploadedImages[index];
        let imageUrl = '';

        if (image.thumbnailCropped) {
            imageUrl = URL.createObjectURL(image.thumbnailCropped);
        } else if (image.file) {
            imageUrl = URL.createObjectURL(image.file);
        } else if (image.data) {
            imageUrl = image.data;
        } else {
            alert('Imagem inválida para crop.');
            return;
        }

        // Cria modal simples para crop
        let modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = 0;
        modal.style.left = 0;
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.8)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = 9999;

        let cropContainer = document.createElement('div');
        cropContainer.style.background = '#222';
        cropContainer.style.padding = '20px';
        cropContainer.style.borderRadius = '8px';

        let img = document.createElement('img');
        img.src = imageUrl;
        img.style.maxWidth = '400px';
        img.style.maxHeight = '400px';
        cropContainer.appendChild(img);

        let cropBtn = document.createElement('button');
        cropBtn.textContent = 'Cortar e Salvar';
        cropBtn.style.display = 'block';
        cropBtn.style.margin = '20px auto 0 auto';

        cropContainer.appendChild(cropBtn);

        let closeBtn = document.createElement('button');
        closeBtn.textContent = 'Cancelar';
        closeBtn.style.marginLeft = '10px';
        cropContainer.appendChild(closeBtn);

        modal.appendChild(cropContainer);
        document.body.appendChild(modal);

        // Inicializa o cropper
        let cropper = new Cropper(img, {
            aspectRatio: 1, // quadrado, ajuste se quiser outro formato
            viewMode: 1,
            autoCropArea: 1,
        });

        cropBtn.onclick = () => {
            cropper.getCroppedCanvas({
                width: 400,
                height: 400,
                imageSmoothingQuality: 'high'
            }).toBlob(blob => {
                // Salva o arquivo cropado apenas para a thumbnail
                const croppedFile = new File([blob], image.name || 'thumbnail.jpg', { type: blob.type });
                this.uploadedImages[index].thumbnailCropped = croppedFile;
                this.updateImagePreviews();
                document.body.removeChild(modal);
            }, 'image/jpeg', 0.95);
        };

        closeBtn.onclick = () => {
            document.body.removeChild(modal);
        };
    }

    // Agora faz upload para o Imgur!
    uploadImageToFirebase(file) {
        // Substitua 'SEU_CLIENT_ID_AQUI' pelo seu Client ID do Imgur
        return uploadImageToImgur(file, 'SEU_CLIENT_ID_AQUI');
    }

    removeImage(index) {
        this.uploadedImages.splice(index, 1);
        // Corrige o índice da miniatura se necessário
        if (this.thumbnailIndex >= this.uploadedImages.length) {
            this.thumbnailIndex = 0;
        }
        this.updateImagePreviews();
    }

    editPost(id) {
        const post = this.data.items.find(item => item.id === id);
        if (!post) {
            alert('Post não encontrado para edição.');
            return;
        }
        this.isEditing = true;
        this.selectedItemId = id;

        // Mostra o formulário de edição
        document.getElementById('add-post-view').classList.remove('hidden');
        document.getElementById('dashboard-view').classList.add('hidden');
        document.getElementById('manage-posts-view').classList.add('hidden');

        // Preenche todos os campos do formulário
        this.postTitleInput.value = post.title || '';
        this.postDescriptionInput.value = post.description || '';
        this.postCategorySelect.value = post.category || '';
        this.postFeaturedCheckbox.checked = !!post.featured;

        document.getElementById('post-tecnologia').value = post.tecnologia || '';
        document.getElementById('post-material').value = post.material || '';
        document.getElementById('post-altura').value = post.altura || '';
        document.getElementById('post-acabamento').value = post.acabamento || '';
        document.getElementById('post-base').value = post.base || '';

        this.uploadedImages = Array.isArray(post.images) ? post.images.map(img => ({ ...img })) : [];
        this.thumbnailIndex = typeof post.thumbnailIndex === 'number' ? post.thumbnailIndex : 0;
        this.updateImagePreviews();
        this.savePostBtn.textContent = 'Salvar Alterações';
    }

    deletePost(id) {
        if (!confirm('Tem certeza que deseja excluir este post?')) return;
        const postIndex = this.data.items.findIndex(item => item.id === id);
        if (postIndex === -1) return;
        this.data.items.splice(postIndex, 1);
        this.data.last_updated = new Date().toISOString();
        localStorage.setItem('portfolio_data', JSON.stringify(this.data));
        this.renderPosts();
        this.updatePostCount();

        // Atualiza o arquivo no GitHub automaticamente
        updateGithubFile({
            path: "portfolio_data.json",
            content: JSON.stringify(this.data, null, 2),
            message: "Exclusão automática via painel admin"
        });
    }

    async savePost() {
        const title = this.postTitleInput.value;
        const description = this.postDescriptionInput.value;
        const category = this.postCategorySelect.value;
        const tecnologia = document.getElementById('post-tecnologia').value;
        const material = document.getElementById('post-material').value;
        const altura = document.getElementById('post-altura').value;
        const acabamento = document.getElementById('post-acabamento').value;
        const base = document.getElementById('post-base').value;
        const featured = this.postFeaturedCheckbox.checked;

        if (!title || !description || !category) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        if (this.uploadedImages.length === 0) {
            alert('Por favor, faça upload de pelo menos uma imagem.');
            return;
        }

        // Upload das imagens para o Imgur (apenas imagens novas)
        let imageUrls = [];
        try {
            for (let i = 0; i < this.uploadedImages.length; i++) {
                const img = this.uploadedImages[i];
                // Se for a thumbnail e tem crop, faz upload do crop
                if (i === this.thumbnailIndex && img.thumbnailCropped) {
                    const url = await this.uploadImageToFirebase(img.thumbnailCropped);
                    imageUrls.push({ 
                        data: img.data || '', 
                        name: img.name, 
                        thumbnail: url 
                    });
                } else if (img.file) {
                    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
                    if (!allowedTypes.includes(img.file.type)) {
                        alert('Formato de imagem não suportado pelo Imgur!');
                        return;
                    }
                    const url = await this.uploadImageToFirebase(img.file);
                    imageUrls.push({ data: url, name: img.name });
                } else if (img.data) {
                    imageUrls.push({ data: img.data, name: img.name });
                }
            }
        } catch (error) {
            alert('Erro ao fazer upload das imagens: ' + error.message);
            return;
        }

        let postId, dateAdded, currentPost = null;
        if (this.isEditing) {
            postId = this.selectedItemId;
            currentPost = this.data.items.find(post => post.id === postId);
            dateAdded = currentPost ? currentPost.date_added : new Date().toISOString();
        } else {
            postId = `item_${Date.now()}`;
            dateAdded = new Date().toISOString();
        }

        // Salva o índice da miniatura junto com o post
        const updatedPost = {
            id: postId,
            title,
            description,
            category,
            tecnologia,
            material,
            altura,
            acabamento,
            base,
            date_added: dateAdded,
            images: imageUrls,
            thumbnailIndex: this.thumbnailIndex,
            featured
        };

        if (this.isEditing) {
            const postIndex = this.data.items.findIndex(post => post.id === postId);
            if (postIndex !== -1) this.data.items[postIndex] = updatedPost;
            alert('Post atualizado com sucesso!');
        } else {
            this.data.items.push(updatedPost);
            alert('Post adicionado com sucesso!');
        }
        this.data.last_updated = new Date().toISOString();
        localStorage.setItem('portfolio_data', JSON.stringify(this.data));
        this.renderPosts();
        this.updatePostCount();
        this.resetForm();
        if (document.getElementById('btn-dashboard')) {
            document.getElementById('btn-dashboard').click();
        }

        // Atualiza o arquivo no GitHub automaticamente
        updateGithubFile({
            path: "portfolio_data.json",
            content: JSON.stringify(this.data, null, 2),
            message: "Atualização automática via painel admin"
        });
    }

    resetForm() {
        if (this.addPostForm) this.addPostForm.reset();
        this.uploadedImages = [];
        this.thumbnailIndex = 0;
        this.updateImagePreviews();
        this.isEditing = false;
        this.selectedItemId = null;
        this.savePostBtn.textContent = 'Salvar Post';
    }

    updatePostCount() {
        const total = this.data.items.length;
        let fdm = 0, resina = 0;
        this.data.items.forEach(item => {
            let cat = (item.category || '').toString().trim().toLowerCase();
            if (cat === 'fdm') fdm++;
            if (cat === 'resina') resina++;
        });
        if (document.getElementById('total-posts')) document.getElementById('total-posts').textContent = total;
        if (document.getElementById('fdm-posts')) document.getElementById('fdm-posts').textContent = fdm;
        if (document.getElementById('resin-posts')) document.getElementById('resin-posts').textContent = resina;
        if (document.getElementById('post-count')) document.getElementById('post-count').textContent = total;
    }
}