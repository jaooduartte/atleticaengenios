const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

exports.inativarInativos = async (req, res) => {
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) return res.status(500).json({ error: 'Erro ao buscar usuários do Auth' });

  const users = data?.users || [];

  const promises = users
    .filter(user => user.last_sign_in_at && new Date(user.last_sign_in_at) < seisMesesAtras)
    .map(user =>
      supabase.from('users')
        .update({ is_active: false })
        .eq('auth_id', user.id)
    );

  await Promise.all(promises);

  res.json({
    message: 'Verificação de usuários inativos finalizada',
    totalInativados: promises.length
  });
};