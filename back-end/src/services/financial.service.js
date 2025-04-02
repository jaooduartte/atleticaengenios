const db = require('../utils/db');  // Importando a conexão do banco

// Função para criar uma nova transação (despesa/receita)
const createTransaction = async (transactionData) => {
    const { title, value, date, relates_to, user_id, type } = transactionData;

    // Garantir que 'relates_to' nunca seja vazio ou indefinido
    if (!relates_to) {
        console.error('Campo "relates_to" não foi preenchido');
        throw new Error('Campo "relates_to" não foi preenchido');
    }

    if (isNaN(user_id)) {
        console.error('user_id deve ser um número inteiro');
        throw new Error('user_id inválido');
    }

    const queryText = `
        INSERT INTO transactions (title, value, date, relates_to, user_id, type, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *;
    `;

    const queryValues = [title, parseFloat(value), date, relates_to, parseInt(user_id), type];

    try {
        const res = await db.query(queryText, queryValues); // Realizando a consulta no banco
        return res.rows[0];  // Retorna o registro inserido
    } catch (error) {
        console.log(queryValues);
        console.error('Erro ao criar transação:', error);
        throw error; // Repassa o erro
    }
};

// Função para listar todas as transações
const listTransactions = async () => {
    const queryText = `
        SELECT t.*, u.name AS user_name
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 100;
    `;

    try {
        const res = await db.query(queryText); // Realizando a consulta para listar transações
        return res.rows;  // Retorna todas as transações
    } catch (error) {
        console.error('Erro ao listar transações:', error);
        throw error; // Repassa o erro
    }
};

module.exports = {
    createTransaction,
    listTransactions,
};