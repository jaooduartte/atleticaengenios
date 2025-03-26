const { Pool } = require('pg');
require('dotenv').config(); // Para carregar as variáveis do .env

// Criação da conexão com o banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL de conexão ao banco que está no .env
  ssl: {
    rejectUnauthorized: false, // Desativa a verificação SSL (necessário para o Supabase)
  },
});

// Função para realizar consultas no banco
const query = (text, params) => pool.query(text, params);

// Função para fechar a conexão
const close = () => pool.end();

module.exports = {
  query,
  close,
};