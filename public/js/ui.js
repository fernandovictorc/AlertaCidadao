// ui.js - Manipulação do DOM e renderização de dados

/**
 * Função para renderizar os cards de denúncias no feed principal
 * @param {Array} denuncias - Lista de denúncias recebidas da API
 * @param {HTMLElement} container - O elemento pai onde os cards serão inseridos
 */
function renderFeed(denuncias, container, options = {}) {
    container.replaceChildren();

    if (denuncias.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = options.emptyMessage || 'Nenhuma denúncia encontrada.';
        container.appendChild(emptyMessage);
        return;
    }

    const user = typeof getUser === 'function' ? getUser() : null;

    denuncias.forEach(denuncia => {
        const article = document.createElement('article');
        article.className = 'product-card';

        const content = document.createElement('div');
        content.className = 'product-card-content';

        if (denuncia.midias && denuncia.midias.length > 0 && denuncia.midias[0].tipo !== 'video') {
            const image = document.createElement('img');
            image.src = denuncia.midias[0].url_ou_base64;
            image.alt = 'Imagem da denúncia';
            image.className = 'product-card-thumbnail';
            article.appendChild(image);
        }

        const titleLink = document.createElement('a');
        titleLink.href = `denuncia-detalhes.html?id=${encodeURIComponent(denuncia.id)}`;
        titleLink.className = 'report-title-link';

        const title = document.createElement('h3');
        title.textContent = denuncia.titulo;
        titleLink.appendChild(title);
        content.appendChild(titleLink);

        const description = document.createElement('p');
        description.textContent = denuncia.descricao;
        content.appendChild(description);

        const metadata = document.createElement('div');
        metadata.className = 'meta-info';
        [denuncia.estado, denuncia.bairro].filter(Boolean).forEach(value => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = value;
            metadata.appendChild(tag);
        });

        if (denuncia.nome_autor) {
            const author = document.createElement('span');
            author.className = 'comment-count';
            const authorLink = document.createElement('a');
            authorLink.href = `perfil.html?id=${denuncia.id_utilizador}`;
            authorLink.textContent = `Por: ${denuncia.nome_autor}`;
            authorLink.style.textDecoration = 'none';
            authorLink.style.color = 'inherit';
            author.appendChild(authorLink);
            metadata.appendChild(author);
        }

        content.appendChild(metadata);
        article.appendChild(content);

        if (options.showSupport !== false) {
            const supportButton = document.createElement('button');
            supportButton.type = 'button';
            supportButton.className = 'product-card-action';
            supportButton.setAttribute('aria-label', `Apoiar denúncia ${denuncia.titulo}`);
            supportButton.innerHTML = '<svg class="upvote-icon" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1L10 8H0Z"></path></svg>';

            const count = document.createElement('span');
            count.id = `apoios-count-${denuncia.id}`;
            count.textContent = denuncia.apoios_contagem ?? 0;
            supportButton.appendChild(count);
            supportButton.addEventListener('click', () => {
                if (typeof window.toggleApoioGlobal === 'function') {
                    window.toggleApoioGlobal(denuncia.id);
                }
            });
            article.appendChild(supportButton);
        }

        if (user && String(user.id) === String(denuncia.id_utilizador)) {
            const ownerActions = document.createElement('div');
            ownerActions.className = 'report-owner-actions';

            const editLink = document.createElement('a');
            editLink.className = 'btn-secondary';
            editLink.href = `nova-denuncia.html?id=${encodeURIComponent(denuncia.id)}`;
            editLink.textContent = 'Editar';
            ownerActions.appendChild(editLink);

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn-danger';
            deleteButton.textContent = 'Excluir';
            deleteButton.addEventListener('click', async () => {
                if (!window.confirm('Tem certeza de que deseja excluir esta denúncia? Esta ação não pode ser desfeita.')) {
                    return;
                }

                deleteButton.disabled = true;
                try {
                    await window.deleteDenunciaGlobal(denuncia.id);
                    article.remove();
                    if (!container.querySelector('.product-card')) {
                        renderFeed([], container, { ...options, emptyMessage: 'Você ainda não publicou denúncias.' });
                    }
                } catch (error) {
                    window.alert(`Não foi possível excluir a denúncia: ${error.message}`);
                    deleteButton.disabled = false;
                }
            });
            ownerActions.appendChild(deleteButton);
            article.appendChild(ownerActions);
        }

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
