const db = require('../utils/db');
const { DateTime } = require('luxon');

const getUserByEmail = async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

const createUser = async (userData) => {
    const { name, email, password_hash, course, sex, birthday } = userData;
    const createdAt = DateTime.now().setZone('America/Sao_Paulo').toISO();
    const result = await db.query(
        'INSERT INTO users (name, email, password_hash, course, sex, birthday, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, email, password_hash, course, sex, birthday, createdAt]
    );
    return result.rows[0];
};

// Salva token para redefinição de senha
const saveResetToken = async (userId, resetToken, tokenExpiry) => {
    await db.query(
        'UPDATE users SET reset_token = $1, token_expiry = $2 WHERE id = $3',
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

const getUserById = async (id) => {
    const result = await db.query(
        'SELECT id, name, email, is_admin, course, sex, photo FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

const updateUser = async (userId, updates) => {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${index}`;
    values.push(userId);

    await db.query(query, values);
};

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const uploadUserPhoto = async (base64Image, userId) => {
  const fileName = `${userId}-${uuidv4()}.png`;
  const base64Data = base64Image.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  const uint8Array = new Uint8Array(buffer);

  const { error } = await supabase.storage
    .from('profile-photos')
    .upload(`users/${fileName}`, uint8Array, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error('Erro detalhado do Supabase:', error);
    throw new Error('Erro ao fazer upload da imagem no Supabase');
  }

  const { data } = supabase.storage.from('profile-photos').getPublicUrl(`users/${fileName}`);
  return data.publicUrl;
};

module.exports = {
    getUserByEmail,
    createUser,
    saveResetToken,
    getUserByResetToken,
    updateUserPassword,
    clearResetToken,
    getUserById,
    updateUser,
    uploadUserPhoto
};