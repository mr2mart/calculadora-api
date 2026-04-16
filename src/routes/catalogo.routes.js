const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogo.controller');
const auth = require('../middlewares/auth.middleware');

// Catálogos protegidos — el front los necesita al cargar el formulario
router.use(auth);

// GET /api/catalogos/unidades
router.get('/unidades',      catalogoController.getUnidades);

// GET /api/catalogos/paises
router.get('/paises',        catalogoController.getPaises);

// GET /api/catalogos/tipo-producto
router.get('/tipo-producto', catalogoController.getTipoProducto);

module.exports = router;
