const financialService = require('../services/financial.service');

// Function to create a new transaction (income/expense)
const createTransaction = async (req, res) => {
    try {
        const { title, value, date, relates_to, user_id, type } = req.body;

        // Verifique o valor de relates_to aqui
        console.log('relates_to no backend:', relates_to);

        // Se não tiver user_id, insira um valor genérico
        const finalUserId = user_id || 0; // ID genérico padrão como BIGINT

        if (!title || !value || !date || !relates_to || finalUserId === undefined || finalUserId === null || isNaN(finalUserId) || !type) {
            return res.status(400).json({ message: 'Missing or invalid required fields' });
        }

        const transaction = await financialService.createTransaction({
            title,
            value,
            date,
            relates_to,
            user_id: finalUserId, // Usando o user_id genérico ou o real
            type,
        });

        return res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating transaction' });
    }
};

// Function to list all transactions
const listTransactions = async (req, res) => {
    try {
        const transactions = await financialService.listTransactions();
        return res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error listing transactions' });
    }
};

module.exports = {
    createTransaction,
    listTransactions,
};