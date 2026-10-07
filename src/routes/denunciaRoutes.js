const express = require('express');
const router = express.Router();
const denunciaController = require('../controllers/denunciaController');
const { verifyToken } = require('../middleware/authMiddleware');
const { adminAuthMiddleware } = require('../middleware/adminAuthMiddleware');

// Middleware opcional para injetar req.user sem bloquear
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_default');
        } catch (err) { }
    }
    next();
};

router.get('/', denunciaController.getAllDenuncias);
router.get('/minhas', verifyToken, denunciaController.getMyDenuncias);
router.get('/:id', optionalAuth, denunciaController.getDenunciaById);

// Montar as rotas de comentários aninhadas sob a denúncia
const comentariosRoutes = require('./comentariosRoutes');
router.use('/:id_denuncia/comentarios', comentariosRoutes);

router.post('/', verifyToken, denunciaController.createDenuncia);
router.post('/:id/apoio', verifyToken, denunciaController.toggleApoio);
router.patch('/:id', verifyToken, denunciaController.updateOwnDenuncia);
router.delete('/:id', verifyToken, denunciaController.deleteOwnDenuncia);

// Rota de administração
router.get('/admin/todas', verifyToken, adminAuthMiddleware, denunciaController.getAllDenunciasAdmin);
router.patch('/:id/estado', verifyToken, adminAuthMiddleware, denunciaController.updateStatus);
router.put('/:id/status', verifyToken, adminAuthMiddleware, denunciaController.updateStatus);

module.exports = router;
