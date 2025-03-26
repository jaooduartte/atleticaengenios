const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const financialService = require('./src/services/financial.service'); // Importa o serviço financeiro
const app = express();

// Permite que todas as origens acessem a API (para fins de desenvolvimento)
app.use(cors());

app.use(bodyParser.json());

// Rota para criar transação
app.post('/api/financial/transaction', async (req, res) => {
  try {
    const newTransaction = await financialService.createTransaction(req.body);
    res.json(newTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar a transação' });
  }
});

// Configuração do servidor
app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});