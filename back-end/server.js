const authenticate = require('./src/middleware/auth.middleware');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/auth.routes');
const financialRoutes = require('./src/routes/financial.routes');
const adminRoutes = require('./src/routes/admin.routes');
const userRoutes = require('./src/routes/user.routes');
const authController = require('./src/controllers/auth.controller');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'https://atleticaengenios.vercel.app'
    ];

    const isVercelPreview = origin.includes('atleticaengenios-git') && origin.includes('.vercel.app');

    if (allowedOrigins.includes(origin) || isVercelPreview) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.post('/api/auth/login', authController.loginUser);
app.get('/api/health', (req, res) => res.send('ok'));
app.use('/api/auth', authRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});