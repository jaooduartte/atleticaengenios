const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const financialService = require('./src/services/financial.service'); 
const authRoutes = require('./src/routes/auth.routes');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

app.post('/api/financial/transaction', async (req, res) => {
  try {
    const newTransaction = await financialService.createTransaction(req.body);
    res.json(newTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar a transação' });
  }
});

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});