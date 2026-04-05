import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { data } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false });

  res.status(200).json({ images: data || [] });
}
