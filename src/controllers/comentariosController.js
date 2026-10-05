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
