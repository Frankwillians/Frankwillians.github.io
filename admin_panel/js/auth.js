const firebaseConfig = {
  apiKey: "AIzaSyBAcojxdGa1_RDGw7QSYklTLd6FQiC-uwM",
  authDomain: "admindarkstar-5e34b.firebaseapp.com",
  projectId: "admindarkstar-5e34b",
  appId: "757308363186"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

let githubAccessToken = null;

class Auth {
    constructor() {
        this.loginGitHubBtn = document.getElementById('login-github');
        this.logoutBtn = document.getElementById('logout-btn');
        this.init();
    }
    init() {
        if (this.loginGitHubBtn) {
            this.loginGitHubBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loginWithGitHub();
            });
        }
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        auth.onAuthStateChanged(user => {
            if (user) {
                // Pega o token do GitHub
                user.getIdTokenResult().then(idTokenResult => {
                    // O token de acesso do GitHub fica em user.providerData[0].uid, mas para acessar a API precisamos do accessToken
                    // O accessToken fica em user.stsTokenManager.accessToken, mas para GitHub precisamos pedir explicitamente:
                    const credential = firebase.auth.GithubAuthProvider.credentialFromResult({credential: user.credential});
                    githubAccessToken = credential && credential.accessToken ? credential.accessToken : null;
                });
                this.showAdminPanel();
                if (typeof PortfolioInstance !== "undefined") PortfolioInstance.loadData();
            } else {
                this.showLoginPanel();
            }
        });
    }
    loginWithGitHub() {
        const provider = new firebase.auth.GithubAuthProvider();
        // Peça permissões extras se quiser editar repositórios
        provider.addScope('repo');
        auth.signInWithPopup(provider)
            .then(result => {
                // Salva o accessToken para usar na API do GitHub
                githubAccessToken = result.credential.accessToken;
                this.showAdminPanel();
                if (typeof PortfolioInstance !== "undefined") PortfolioInstance.loadData();
            })
            .catch(error => {
                alert('Erro ao autenticar: ' + error.message);
            });
    }
    logout() {
        auth.signOut().then(() => {
            this.showLoginPanel();
        });
    }
    showLoginPanel() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('admin-container').classList.add('hidden');
    }
    showAdminPanel() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('admin-container').classList.remove('hidden');
    }
}
window.Auth = Auth;