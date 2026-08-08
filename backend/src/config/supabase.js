const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseServiceRoleKey } = require('./env');

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;
