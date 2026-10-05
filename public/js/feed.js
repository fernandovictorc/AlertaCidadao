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

    try {
        const isMine = container.dataset.feed === 'mine';
        const response = isMine ? await getMyDenuncias() : await getDenuncias();
        let denuncias = response.denuncias;

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
    }
});

function normalizeStatus(status = '') {
    return status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
}
