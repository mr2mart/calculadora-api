const usuarioService = require('../services/usuario.service');

const updateDatos = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await usuarioService.updateDatos(id, req.body, req.usuario.correo);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await usuarioService.updatePassword(id, req.body, req.usuario.correo);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { updateDatos, updatePassword };
