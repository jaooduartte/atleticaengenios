const authenticate = require('./src/middleware/auth.middleware');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/auth.routes');
const financialRoutes = require('./src/routes/financial.routes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://atleticaengenios.vercel.app'
  ],
  credentials: true
}));app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

const authController = require('./src/controllers/auth.controller');
app.post('/api/auth/login', authController.loginUser);
app.get('/api/health', (req, res) => res.send('ok'));

app.use('/api/auth', authRoutes);
app.use('/api/financial', financialRoutes);

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});