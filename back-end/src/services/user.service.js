const db = require('../utils/db');

const getUserByEmail = async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

const createUser = async (userData) => {
    const { name, email, password_hash, course, sex, birthday } = userData;
    const result = await db.query(
        'INSERT INTO users (name, email, password_hash, course, sex, birthday) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, email, password_hash, course, sex, birthday]
    );
    return result.rows[0]; // Retorna o usuário criado
};

// Salva token para redefinição de senha
const saveResetToken = async (userId, resetToken, tokenExpiry) => {
    await db.query(
        'UPDATE users SET reset_token = $1, token_expiry = to_timestamp($2 / 1000.0) WHERE id = $3',
        [resetToken, tokenExpiry, userId]
    );
};

// Recupera usuário pelo token de redefinição
const getUserByResetToken = async (token) => {
    const result = await db.query(
        'SELECT * FROM users WHERE reset_token = $1',
        [token]
    );
    return result.rows[0];
};

// Atualiza a senha do usuário
const updateUserPassword = async (userId, newPassword) => {
    await db.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPassword, userId]
    );
};

// Limpa o token após redefinição
const clearResetToken = async (userId) => {
    await db.query(
        'UPDATE users SET reset_token = NULL, token_expiry = NULL WHERE id = $1',
        [userId]
    );
};

module.exports = {
    getUserByEmail,
    createUser,
    saveResetToken,
    getUserByResetToken,
    updateUserPassword,
    clearResetToken
};