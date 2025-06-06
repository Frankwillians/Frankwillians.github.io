/**
 * Módulo de autenticação para o painel administrativo
 * Gerencia login, logout e armazenamento seguro do token
 */

class Auth {
    constructor() {
        this.tokenKey = 'darkstar_github_token';
        this.repoKey = 'darkstar_github_repo';
        this.isAuthenticated = false;
        
        // Elementos do DOM
        this.loginBtn = document.getElementById('login-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.tokenInput = document.getElementById('token');
        this.repoInput = document.getElementById('repo');
        
        // Inicialização
        this.init();
    }
    
    init() {
        // Verificar se já existe um token salvo
        this.checkAuth();
        
        // Adicionar event listeners
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => this.login());
        }
        
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.logout());
        }
    }
    
    // Verificar se o usuário já está autenticado
    checkAuth() {
        const token = this.getToken();
        const repo = this.getRepo();
        
        if (token && repo) {
            this.isAuthenticated = true;
            this.showAdminPanel();
        } else {
            this.isAuthenticated = false;
            this.showLoginPanel();
        }
        
        return this.isAuthenticated;
    }
    
    // Realizar login
    async login() {
        const token = this.tokenInput.value.trim();
        const repo = this.repoInput.value.trim();
        
        if (!token) {
            this.showError('Por favor, insira um token válido.');
            return;
        }
        
        if (!repo) {
            this.showError('Por favor, insira um repositório válido.');
            return;
        }
        
        // Mostrar loading
        UI.showLoading('Verificando credenciais...');
        
        try {
            // Verificar se o token é válido tentando acessar a API do GitHub
            const isValid = await GitHubAPI.validateToken(token, repo);
            
            if (isValid) {
                // Salvar token e repo (criptografados)
                this.saveToken(token);
                this.saveRepo(repo);
                this.isAuthenticated = true;
                
                // Mostrar painel admin
                this.showAdminPanel();
                
                // Carregar dados iniciais
                Portfolio.loadData();
            } else {
                this.showError('Token inválido ou sem permissões necessárias.');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            this.showError('Erro ao verificar credenciais. Verifique o token e o repositório.');
        } finally {
            UI.hideLoading();
        }
    }
    
    // Realizar logout
    logout() {
        // Remover token e repo
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.repoKey);
        this.isAuthenticated = false;
        
        // Limpar campos
        this.tokenInput.value = '';
        
        // Mostrar painel de login
        this.showLoginPanel();
    }
    
    // Salvar token (com criptografia simples)
    saveToken(token) {
        // Em uma aplicação real, usaríamos uma criptografia mais robusta
        const encodedToken = btoa(token);
        localStorage.setItem(this.tokenKey, encodedToken);
    }
    
    // Obter token (descriptografado)
    getToken() {
        const encodedToken = localStorage.getItem(this.tokenKey);
        if (!encodedToken) return null;
        
        try {
            return atob(encodedToken);
        } catch (e) {
            console.error('Erro ao decodificar token:', e);
            return null;
        }
    }
    
    // Salvar repositório
    saveRepo(repo) {
        localStorage.setItem(this.repoKey, repo);
    }
    
    // Obter repositório
    getRepo() {
        return localStorage.getItem(this.repoKey);
    }
    
    // Mostrar painel de login
    showLoginPanel() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('admin-container').classList.add('hidden');
    }
    
    // Mostrar painel administrativo
    showAdminPanel() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('admin-container').classList.remove('hidden');
    }
    
    // Mostrar mensagem de erro
    showError(message) {
        alert(message); // Em uma versão mais elaborada, usaríamos um componente de toast/notificação
    }
}

// Exportar para uso global
window.Auth = new Auth();
