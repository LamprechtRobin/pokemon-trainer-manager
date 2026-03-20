const { createClient } = require('@supabase/supabase-js');
const { getEnv } = require('./env');

let client = null;

const getSupabaseAdmin = () => {
  if (client) {
    return client;
  }

  const { supabaseUrl, supabaseServiceRoleKey } = getEnv();
  client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return client;
};

module.exports = {
  getSupabaseAdmin
};
