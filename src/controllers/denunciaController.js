const denunciaModel = require('../models/denunciaModel');
const midiasModel = require('../models/midiasModel');
const apoioModel = require('../models/apoioModel');
const userModel = require('../models/userModel');
const emailService = require('../utils/emailService');

exports.createDenuncia = async (req, res) => {
    try {
        const id_utilizador = req.user.id;
        const { titulo, descricao, morada, bairro, anonimo, privado, notificacao_pref, midias } = req.body;

        if (!titulo || !descricao || !morada || !bairro) {
            return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
        }

        const novaDenuncia = await denunciaModel.createDenuncia({
            id_utilizador,
            titulo,
            descricao,
            morada,
            bairro,
            anonimo: anonimo || false,
            privado: privado || false,
            notificacao_pref: notificacao_pref || 'email'
        });

        if (midias && midias.length > 0) {
            for (let midia of midias) {
                await midiasModel.addMidia(novaDenuncia.id, midia.tipo, midia.url_ou_base64);
            }
        }

        if (novaDenuncia.notificacao_pref === 'email') {
            try {
                const user = await userModel.findUserById(id_utilizador);
                if (user && user.email) {
                    await emailService.sendDenunciaCreatedEmail(user.email, user.nome, novaDenuncia.titulo);
                }
            } catch (emailErr) {
                console.error('Erro ao enviar email de criação de denúncia:', emailErr);
            }
        }

        res.status(201).json({ message: 'Denúncia criada com sucesso.', denuncia: novaDenuncia });
    } catch (error) {
        console.error('Erro ao criar denúncia:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getAllDenuncias = async (req, res) => {
    try {
        const denuncias = await denunciaModel.getAllPublicDenuncias();
        
        // Puxar midias para cada (em um caso real, fazer um join ou fetch otimizado)
        for (let d of denuncias) {
            const midias = await midiasModel.getMidiasByDenuncia(d.id);
            d.midias = midias;
        }

        res.json({ denuncias });
    } catch (error) {
        console.error('Erro ao buscar denúncias:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getMyDenuncias = async (req, res) => {
    try {
        const denuncias = await denunciaModel.getDenunciasByUser(req.user.id);
        for (const denuncia of denuncias) {
            denuncia.midias = await midiasModel.getMidiasByDenuncia(denuncia.id);
        }
        res.json({ denuncias });
    } catch (error) {
        console.error('Erro ao buscar denúncias do usuário:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getAllDenunciasAdmin = async (req, res) => {
    try {
        const denuncias = await denunciaModel.getAllDenunciasAdmin();
        
        for (let d of denuncias) {
            const midias = await midiasModel.getMidiasByDenuncia(d.id);
            d.midias = midias;
        }

        res.json({ denuncias });
    } catch (error) {
        console.error('Erro ao buscar denúncias admin:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getDenunciaById = async (req, res) => {
    try {
        const { id } = req.params;
        const denuncia = await denunciaModel.getDenunciaById(id);
        
        if (!denuncia) {
            return res.status(404).json({ message: 'Denúncia não encontrada.' });
        }

        // Se for privada e o usuário logado não for o autor (requer verificação de JWT)
        if (denuncia.privado) {
            if (!req.user || req.user.id !== denuncia.id_utilizador) {
                // Aqui estamos assumindo que rotas publicas podem passar sem token.
                // Mas getDenunciaById precisa injetar req.user sem bloquear se for opcional.
                return res.status(403).json({ message: 'Acesso negado. Esta denúncia é privada.' });
            }
        }

        const midias = await midiasModel.getMidiasByDenuncia(denuncia.id);
        denuncia.midias = midias;

        res.json({ denuncia });
    } catch (error) {
        console.error('Erro ao buscar denúncia:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.toggleApoio = async (req, res) => {
    try {
        const id_utilizador = req.user.id;
        const { id } = req.params;

        const resultado = await apoioModel.toggleApoio(id, id_utilizador);
        res.json(resultado);
    } catch (error) {
        console.error('Erro ao dar apoio:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.updateOwnDenuncia = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { titulo, descricao, morada, bairro } = req.body;

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({ message: 'Identificador de denúncia inválido.' });
        }

        if (![titulo, descricao, morada, bairro].every(value => typeof value === 'string' && value.trim())) {
            return res.status(400).json({ message: 'Título, descrição, endereço e bairro são obrigatórios.' });
        }

        if (titulo.trim().length > 150 || morada.trim().length > 255 || bairro.trim().length > 100) {
            return res.status(400).json({ message: 'Um ou mais campos excedem o tamanho permitido.' });
        }

        const denuncia = await denunciaModel.updateOwnDenuncia(id, req.user.id, {
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            morada: morada.trim(),
            bairro: bairro.trim()
        });

        if (!denuncia) {
            return res.status(404).json({ message: 'Denúncia não encontrada ou você não tem permissão para editá-la.' });
        }

        res.json({ message: 'Denúncia atualizada com sucesso.', denuncia });
    } catch (error) {
        console.error('Erro ao editar denúncia:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.deleteOwnDenuncia = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({ message: 'Identificador de denúncia inválido.' });
        }

        const removida = await denunciaModel.deleteOwnDenuncia(id, req.user.id);

        if (!removida) {
            return res.status(404).json({ message: 'Denúncia não encontrada ou você não tem permissão para excluí-la.' });
        }

        res.json({ message: 'Denúncia excluída com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir denúncia:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const estado = req.body.estado || req.body.status;
        const resposta_orgao = req.body.resposta_orgao || null;

        if (!estado) {
            return res.status(400).json({ message: 'O novo estado é obrigatório.' });
        }

        const denuncia = await denunciaModel.getDenunciaById(id);
        if (!denuncia) {
            return res.status(404).json({ message: 'Denúncia não encontrada.' });
        }

        const atualizada = await denunciaModel.updateStatus(id, estado, resposta_orgao);

        if (denuncia.notificacao_pref === 'email') {
            try {
                const user = await userModel.findUserById(denuncia.id_utilizador);
                if (user && user.email) {
                    await emailService.sendDenunciaStatusEmail(user.email, user.nome, denuncia.titulo, estado, resposta_orgao);
                }
            } catch (emailErr) {
                console.error('Erro ao enviar email de notificação de status:', emailErr);
            }
        }

        res.json({ message: 'Estado atualizado com sucesso.', denuncia: atualizada });
    } catch (error) {
        console.error('Erro ao atualizar estado:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
