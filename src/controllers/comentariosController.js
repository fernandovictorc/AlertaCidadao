const comentariosModel = require('../models/comentariosModel');

exports.createComentario = async (req, res) => {
    try {
        const id_utilizador = req.user.id;
        const { id_denuncia } = req.params;
        const { texto } = req.body;

        if (!texto) {
            return res.status(400).json({ message: 'O texto do comentário é obrigatório.' });
        }

        const novoComentario = await comentariosModel.createComentario({
            id_denuncia,
            id_utilizador,
            texto
        });

        res.status(201).json({ message: 'Comentário adicionado.', comentario: novoComentario });
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getComentarios = async (req, res) => {
    try {
        const { id_denuncia } = req.params;
        const comentarios = await comentariosModel.getComentariosByDenuncia(id_denuncia);
        res.json({ comentarios });
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.deleteComentario = async (req, res) => {
    try {
        console.log("==> [DEBUG DELETE COMENTARIO] Iniciando rota. Params:", req.params);
        const id_comentario = req.params.id;
        const id_utilizador_logado = req.user.id;
        
        console.log("==> [DEBUG] ID Comentario requisitado:", id_comentario);
        console.log("==> [DEBUG] ID Utilizador Logado:", id_utilizador_logado);

        const comentario = await comentariosModel.getComentarioById(id_comentario);
        console.log("==> [DEBUG] Comentario encontrado no DB:", comentario);

        if (!comentario) {
            console.log("==> [DEBUG] Retornando 404: Comentario não encontrado no banco.");
            return res.status(404).json({ message: 'Comentário não encontrado.' });
        }
        
        if (String(comentario.id_utilizador) !== String(id_utilizador_logado) && req.user.role !== 'admin' && req.user.perfil !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado. Apenas o autor ou admin pode excluir o comentário.' });
        }
        
        await comentariosModel.deleteComentario(id_comentario);
        res.json({ message: 'Comentário excluído com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir comentário:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
