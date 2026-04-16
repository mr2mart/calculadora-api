const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuario.repository');

const login = async (correo, password) => {
  const usuario = await usuarioRepository.findByCorreo(correo);

  if (!usuario || !usuario.activo) {
    throw { status: 401, message: 'Credenciales inválidas' };
  }

  const passwordValido = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordValido) {
    throw { status: 401, message: 'Credenciales inválidas' };
  }

  const roles = usuario.roles.map(ur => ur.rol.nombre);

  const token = jwt.sign(
    { id: usuario.id, correo: usuario.correo, roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      alias: usuario.alias,
      celular: usuario.celular,
      roles
    }
  };
};

const register = async (data) => {
  const existe = await usuarioRepository.findByCorreo(data.correo);
  if (existe) {
    throw { status: 409, message: 'El correo ya está registrado' };
  }

  const password_hash = await bcrypt.hash(data.password, 10);

  const usuario = await usuarioRepository.create({
    nombre: data.nombre,
    correo: data.correo,
    password_hash,
    celular: data.celular,
    usuario_registro: data.correo,
    roles: {
      create: {
        rol_id: 2, // ROLE_USER por defecto
        usuario_registro: data.correo
      }
    }
  });

  return { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo };
};

module.exports = { login, register };
