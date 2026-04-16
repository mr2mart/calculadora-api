const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const auth = require('../middlewares/auth.middleware');

// PUT /api/usuarios/:id/datos
router.put('/:id/datos', auth, usuarioController.updateDatos);

// PUT /api/usuarios/:id/password
router.put('/:id/password', auth, usuarioController.updatePassword);

module.exports = router;
