const prisma = require('../config/prisma');

const findByCorreo = (correo) => {
  return prisma.usuario.findUnique({
    where: { correo },
    include: {
      roles: {
        include: { rol: true }
      }
    }
  });
};

const findById = (id) => {
  return prisma.usuario.findUnique({
    where: { id },
    include: {
      roles: {
        include: { rol: true }
      }
    }
  });
};

const create = (data) => {
  return prisma.usuario.create({ data });
};

const updateDatos = (id, data) => {
  return prisma.usuario.update({
    where: { id },
    data: {
      ...data,
      fecha_modificacion: new Date()
    }
  });
};

const updatePassword = (id, password_hash, usuario_modificacion) => {
  return prisma.usuario.update({
    where: { id },
    data: {
      password_hash,
      usuario_modificacion,
      fecha_modificacion: new Date()
    }
  });
};

const findByResetToken = (token) => {
  return prisma.usuario.findFirst({
    where: { reset_token: token, activo: true }
  });
};

const updateResetToken = (id, token, expira) => {
  return prisma.usuario.update({
    where: { id },
    data: {
      reset_token:        token,
      reset_token_expira: expira,
      fecha_modificacion: new Date()
    }
  });
};

const updateResetPassword = (id, password_hash) => {
  return prisma.usuario.update({
    where: { id },
    data: {
      password_hash,
      reset_token:        null,
      reset_token_expira: null,
      fecha_modificacion: new Date()
    }
  });
};

module.exports = {
  findByCorreo, findById, create,
  updateDatos, updatePassword,
  findByResetToken, updateResetToken, updateResetPassword
};
