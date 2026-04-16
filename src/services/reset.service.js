const crypto    = require('crypto');
const bcrypt    = require('bcryptjs');
const usuarioRepository = require('../repositories/usuario.repository');
const mailService       = require('./mail.service');

const solicitarReset = async (correo) => {
  const usuario = await usuarioRepository.findByCorreo(correo);

  // Siempre respondemos igual para no revelar si el correo existe
  if (!usuario || !usuario.activo) return;

  const token  = crypto.randomBytes(32).toString('hex');
  const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await usuarioRepository.updateResetToken(usuario.id, token, expira);

  const enlace = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await mailService.enviarCorreo({
    destinatario: correo,
    asunto: 'Restablecer contraseña - Asiatic Connection',
    mensaje: `Hola ${usuario.nombre},\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nHaz clic en el siguiente enlace para continuar:\n${enlace}\n\nEste enlace expira en 1 hora.\n\nSi no solicitaste esto, ignora este correo.`,
    esHtml: false,
    adjuntos: []
  });
};

const resetPassword = async (token, password_nuevo) => {
  const usuario = await usuarioRepository.findByResetToken(token);

  if (!usuario) {
    throw { status: 400, message: 'Token inválido' };
  }

  if (new Date() > new Date(usuario.reset_token_expira)) {
    throw { status: 400, message: 'El enlace ha expirado, solicita uno nuevo' };
  }

  const password_hash = await bcrypt.hash(password_nuevo, 10);
  await usuarioRepository.updateResetPassword(usuario.id, password_hash);
};

module.exports = { solicitarReset, resetPassword };