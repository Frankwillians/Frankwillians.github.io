const firebaseConfig = {
  apiKey: "AIzaSyBAcojxdGa1_RDGw7QSYklTLd6FQiC-uwM",
  authDomain: "admindarkstar-5e34b.firebaseapp.com",
  projectId: "admindarkstar-5e34b",
  storageBucket: "admindarkstar-5e34b.appspot.com",
  appId: "757308363186"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

window.githubAccessToken = null; // Torna global

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
                // O accessToken do GitHub só é retornado no momento do login (signInWithPopup)
                // Por isso, garantimos que ele está salvo no loginWithGitHub()
                this.showAdminPanel();
                if (typeof PortfolioInstance !== "undefined") PortfolioInstance.loadData();
            } else {
                this.showLoginPanel();
            }
        });
    }
    loginWithGitHub() {
        const provider = new firebase.auth.GithubAuthProvider();
        provider.addScope('repo');
        auth.signInWithPopup(provider)
            .then(result => {
                // Salva o accessToken globalmente para uso no upload para o GitHub
                window.githubAccessToken = result.credential.accessToken;
                this.showAdminPanel();
                if (typeof PortfolioInstance !== "undefined") PortfolioInstance.loadData();
            })
            .catch(error => {
                alert('Erro ao autenticar: ' + error.message);
            });
    }
    logout() {
        auth.signOut().then(() => {
            window.githubAccessToken = null;
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