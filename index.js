const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

// Middlewares globales
app.use(cors({
  origin: frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rutas
app.use('/api/auth',         require('./src/routes/auth.routes'));
app.use('/api/usuarios',     require('./src/routes/usuario.routes'));
app.use('/api/cotizaciones', require('./src/routes/cotizacion.routes'));
app.use('/api/catalogos',    require('./src/routes/catalogo.routes'));
app.use('/api/reset',        require('./src/routes/reset.routes'));

// Middleware de manejo de errores global
app.use(require('./src/middlewares/error.middleware'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});