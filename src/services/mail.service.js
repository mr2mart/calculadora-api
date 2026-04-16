const nodemailer = require('nodemailer');
const configuracionRepository = require('../repositories/configuracion.repository');

const enviarCorreo = async ({ destinatario, asunto, mensaje, esHtml = false, adjuntos = [] }) => {
  const from     = await configuracionRepository.getByNombre('Mail.From');
  const password = await configuracionRepository.getByNombre('Mail.Password');
  const puerto   = await configuracionRepository.getByNombre('Mail.Port');
  const servidor = await configuracionRepository.getByNombre('Mail.Server');
  const ssl      = await configuracionRepository.getByNombre('Mail.SSL');
  const cc       = await configuracionRepository.getByNombre('Mail.CC.Operacion');

  const transporter = nodemailer.createTransport({
    host: servidor,
    port: parseInt(puerto),
    secure: false, // true solo para puerto 465
    auth: { user: from, pass: password },
    starttls: { enable: ssl === 'true' }
  });

  await transporter.sendMail({
    from,
    to: destinatario,
    cc,
    subject: asunto,
    [esHtml ? 'html' : 'text']: mensaje,
    attachments: adjuntos  // [{ filename: 'cotizacion.pdf', content: bufferPdf }]
  });

  console.log(`Correo enviado a ${destinatario}`);
};

module.exports = { enviarCorreo };