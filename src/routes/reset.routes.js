const express = require('express');
const router  = express.Router();
const resetController = require('../controllers/reset.controller');

// POST /api/reset/solicitar
router.post('/solicitar', resetController.solicitar);

// POST /api/reset/password
router.post('/password', resetController.resetear);

module.exports = router;