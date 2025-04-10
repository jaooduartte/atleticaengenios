const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/auth.routes');
const financialRoutes = require('./src/routes/financial.routes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/financial', financialRoutes);

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});