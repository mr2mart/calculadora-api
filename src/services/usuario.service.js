const bcrypt = require('bcryptjs');
const usuarioRepository = require('../repositories/usuario.repository');

const updateDatos = async (id, data, usuarioActual) => {
  const { nombre, celular, alias } = data;
  return usuarioRepository.updateDatos(id, {
    nombre,
    celular,
    alias,
    usuario_modificacion: usuarioActual
  });
};

const updatePassword = async (id, data, usuarioActual) => {
  const { password_actual, password_nuevo } = data;

  const usuario = await usuarioRepository.findById(id);
  if (!usuario) throw { status: 404, message: 'Usuario no encontrado' };

  const valido = await bcrypt.compare(password_actual, usuario.password_hash);
  if (!valido) throw { status: 400, message: 'La contraseña actual es incorrecta' };

  const password_hash = await bcrypt.hash(password_nuevo, 10);
  await usuarioRepository.updatePassword(id, password_hash, usuarioActual);

  return { message: 'Contraseña actualizada correctamente' };
};

module.exports = { updateDatos, updatePassword };
