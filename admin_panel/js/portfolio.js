class Portfolio {
    constructor() {
        this.data = { items: [], last_updated: null };
        this.uploadedImages = [];
        this.selectedItemId = null;
        this.isEditing = false;

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
            const thumbnail = item.images && item.images.length > 0 ? item.images[0].data : '';
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
            const reader = new FileReader();
            reader.onload = (e) => {
                this.uploadedImages.push({
                    file,
                    data: e.target.result,
                    name: file.name
                });
                this.updateImagePreviews();
            };
            reader.readAsDataURL(file);
        });
    }

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

    removeImage(index) {
        this.uploadedImages.splice(index, 1);
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
    this.updateImagePreviews();
    this.savePostBtn.textContent = 'Salvar Alterações';
}

    // ...existing code...

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

savePost() {
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

    let postId, dateAdded, currentPost = null;
    if (this.isEditing) {
        postId = this.selectedItemId;
        currentPost = this.data.items.find(post => post.id === postId);
        dateAdded = currentPost ? currentPost.date_added : new Date().toISOString();
    } else {
        postId = `item_${Date.now()}`;
        dateAdded = new Date().toISOString();
    }

    const allImages = this.uploadedImages.map(img => ({
        data: img.data,
        name: img.name
    }));

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
        images: allImages,
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

// ...existing code...

    resetForm() {
        if (this.addPostForm) this.addPostForm.reset();
        this.uploadedImages = [];
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
    // Se ainda usar o antigo post-count:
    if (document.getElementById('post-count')) document.getElementById('post-count').textContent = total;
}
}
