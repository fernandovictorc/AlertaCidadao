// auth.js - Gerencia autenticação e controle de sessão no frontend

/**
 * Verifica se o usuário está logado verificando o token no localStorage
 * @returns {boolean}
 */
function isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
}

/**
 * Protege a rota atual. Se não estiver logado, redireciona para index.html
 */
function protectRoute() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

/**
 * Executa o logout limpando os dados locais e redirecionando
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

/**
 * Recupera os dados do usuário logado (armazenados durante o login)
 */
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Exemplos de eventos a serem acionados pelo login.html futuramente:
// async function handleLogin(email, senha) { ... guarda token e user ... }
