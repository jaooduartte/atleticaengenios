const db = require('../utils/db');
const { DateTime } = require('luxon');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const createSupabaseUser = async ({ email, password, name, course, sex, birthday }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, course, sex, birthday },
      emailRedirectTo: 'http://localhost:3000/confirm'
    }
  });

  if (error) {
    console.error('Erro detalhado do Supabase:', error.message, error.details);
    throw new Error(error.message);
  }

  return data.user;
};

// Criação dos metadados do usuário com vínculo no campo auth_id
const createUserMetadata = async (uid, metadata, email) => {
  const { course, sex, name, birthday } = metadata;
  const createdAt = DateTime.now().setZone('America/Sao_Paulo').toISO();

  const result = await db.query(
    `INSERT INTO users (auth_id, course, sex, name, birthday, email, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [uid, course, sex, name, birthday, email, createdAt]
  );

  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await db.query(
    'SELECT id, name, course, sex, photo, is_admin FROM users WHERE auth_id = $1',
    [id]
  );
  return result.rows[0];
};

const updateUser = async (authId, updates) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${index}`);
    values.push(value);
    index++;
  }

  if (fields.length === 0) return;
  const query = `UPDATE users SET ${fields.join(', ')} WHERE auth_id = $${index}`;
  values.push(authId);
  await db.query(query, values);
};

const { v4: uuidv4 } = require('uuid');

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

const getUserByEmail = async (email) => {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

module.exports = {
  createSupabaseUser,
  createUserMetadata,
  getUserById,
  updateUser,
  uploadUserPhoto,
  getUserByEmail
};