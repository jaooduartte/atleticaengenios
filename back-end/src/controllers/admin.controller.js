const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const createBoardTerm = async (req, res) => {
    const { year } = req.body;

    const { data, error } = await supabase
        .from('board_terms')
        .insert({ year })
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
};

const listBoardTerms = async (req, res) => {
    const { data, error } = await supabase
        .from('board_terms')
        .select('*')
        .order('year', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const getBoardMembers = async (req, res) => {
    const { termId } = req.params;

    const { data, error } = await supabase
        .from('board_members')
        .select('id, role, user_id, users(name, email)')
        .eq('board_term_id', termId);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const upsertBoardMember = async (req, res) => {
    const { termId } = req.params;
    const { role, user_id } = req.body;

    const { data, error } = await supabase
        .from('board_members')
        .upsert({ board_term_id: termId, role, user_id }, { onConflict: ['board_term_id', 'role'] })
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
};

const removeBoardMember = async (req, res) => {
    const { termId, role } = req.params;
    const { user_id } = req.query;

    const { error } = await supabase
        .from('board_members')
        .delete()
        .eq('board_term_id', termId)
        .eq('role', role)
        .eq('user_id', user_id);

    if (error) return res.status(500).json({ error: error.message });

    const { data: otherTerms, error: checkError } = await supabase
        .from('board_members')
        .select('*')
        .eq('user_id', user_id);

    if (!checkError && (otherTerms.length === 0)) {
        await supabase
            .from('users')
            .update({ role: null })
            .eq('auth_id', user_id);
    }

    res.status(204).end();
};

const inativarInativos = async (req, res) => {
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

module.exports = {
    createBoardTerm,
    listBoardTerms,
    getBoardMembers,
    upsertBoardMember,
    removeBoardMember,
    inativarInativos
};