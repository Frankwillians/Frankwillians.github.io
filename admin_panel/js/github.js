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
    async validateToken(token, repo) {
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
                return response.status === 200;
            }
            
            return false;
        } catch (error) {
            console.error('Erro ao validar token:', error);
            return false;
        }
    }
    
    // Obter conteúdo do arquivo JSON
    async getFileContent(path) {
        const token = Auth.getToken();
        const repo = Auth.getRepo();
        
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
    async saveFile(path, content, sha = null) {
        const token = Auth.getToken();
        const repo = Auth.getRepo();
        
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
            
            const errorData = await response.json();
            throw new Error(`Erro ao salvar arquivo: ${response.status} - ${JSON.stringify(errorData)}`);
        } catch (error) {
            console.error(`Erro ao salvar arquivo ${path}:`, error);
            throw error;
        }
    }
    
    // Upload de imagem para o repositório
    async uploadImage(filename, imageData) {
        const path = this.imageDir + filename;
        
        // Remover cabeçalho da string base64 se existir
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        
        try {
            return await this.saveFile(path, base64Data, null);
        } catch (error) {
            console.error(`Erro ao fazer upload da imagem ${filename}:`, error);
            throw error;
        }
    }
    
    // Excluir arquivo do repositório
    async deleteFile(path) {
        const token = Auth.getToken();
        const repo = Auth.getRepo();
        
        if (!token || !repo) {
            throw new Error('Usuário não autenticado');
        }
        
        try {
            // Primeiro precisamos obter o SHA do arquivo
            const { sha } = await this.getFileContent(path);
            
            if (!sha) {
                throw new Error(`Arquivo ${path} não encontrado`);
            }
            
            const response = await fetch(`${this.apiBase}/repos/${repo}/contents/${path}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Exclusão do arquivo ${path}`,
                    sha: sha,
                    branch: 'main' // ou 'master', dependendo do repositório
                })
            });
            
            if (response.status === 200) {
                return true;
            }
            
            const errorData = await response.json();
            throw new Error(`Erro ao excluir arquivo: ${response.status} - ${JSON.stringify(errorData)}`);
        } catch (error) {
            console.error(`Erro ao excluir arquivo ${path}:`, error);
            throw error;
        }
    }
    
    // Verificar se o arquivo de dados existe, se não, criar um template
    async ensureDataFileExists() {
        try {
            const { content } = await this.getFileContent(this.dataFile);
            
            if (!content) {
                // Criar arquivo de dados inicial
                const initialData = {
                    last_updated: new Date().toISOString(),
                    items: []
                };
                
                await this.saveFile(
                    this.dataFile, 
                    JSON.stringify(initialData, null, 2),
                    null
                );
                
                return initialData;
            }
            
            return JSON.parse(content);
        } catch (error) {
            console.error('Erro ao verificar arquivo de dados:', error);
            throw error;
        }
    }
}

// Exportar para uso global
window.GitHubAPI = new GitHubAPI();
