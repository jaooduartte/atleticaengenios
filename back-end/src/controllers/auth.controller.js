const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt.config');
const bcrypt = require('bcrypt');

const supabase = require('@supabase/supabase-js').createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({
      error: 'Usuário ou senha incorretos!',
      description: error.message
    });
  }

  const userMetadata = await userService.getUserById(data.user.id);

  const jwtToken = jwt.sign({ userId: data.user.id }, secret, { expiresIn: '7d' });

  return res.json({ token: jwtToken, user: userMetadata });
};

const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { name, course, sex, photo } = req.body;
  try {
    let photoUrl;
    if (photo?.startsWith('data:image')) {
      photoUrl = await userService.uploadUserPhoto(photo, userId);
    }
    await userService.updateUser(userId, {
      name,
      course,
      sex,
      ...(photoUrl && { photo: photoUrl }),
    });
    res.json({ message: 'Perfil atualizado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
};

const registerUser = async (req, res) => {
  const { email, password, name, course, sex, birthday } = req.body;

  try {
    // Cria usuário no Supabase Auth
    const user = await userService.createSupabaseUser({ email, password, name, course, sex, birthday });

    // Cria usuário também na tabela public.users
    await userService.createUserMetadata(user.id, { name, course, sex, birthday }, email);

    res.status(201).json({ message: 'Usuário registrado com sucesso.', user_id: user.id });
  } catch (error) {
    console.error('Erro no cadastro:', error.message);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

module.exports = { getProfile, updateProfile, registerUser, loginUser };