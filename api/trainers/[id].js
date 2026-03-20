const { getSupabaseAdmin } = require('../_lib/supabase');
const { TRAINERS_TABLE, normalizeTrainerPayload } = require('../_lib/trainers');
const { handleCorsPreflight, setCorsHeaders } = require('../_lib/cors');

module.exports = async (req, res) => {
  try {
    const preflightResponse = handleCorsPreflight(req, res);
    if (preflightResponse) return preflightResponse;
    setCorsHeaders(req, res);

    const supabase = getSupabaseAdmin();
    const trainerId = req.query.id;

    if (!trainerId || typeof trainerId !== 'string') {
      return res.status(400).json({ error: 'Missing trainer id' });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from(TRAINERS_TABLE)
        .select('*')
        .eq('id', trainerId)
        .single();

      if (error && error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Trainer not found' });
      }

      if (error) {
        throw error;
      }

      return res.status(200).json(data);
    }

    if (req.method === 'PATCH') {
      const payload = await normalizeTrainerPayload(req.body);
      const { error } = await supabase
        .from(TRAINERS_TABLE)
        .update(payload)
        .eq('id', trainerId);

      if (error) {
        throw error;
      }

      return res.status(204).end();
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from(TRAINERS_TABLE)
        .delete()
        .eq('id', trainerId);

      if (error) {
        throw error;
      }

      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET,PATCH,DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({ error: message });
  }
};
