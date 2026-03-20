const { getSupabaseAdmin } = require('../_lib/supabase');
const { TRAINERS_TABLE, normalizeTrainerPayload } = require('../_lib/trainers');
const { handleCorsPreflight, setCorsHeaders } = require('../_lib/cors');

module.exports = async (req, res) => {
  try {
    const preflightResponse = handleCorsPreflight(req, res);
    if (preflightResponse) return preflightResponse;
    setCorsHeaders(req, res);

    const supabase = getSupabaseAdmin();

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from(TRAINERS_TABLE)
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        throw error;
      }

      return res.status(200).json(data ?? []);
    }

    if (req.method === 'POST') {
      const payload = await normalizeTrainerPayload(req.body);
      const { data, error } = await supabase
        .from(TRAINERS_TABLE)
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json({ id: data.id });
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({ error: message });
  }
};
