const denunciaModel = require('../models/denunciaModel');
const midiasModel = require('../models/midiasModel');
const apoioModel = require('../models/apoioModel');
const userModel = require('../models/userModel');
const nodemailer = require('nodemailer');

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

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({ message: 'O novo estado é obrigatório.' });
        }

        const denuncia = await denunciaModel.getDenunciaById(id);
        if (!denuncia) {
            return res.status(404).json({ message: 'Denúncia não encontrada.' });
        }

        const atualizada = await denunciaModel.updateStatus(id, estado);

        if (denuncia.notificacao_pref === 'email') {
            const user = await userModel.findUserById(denuncia.id_utilizador);
            if (user && user.email) {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || 'smtp.example.com',
                    port: process.env.SMTP_PORT || 587,
                    auth: {
                        user: process.env.SMTP_USER || 'user',
                        pass: process.env.SMTP_PASS || 'pass'
                    }
                });

                const mailOptions = {
                    from: `"Alerta Cidadão" <${process.env.SMTP_USER || 'no-reply@alertacidadao.pt'}>`,
                    to: user.email,
                    subject: `Atualização de Estado - Denúncia: ${denuncia.titulo}`,
                    text: `Olá ${user.nome},\n\nO estado da sua denúncia "${denuncia.titulo}" foi atualizado para: ${estado}.\n\nObrigado por usar o Alerta Cidadão!`
                };

                transporter.sendMail(mailOptions).catch(err => {
                    console.error('Erro ao enviar email de notificação:', err);
                });
            }
        }

        res.json({ message: 'Estado atualizado com sucesso.', denuncia: atualizada });
    } catch (error) {
        console.error('Erro ao atualizar estado:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
