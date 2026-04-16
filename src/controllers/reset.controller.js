const resetService = require('../services/reset.service');

const solicitar = async (req, res, next) => {
  try {
    await resetService.solicitarReset(req.body.correo);
    // Siempre respondemos igual para no revelar si el correo existe
    res.json({ message: 'Si el correo existe recibirás un enlace en tu bandeja' });
  } catch (err) {
    next(err);
  }
};

const resetear = async (req, res, next) => {
  try {
    await resetService.resetPassword(req.body.token, req.body.password_nuevo);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { solicitar, resetear };