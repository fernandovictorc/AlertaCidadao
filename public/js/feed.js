import { deleteDenuncia, getDenuncias, getMyDenuncias, toggleApoio } from './api.js';

window.deleteDenunciaGlobal = deleteDenuncia;
window.toggleApoioGlobal = async (id) => {
    if (!isAuthenticated()) {
        alert('Você precisa estar logado para apoiar.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const result = await toggleApoio(id);
        const count = document.getElementById(`apoios-count-${id}`);
        if (count) {
            const currentCount = Number.parseInt(count.textContent, 10) || 0;
            count.textContent = currentCount + (result.apoiado ? 1 : -1);
        }
    } catch (error) {
        alert(error.message);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    updateHeaderAuthUI();

    const container = document.querySelector('.feed-container');
    if (!container) {
        return;
    }
    
    // Mostra o skeleton loading enquanto busca da API
    if (typeof renderSkeleton === 'function') {
        renderSkeleton(container, 4);
    }

    try {
        const isMine = container.dataset.feed === 'mine';
        const response = isMine ? await getMyDenuncias() : await getDenuncias();
        let denuncias = response ? response.denuncias : null;

        if (!Array.isArray(denuncias)) {
            throw new Error("A resposta da API está malformada ou não contém denúncias.");
        }

        if (container.dataset.status === 'progress') {
            denuncias = denuncias.filter(denuncia => {
                const status = normalizeStatus(denuncia.estado);
                return status !== 'nao respondido' && !status.startsWith('conclu');
            });
        } else if (container.dataset.status === 'completed') {
            denuncias = denuncias.filter(denuncia => normalizeStatus(denuncia.estado).startsWith('conclu'));
        }

        renderFeed(denuncias, container, {
            showSupport: !isMine,
            emptyMessage: isMine ? 'Você ainda não publicou denúncias.' : 'Nenhuma denúncia encontrada nesta categoria.'
        });
    } catch (error) {
        container.replaceChildren();
        const message = document.createElement('p');
        message.textContent = `Não foi possível carregar as denúncias: ${error.message}`;
        container.appendChild(message);

        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn-danger';
        clearBtn.textContent = 'Sair e Voltar ao Início';
        clearBtn.style.marginTop = '15px';
        clearBtn.onclick = () => {
            if (typeof logout === 'function') {
                logout();
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            }
        };
        container.appendChild(clearBtn);
    }
});

function normalizeStatus(status = '') {
    return status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
}
