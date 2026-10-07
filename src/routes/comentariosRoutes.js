const express = require('express');
const router = express.Router({ mergeParams: true }); // Para acessar params do pai
const comentariosController = require('../controllers/comentariosController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', comentariosController.getComentarios);
router.post('/', verifyToken, comentariosController.createComentario);
router.delete('/:id', verifyToken, comentariosController.deleteComentario);

module.exports = router;
