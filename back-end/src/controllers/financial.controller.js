const financialService = require('../services/financial.service');

const createTransaction = async (req, res) => {
    try {
        const { title, value, date, relates_to, user_id, type, note } = req.body;

        console.log('relates_to no backend:', relates_to);

        const finalUserId = user_id || 0;

        if (!title || !value || !date || !relates_to || finalUserId === undefined || finalUserId === null || isNaN(finalUserId) || !type) {
            return res.status(400).json({ message: 'Missing or invalid required fields' });
        }

        const transaction = await financialService.createTransaction({
            title,
            value,
            date,
            relates_to,
            user_id: finalUserId,
            type,
            note,
        });

        return res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating transaction' });
    }
};

const listTransactions = async (req, res) => {
    try {
        const user = await require('../services/user.service').getUserById(req.user.userId);
        if (!user || !user.is_admin) {
            return res.status(403).json({ message: 'Acesso negado: apenas administradores' });
        }

        const transactions = await financialService.listTransactions();
        return res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao listar transações' });
    }
};

const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { title, value, date, relates_to, note } = req.body;

    if (!title || !value || !date || !relates_to) {
        return res.status(400).json({ message: 'Campos obrigatórios ausentes ou inválidos' });
    }

    try {
        const transaction = await financialService.updateTransaction(id, {
            title,
            value,
            date,
            relates_to,
            note,
        });

        return res.status(200).json(transaction);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao atualizar transação' });
    }
};

const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await financialService.deleteTransaction(id);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao deletar transação' });
    }
};

module.exports = {
    createTransaction,
    listTransactions,
    updateTransaction,
    deleteTransaction,
};