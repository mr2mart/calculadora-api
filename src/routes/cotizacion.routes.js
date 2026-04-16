const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacion.controller');
const auth = require('../middlewares/auth.middleware');

// Todos los endpoints de cotizaciones requieren autenticación
router.use(auth);

// GET    /api/cotizaciones
router.get('/',        cotizacionController.getAll);

// GET    /api/cotizaciones/:id
router.get('/:id',     cotizacionController.getById);

// POST   /api/cotizaciones
router.post('/',       cotizacionController.create);

// PUT    /api/cotizaciones/:id
router.put('/:id',     cotizacionController.update);

// DELETE /api/cotizaciones/:id
router.delete('/:id',  cotizacionController.remove);

// GET /api/cotizaciones/:id/pdf
router.get('/:id/pdf', cotizacionController.descargarPDF);

module.exports = router;
