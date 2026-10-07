const denunciaModel = require('../models/denunciaModel');
const midiasModel = require('../models/midiasModel');
const apoioModel = require('../models/apoioModel');
const userModel = require('../models/userModel');
const emailService = require('../utils/emailService');

const { validateMediaWithAI } = require('../utils/aiValidator');

exports.createDenuncia = async (req, res) => {
    try {
        const id_utilizador = req.user.id;
        const { titulo, descricao, morada, bairro, anonimo, privado, notificacao_pref, midias } = req.body;

        if (!titulo || !descricao || !morada || !bairro) {
            return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
        }

        // 1. Validação de Tamanho e Repetição
        if (titulo.length < 10 || titulo.length > 100) {
            return res.status(400).json({ message: 'O título deve ter entre 10 e 100 caracteres.' });
        }
        if (/(.)\1{4,}/.test(titulo) || /(.)\1{4,}/.test(descricao)) {
            return res.status(400).json({ message: 'Texto inválido: muitos caracteres repetidos consecutivamente.' });
        }

        if (descricao.length < 30 || descricao.length > 1000) {
            return res.status(400).json({ message: 'A descrição deve ter entre 30 e 1000 caracteres.' });
        }
        const wordCount = descricao.trim().split(/\s+/).length;
        if (wordCount < 5) {
            return res.status(400).json({ message: 'A descrição deve conter pelo menos 5 palavras.' });
        }

        if (bairro.length < 5 || /^\d+$/.test(bairro) || morada.length < 5) {
            return res.status(400).json({ message: 'O bairro e a morada devem ser válidos (mínimo 5 letras, não apenas números).' });
        }

        // 2. Filtro de Profanidade Simples
        const badWords = ['puta', 'caralho', 'merda', 'foda', 'foder', 'cuzão', 'cuzao', 'fdp'];
        const textToCheck = `${titulo} ${descricao} ${morada} ${bairro}`.toLowerCase();
        if (badWords.some(word => textToCheck.includes(word))) {
            return res.status(400).json({ message: 'A denúncia contém linguagem imprópria e foi bloqueada.' });
        }

        // 3. Validação de Mídia Obrigatória e Tamanho/Tipo
        if (!midias || midias.length === 0) {
            return res.status(400).json({ message: 'É obrigatório enviar pelo menos 1 arquivo de mídia (imagem ou vídeo).' });
        }

        for (let midia of midias) {
            if (!midia.url_ou_base64) {
                 return res.status(400).json({ message: 'Arquivo de mídia inválido.' });
            }
            // 3MB limite (em base64 o tamanho aumenta ~33%, então 3MB = ~4.19MB em caracteres)
            if (midia.url_ou_base64.length > 4200000) {
                 return res.status(400).json({ message: 'O tamanho do arquivo excede o limite de 3MB permitido.' });
            }
            // Verificar mime types aceitos
            const header = midia.url_ou_base64.substring(0, 50);
            if (!header.match(/^data:(image\/(jpeg|png|webp)|video\/(mp4|webm));base64,/)) {
                 return res.status(400).json({ message: 'Formato de arquivo não suportado. Envie JPG, PNG, WEBP, MP4 ou WEBM.' });
            }

            // 4. Moderação por IA (Google Gemini)
            const aiValidation = await validateMediaWithAI(midia.url_ou_base64);
            if (!aiValidation.isValid) {
                return res.status(400).json({ message: `Imagem rejeitada pelo filtro de segurança: ${aiValidation.reason}` });
            }
        }

        // Sanitização será tratada via frontend ou biblioteca dedicada, aqui barramos lixo principal.

        const novaDenuncia = await denunciaModel.createDenuncia({
            id_utilizador,
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            morada: morada.trim(),
            bairro: bairro.trim(),
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

        const t = titulo.trim();
        const d = descricao.trim();
        const m = morada.trim();
        const b = bairro.trim();

        if (t.length < 10 || t.length > 100) return res.status(400).json({ message: 'O título deve ter entre 10 e 100 caracteres.' });
        if (d.length < 30 || d.length > 1000) return res.status(400).json({ message: 'A descrição deve ter entre 30 e 1000 caracteres.' });
        if (d.split(/\s+/).length < 5) return res.status(400).json({ message: 'A descrição deve conter pelo menos 5 palavras.' });
        if (b.length < 5 || /^\d+$/.test(b) || m.length < 5) return res.status(400).json({ message: 'Endereço inválido.' });
        if (/(.)\1{4,}/.test(t) || /(.)\1{4,}/.test(d)) return res.status(400).json({ message: 'Texto inválido (caracteres repetidos).' });

        const badWords = ['puta', 'caralho', 'merda', 'foda', 'foder', 'cuzão', 'cuzao', 'fdp'];
        const textToCheck = `${t} ${d} ${m} ${b}`.toLowerCase();
        if (badWords.some(word => textToCheck.includes(word))) {
            return res.status(400).json({ message: 'A denúncia contém linguagem imprópria e não pode ser editada dessa forma.' });
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
