const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
const authenticate = require('./src/middleware/auth.middleware');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/auth.routes');
const financialRoutes = require('./src/routes/financial.routes');
const adminRoutes = require('./src/routes/admin.routes');
const userRoutes = require('./src/routes/user.routes');
const productRoutes = require('./src/routes/product.routes');
const authController = require('./src/controllers/auth.controller');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://atleticaengenios.vercel.app'
  ],
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.post('/api/auth/login', authController.loginUser);
app.get('/api/health', (req, res) => res.send('ok'));
app.use('/api/auth', authRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', upload.single('image'), productRoutes);

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});