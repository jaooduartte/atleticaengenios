const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.getAllUsers = async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { is_admin, role, is_active } = req.body;

  const fieldsToUpdate = {};
  if (is_admin !== undefined) fieldsToUpdate.is_admin = is_admin;
  if (role !== undefined) fieldsToUpdate.role = role;
  if (is_active !== undefined) fieldsToUpdate.is_active = is_active;

  const { data, error } = await supabase
    .from('users')
    .update(fieldsToUpdate)
    .eq('auth_id', id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data?.[0]);
};