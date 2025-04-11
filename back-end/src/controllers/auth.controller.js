const bcrypt = require('bcryptjs');
// Removed duplicate require; using userService below
const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt.config');
const crypto = require('crypto');
const emailService = require('../services/email.service');
const userService = require('../services/user.service');
const { DateTime } = require('luxon');

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userService.getUserByEmail(email);
  if (!user) return res.status(401).json({
    error: 'Usuário não encontrado',
    description: 'Verifique o e-mail digitado e tente novamente.'
  });

    const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return res.status(401).json({
    error: 'Usuário ou senha incorretos!',
    description: 'Confira suas credenciais e tente novamente.'
  });

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
    return res.json({ token, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro ao autenticar o usuário',
      description: 'Tente novamente mais tarde ou entre em contato com o suporte.'
    });
  }
};

const register = async (req, res) => {
  const { name, email, password, course, sex, birthday } = req.body;

  try {
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: 'Usuário já existe',
        description: 'Tente fazer login ou use outro e-mail.',
        type: 'error'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userService.createUser({
      name,
      email,
      password_hash: hashedPassword,
      course,
      sex,
      birthday,
    });

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      description: 'Redirecionando para a tela de login.',
      type: 'success'
    });

  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    return res.status(500).json({
      message: 'Erro ao cadastrar usuário.',
      description: 'Tente novamente mais tarde ou entre em contato com o suporte.',
      type: 'error'
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        error: 'E-mail não cadastrado.',
        description: 'Verifique se o e-mail está correto ou cadastre-se.'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const tokenExpiry = DateTime.now().setZone('America/Sao_Paulo').plus({ hours: 1 }).toISO();

    await userService.saveResetToken(user.id, resetToken, tokenExpiry);

    await emailService.sendResetPasswordEmail(email, resetToken);

    return res.json({ message: 'E-mail enviado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro ao enviar e-mail de redefinição.',
      description: 'Tente novamente mais tarde ou entre em contato com o suporte.'
    });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await userService.getUserByResetToken(token);
    if (!user || user.token_expiry < Date.now()) {
      return res.status(400).json({
        error: 'Token inválido ou expirado.',
        description: 'Solicite um novo link de redefinição de senha.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userService.updateUserPassword(user.id, hashedPassword);
    await userService.clearResetToken(user.id);

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro ao redefinir senha.',
      description: 'Tente novamente mais tarde ou entre em contato com o suporte.'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId, true); // << aqui era o erro
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json({ user: { ...user, is_admin: user.is_admin } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};
const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { name, course, sex, password, photo } = req.body;

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    let photoUrl;
    if (photo?.startsWith('data:image')) {
      photoUrl = await userService.uploadUserPhoto(photo, userId);
    }

    await userService.updateUser(userId, {
      name,
      course,
      sex,
      ...(photoUrl && { photo: photoUrl }),
      ...(hashedPassword && { password_hash: hashedPassword }),
    });

    res.json({ message: 'Perfil atualizado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
};
module.exports = { login, register, forgotPassword, resetPassword, getProfile, updateProfile };