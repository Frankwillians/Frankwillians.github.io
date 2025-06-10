class UI {
    constructor() {
        this.navLinks = document.querySelectorAll('nav a[data-view]');
        this.views = document.querySelectorAll('.view');
        this.loadingModal = document.getElementById('loading-modal');
        this.loadingMessage = document.getElementById('loading-message');
        this.cancelAddBtn = document.getElementById('cancel-add');
        this.init();
    }
    init() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = link.getAttribute('data-view');
                this.showView(viewId);
            });
        });
        if (this.cancelAddBtn) {
            this.cancelAddBtn.addEventListener('click', () => {
                if (this.formHasData('add-post-form')) {
                    if (confirm('Deseja cancelar? Todos os dados preenchidos serão perdidos.')) {
                        PortfolioInstance.resetForm();
                        this.showView('dashboard');
                    }
                } else {
                    this.showView('dashboard');
                }
            });
        }
    }
    showView(viewId) {
        this.navLinks.forEach(link => {
            if (link.getAttribute('data-view') === viewId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        this.views.forEach(view => {
            if (view.id === `${viewId}-view`) {
                view.classList.remove('hidden');
            } else {
                view.classList.add('hidden');
            }
        });
    }
    static showLoading(message = 'Carregando...') {
        const loadingModal = document.getElementById('loading-modal');
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) loadingMessage.textContent = message;
        if (loadingModal) loadingModal.classList.add('active');
    }
    static hideLoading() {
        const loadingModal = document.getElementById('loading-modal');
        if (loadingModal) loadingModal.classList.remove('active');
    }
    static showNotification(message, type = 'info') {
        alert(message);
    }
    formHasData(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        const inputs = form.querySelectorAll('input, textarea, select');
        for (const input of inputs) {
            if (input.type === 'checkbox' && !input.checked) continue;
            if (input.type === 'button' || input.type === 'submit') continue;
            if (input.value.trim() !== '') return true;
        }
        if (PortfolioInstance.uploadedImages && PortfolioInstance.uploadedImages.length > 0) {
            return true;
        }
        return false;
    }
}

window.UI = window.UI || {};
UI.showView = function(view) {
    // Exemplo simples: mostra/oculta seções pelo id
    document.querySelectorAll('.admin-view').forEach(el => el.style.display = 'none');
    const target = document.getElementById(view);
    if (target) target.style.display = 'block';
};

window.UI = new UI();