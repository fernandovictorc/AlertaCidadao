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
    try {
        const user = localStorage.getItem('user');
        if (!user || user === 'undefined' || user === 'null') return null;
        return JSON.parse(user);
    } catch (e) {
        console.error('Erro ao ler usuário do localStorage', e);
        return null;
    }
}

// Exemplos de eventos a serem acionados pelo login.html futuramente:
// async function handleLogin(email, senha) { ... guarda token e user ... }

/**
 * Valida se a data de nascimento fornecida corresponde a uma pessoa de pelo menos 16 anos.
 * @param {string} dateString (formato YYYY-MM-DD)
 * @returns {boolean}
 */
function isAtLeast16YearsOld(dateString) {
    if (!dateString) return false;
    const nascimento = new Date(dateString);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade >= 16;
}
