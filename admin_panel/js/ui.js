/**
 * Módulo de interface do usuário
 * Gerencia a navegação entre views e elementos de UI
 */

class UI {
    constructor() {
        // Elementos de navegação
        this.navLinks = document.querySelectorAll('nav a[data-view]');
        this.views = document.querySelectorAll('.view');
        
        // Elementos de loading e notificação
        this.loadingModal = document.getElementById('loading-modal');
        this.loadingMessage = document.getElementById('loading-message');
        
        // Botões de cancelamento
        this.cancelAddBtn = document.getElementById('cancel-add');
        
        // Inicialização
        this.init();
    }
    
    init() {
        // Configurar navegação
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = link.getAttribute('data-view');
                this.showView(viewId);
            });
        });
        
        // Configurar botões de cancelamento
        if (this.cancelAddBtn) {
            this.cancelAddBtn.addEventListener('click', () => {
                // Confirmar cancelamento se houver dados preenchidos
                if (this.formHasData('add-post-form')) {
                    if (confirm('Deseja cancelar? Todos os dados preenchidos serão perdidos.')) {
                        Portfolio.resetForm();
                        this.showView('dashboard');
                    }
                } else {
                    this.showView('dashboard');
                }
            });
        }
    }
    
    // Mostrar view específica
    showView(viewId) {
        // Atualizar links de navegação
        this.navLinks.forEach(link => {
            if (link.getAttribute('data-view') === viewId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Mostrar view correspondente
        this.views.forEach(view => {
            if (view.id === `${viewId}-view`) {
                view.classList.remove('hidden');
            } else {
                view.classList.add('hidden');
            }
        });
    }
    
    // Mostrar modal de loading
    static showLoading(message = 'Carregando...') {
        const loadingModal = document.getElementById('loading-modal');
        const loadingMessage = document.getElementById('loading-message');
        
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
        
        if (loadingModal) {
            loadingModal.classList.add('active');
        }
    }
    
    // Esconder modal de loading
    static hideLoading() {
        const loadingModal = document.getElementById('loading-modal');
        
        if (loadingModal) {
            loadingModal.classList.remove('active');
        }
    }
    
    // Mostrar notificação
    static showNotification(message, type = 'info') {
        // Em uma implementação mais completa, usaríamos um componente de toast/notificação
        alert(message);
    }
    
    // Verificar se um formulário tem dados preenchidos
    formHasData(formId) {
        const form = document.getElementById(formId);
        
        if (!form) return false;
        
        const inputs = form.querySelectorAll('input, textarea, select');
        
        for (const input of inputs) {
            // Ignorar checkboxes não marcados
            if (input.type === 'checkbox' && !input.checked) {
                continue;
            }
            
            // Ignorar botões
            if (input.type === 'button' || input.type === 'submit') {
                continue;
            }
            
            // Verificar se tem valor
            if (input.value.trim() !== '') {
                return true;
            }
        }
        
        // Verificar se há imagens carregadas
        if (Portfolio.uploadedImages && Portfolio.uploadedImages.length > 0) {
            return true;
        }
        
        return false;
    }
}

// Exportar para uso global
window.UI = new UI();
