const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'Token de autenticação não fornecido.' });
    }

    const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
    if (!token) {
        return res.status(403).json({ message: 'Formato do token inválido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_default');
        req.user = decoded; // Injeta o usuário na requisição (ex: req.user.id)
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = {
    verifyToken
};
