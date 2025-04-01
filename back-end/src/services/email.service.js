const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
 
  console.log('📤 Enviando e-mail para:', email);
 
  const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Redefinir Senha - Atlética Engênios',
    html: `
      <p>Olá!</p>
      <p>Para redefinir sua senha, clique no link abaixo:</p>
      <a href="${resetUrl}">Redefinir senha</a>
      <p>Este link expira em 1 hora.</p>
    `,
  });
 
  console.log('✅ Resultado do envio:', result);
};


module.exports = { sendResetPasswordEmail };