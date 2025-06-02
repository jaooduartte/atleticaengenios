const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

const authenticate = require('../middleware/auth.middleware');
router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, authController.updateProfile);

router.post('/register', authController.registerUser);
router.post('/reset-password', authController.resetPassword);
router.post('/check-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'E-mail não fornecido.' });
  }

  try {
    const user = await require('../services/user.service').getUserByEmail(email);
    res.json({ exists: !!user });
  } catch (error) {
    console.error('Erro ao verificar e-mail:', error);
    res.status(500).json({ error: 'Erro interno ao verificar e-mail.' });
  }
});

router.get('/check-status', authenticate, async (req, res) => {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { userId } = req.user;

  const { data, error } = await supabase
    .from('users')
    .select('is_active')
    .eq('auth_id', userId)
    .single();

  if (error || !data) {
    return res.status(401).json({ is_active: false });
  }

  res.json({ is_active: data.is_active });
});

module.exports = router;