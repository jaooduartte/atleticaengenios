const db = require('../utils/db');

const createTransaction = async (transactionData) => {
    const { title, value, date, relates_to, user_id, type } = transactionData;

    if (!relates_to) {
        console.error('Campo "relates_to" não foi preenchido');
        throw new Error('Campo "relates_to" não foi preenchido');
    }

    if (isNaN(user_id)) {
        console.error('user_id deve ser um número inteiro');
        throw new Error('user_id inválido');
    }

    const queryText = `
        INSERT INTO transactions (title, value, date, relates_to, user_id, type, created_at, note)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *;
    `;

    const queryValues = [title, parseFloat(value), date, relates_to, parseInt(user_id), type];

    try {
        const res = await db.query(queryText, queryValues);
        return res.rows[0];
    } catch (error) {
        console.log(queryValues);
        console.error('Erro ao criar transação:', error);
        throw error;
    }
};

const listTransactions = async () => {
    const queryText = `
        SELECT t.*, u.name AS user_name
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 100;
    `;

    try {
        const res = await db.query(queryText);
        return res.rows;
    } catch (error) {
        console.error('Erro ao listar transações:', error);
        throw error;
    }
};

const updateTransaction = async (id, transactionData) => {
    const { title, value, date, relates_to, note } = transactionData;
    const queryText = `
        UPDATE transactions
        SET title = $1, value = $2, date = $3, relates_to = $4, note = $5
        WHERE id = $6
        RETURNING *;
    `;
    const queryValues = [title, parseFloat(value), date, relates_to, note, id];
    try {
        const res = await db.query(queryText, queryValues);
        return res.rows[0];
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        throw error;
    }
};

const deleteTransaction = async (id) => {
    const queryText = 'DELETE FROM transactions WHERE id = $1';
    try {
        await db.query(queryText, [id]);
        return { message: 'Transação deletada com sucesso' };
    } catch (error) {
        console.error('Erro ao deletar transação:', error);
        throw error;
    }
};

module.exports = {
    createTransaction,
    listTransactions,
    updateTransaction,
    deleteTransaction,
};