const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt.config');

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
      description: 'Verifique suas credenciais e tente novamente'
    });
  }

  const { data: userRecord, error: fetchError } = await supabase
    .from('users')
    .select('is_active')
    .eq('auth_id', data.user.id)
    .single();

  if (fetchError || userRecord?.is_active === false) {
    return res.status(403).json({
      error: 'Usuário inativo',
      description: 'Sua conta está inativa. Entre em contato com a diretoria.',
      type: 'inactive_user'
    });
  }

  const userMetadata = await userService.getUserById(data.user.id);

  const jwtToken = jwt.sign({ userId: data.user.id }, secret, { expiresIn: '7d' });

  return res.json({ token: jwtToken, user: userMetadata });
};

const axios = require('axios');

const resetPassword = async (req, res) => {
  const { accessToken, newPassword } = req.body;

  try {
    await fetch('https://pkfjmobhbnvlyvfxcptd.supabase.co/auth/v1/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': process.env.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ password: newPassword }),
    });

    return res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir a senha:', error.response?.data || error.message);
    return res.status(400).json({ error: 'Erro ao redefinir a senha.' });
  }
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
  const { name, course, sex, photo, instagram, modalities, phone } = req.body;
  try {
    let photoUrl;
    if (photo?.startsWith('data:image')) {
      photoUrl = await userService.uploadUserPhoto(photo, userId);
    }
    await userService.updateUser(userId, {
      name,
      course,
      sex,
      phone,
      instagram,
      modalities,
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
    const user = await userService.createSupabaseUser({ email, password, name, course, sex, birthday });

    await userService.createUserMetadata(user.id, { name, course, sex, birthday }, email);

    res.status(201).json({ message: 'Usuário registrado com sucesso.', user_id: user.id });
  } catch (error) {
    console.error('Erro no cadastro:', error.message);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

module.exports = { getProfile, updateProfile, registerUser, loginUser, resetPassword };