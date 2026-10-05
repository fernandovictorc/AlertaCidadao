// ui.js - Manipulação do DOM e renderização de dados

/**
 * Função para renderizar os cards de denúncias no feed principal
 * @param {Array} denuncias - Lista de denúncias recebidas da API
 * @param {HTMLElement} container - O elemento pai onde os cards serão inseridos
 */
function renderFeed(denuncias, container) {
    container.innerHTML = ''; // Limpa o feed
    
    if (denuncias.length === 0) {
        container.innerHTML = '<p>Nenhuma denúncia encontrada.</p>';
        return;
    }

    denuncias.forEach(denuncia => {
        const article = document.createElement('article');
        article.className = 'product-card';
        
        // Usa a primeira midia se existir
        const imageUrl = (denuncia.midias && denuncia.midias.length > 0) ? denuncia.midias[0].url_ou_base64 : 'assets/images/default.jpg';
        
        article.innerHTML = `
            <img src="${imageUrl}" alt="Imagem da denúncia" class="product-card-thumbnail" style="object-fit: cover;">
            <div class="product-card-content">
                <a href="denuncia-detalhes.html?id=${denuncia.id}" style="color: inherit; text-decoration: none;">
                    <h3>${denuncia.titulo}</h3>
                </a>
                <p>${denuncia.descricao}</p>
                <div class="meta-info">
                  <span class="tag" style="background-color: var(--color--bg--muted); color: var(--color--text--muted);">${denuncia.estado}</span>
                  <span class="tag">${denuncia.bairro}</span>
                  <div class="comment-count">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    Por: ${denuncia.nome_autor}
                  </div>
                </div>
            </div>
            <button class="product-card-action" onclick="window.toggleApoioGlobal(${denuncia.id})">
                <svg class="upvote-icon" viewBox="0 0 10 10"><path d="M5 1L10 8H0Z"></path></svg>
                <span id="apoios-count-${denuncia.id}">${denuncia.apoios_contagem}</span>
            </button>
        `;
        
        container.appendChild(article);
    });
}

/**
 * Injeta o header corretamente, alterando botões caso usuário esteja logado
 */
function updateHeaderAuthUI() {
    const user = typeof getUser === 'function' ? getUser() : null;
    const navLinks = document.querySelector('.nav-links');
    
    if (user && navLinks) {
        // Substitui o botão "Entrar" pelo nome do usuário / Perfil / Sair
        const loginBtn = navLinks.querySelector('a[href="login.html"]');
        if (loginBtn) {
            loginBtn.remove();
        }
        
        // Evitar duplicar links se já existirem
        if (!navLinks.querySelector('a[href="perfil.html"]')) {
            if (user.perfil === 'admin') {
                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.className = 'nav-link';
                adminLink.innerText = 'Painel Admin';
                adminLink.style.fontWeight = 'bold';
                adminLink.style.color = 'var(--color--primary)';
                navLinks.appendChild(adminLink);
            }

            const profileLink = document.createElement('a');
            profileLink.href = 'perfil.html';
            profileLink.className = 'nav-link';
            profileLink.innerText = 'Perfil';
            
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.className = 'btn-primary';
            logoutLink.style.display = 'inline-block';
            logoutLink.style.textAlign = 'center';
            logoutLink.style.textDecoration = 'none';
            logoutLink.innerText = 'Sair';
            logoutLink.onclick = (e) => {
                e.preventDefault();
                logout();
            };
            
            navLinks.appendChild(profileLink);
            navLinks.appendChild(logoutLink);
        }
    }
}
