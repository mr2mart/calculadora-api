const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;
    const result = await authService.login(correo, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register };
