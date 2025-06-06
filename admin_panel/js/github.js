/**
 * Módulo de integração com a API do GitHub
 * Gerencia operações de leitura e escrita no repositório
 */

class GitHubAPI {
    constructor() {
        this.apiBase = 'https://api.github.com';
        this.dataFile = 'data/portfolio_data.json';
        this.imageDir = 'images/portfolio/';
    }
    
    // Validar token e acesso ao repositório
    static async validateToken(token, repo) {
        try {
            const response = await fetch(`${this.apiBase}/repos/${repo}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.status === 200) {
                const repoData = await response.json();
                // Verificar se o usuário tem permissão de escrita
                return repoData.permissions && repoData.permissions.push;
            }
            
            return false;
        } catch (error) {
            console.error('Erro ao validar token:', error);
            return false;
        }
    }
    
    // Obter conteúdo do arquivo JSON
    static async getFileContent(path) {
        const token = AuthInstance.getToken();
        const repo = AuthInstance.getRepo();
        
        if (!token || !repo) {
            throw new Error('Usuário não autenticado');
        }
        
        try {
            const response = await fetch(`${this.apiBase}/repos/${repo}/contents/${path}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.status === 404) {
                // Arquivo não existe ainda
                return { content: null, sha: null };
            }
            
            if (response.status === 200) {
                const data = await response.json();
                const content = atob(data.content); // Decodificar conteúdo Base64
                return { 
                    content: content, 
                    sha: data.sha 
                };
            }
            
            throw new Error(`Erro ao obter arquivo: ${response.status}`);
        } catch (error) {
            console.error(`Erro ao obter conteúdo do arquivo ${path}:`, error);
            throw error;
        }
    }
    
    // Salvar conteúdo no arquivo JSON
    static async saveFile(path, content, sha = null) {
        const token = AuthInstance.getToken();
        const repo = AuthInstance.getRepo();
        
        if (!token || !repo) {
            throw new Error('Usuário não autenticado');
        }
        
        const body = {
            message: `Atualização do arquivo ${path}`,
            content: btoa(unescape(encodeURIComponent(content))), // Codificar para Base64
            branch: 'main' // ou 'master', dependendo do repositório
        };
        
        // Se temos o SHA, é uma atualização
        if (sha) {
            body.sha = sha;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/repos/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            if (response.status === 200 || response.status === 201) {
                return await response.json();
            }
            
            throw new Error(`Erro ao salvar arquivo: ${response.status}`);
        } catch (error) {
            console.error(`Erro ao salvar arquivo ${path}:`, error);
            throw error;
        }
    }
}


