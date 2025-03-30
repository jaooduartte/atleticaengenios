const bcrypt = require('bcryptjs');
const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt.config');
const crypto = require('crypto');
const emailService = require('../services/email.service');

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userService.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
    return res.json({ token, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao autenticar o usuário' });
  }
};

const register = async (req, res) => {
  const { name, email, password, course, sex, birthday } = req.body;

  try {
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe', type: 'error' });
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

    return res.status(201).json({ message: 'Usuário cadastrado com sucesso!', type: 'success' });

  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    return res.status(500).json({ message: 'Erro ao cadastrar usuário.', type: 'error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'E-mail não cadastrado.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // 1 hora de validade

    await userService.saveResetToken(user.id, resetToken, tokenExpiry);

    await emailService.sendResetPasswordEmail(email, resetToken);

    return res.json({ message: 'E-mail enviado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar e-mail de redefinição.' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await userService.getUserByResetToken(token);
    if (!user || user.token_expiry < Date.now()) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userService.updateUserPassword(user.id, hashedPassword);
    await userService.clearResetToken(user.id);

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao redefinir senha.' });
  }
};

module.exports = { login, register, forgotPassword, resetPassword };