const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

const optionalVerifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_default');
                req.user = decoded;
            } catch (err) {
                // Token inválido, mas continua como anônimo
            }
        }
    }
    next();
};

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', verifyToken, userController.getUserProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.patch('/primeiro-acesso', verifyToken, userController.disablePrimeiroAcesso);
router.get('/:id', optionalVerifyToken, userController.getUserById);

module.exports = router;
