const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_default';

exports.registerUser = async (req, res) => {
    try {
        const { nome, email, senha, data_nascimento } = req.body;

        if (!nome || !email || !senha || !data_nascimento) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        const nascimento = new Date(data_nascimento);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const m = hoje.getMonth() - nascimento.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        if (idade < 16) {
            return res.status(400).json({ message: 'Você precisa ter pelo menos 16 anos para criar uma conta no Alerta Cidadão.' });
        }

        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'E-mail já está em uso.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        const newUser = await userModel.createUser({
            nome,
            email,
            senha: hashedPassword,
            data_nascimento,
            imagem_perfil: req.body.imagem_perfil || null
        });

        // Tentar enviar e-mail de boas-vindas
        try {
            await emailService.sendWelcomeEmail(email, nome);
        } catch (emailError) {
            console.error('Erro ao enviar e-mail de boas-vindas:', emailError);
            // Não bloqueia o registro se o e-mail falhar
        }

        res.status(201).json({ message: 'Usuário registrado com sucesso!', user: newUser });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }

        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const isMatch = await bcrypt.compare(senha, user.senha);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id: user.id, perfil: user.perfil }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Login bem-sucedido.',
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                imagem_perfil: user.imagem_perfil,
                perfil: user.perfil,
                primeiro_acesso: user.primeiro_acesso
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.disablePrimeiroAcesso = async (req, res) => {
    try {
        await userModel.disablePrimeiroAcesso(req.user.id);
        res.json({ message: 'Primeiro acesso desativado com sucesso.' });
    } catch (error) {
        console.error('Erro ao desativar primeiro acesso:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nome, imagem_perfil, bio, is_private } = req.body;

        const updatedUser = await userModel.updateUserProfile(userId, { nome, imagem_perfil, bio, is_private });
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.json({ message: 'Perfil atualizado com sucesso.', user: updatedUser });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const idParam = req.params.id;
        const targetUser = await userModel.findUserById(idParam);
        
        if (!targetUser) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        
        const isSelf = req.user ? req.user.id == idParam : false;
        const isAdmin = req.user ? (req.user.role === 'admin' || req.user.perfil === 'admin') : false;
        
        if (targetUser.is_private && !isSelf && !isAdmin) {
            return res.status(403).json({ erro: 'Perfil Privado' });
        }
        
        // Fetch denuncias for this user
        const denunciaModel = require('../models/denunciaModel');
        const denuncias = await denunciaModel.getDenunciasByUser(idParam);
        
        res.json({ user: targetUser, denuncias });
    } catch (error) {
        console.error('Erro ao buscar usuário por id:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.updateAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, senha } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'E-mail é obrigatório.' });
        }

        let senhaHash = null;
        if (senha && senha.trim() !== '') {
            senhaHash = await bcrypt.hash(senha, 10);
        }

        const updatedUser = await userModel.updateUserAccount(userId, email, senhaHash);
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.json({ message: 'Conta atualizada com sucesso.', user: updatedUser });
    } catch (error) {
        if (error.code === '23505') { // UNIQUE constraint violation in PostgreSQL
            return res.status(400).json({ message: 'Este e-mail já está em uso.' });
        }
        console.error('Erro ao atualizar conta:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
