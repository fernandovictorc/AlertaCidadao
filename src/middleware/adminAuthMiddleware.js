const adminAuthMiddleware = (req, res, next) => {
    if (!req.user || (req.user.perfil !== 'admin' && req.user.role !== 'admin')) {
        return res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' });
    }
    next();
};

module.exports = { adminAuthMiddleware };
