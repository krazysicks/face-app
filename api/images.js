import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {

  if (req.method === "GET") {
    const { data } = await supabase
      .from('images')
      .select('*');

    return res.status(200).json({ images: data });
  }

  if (req.method === "POST") {
    const { url } = req.body;

    await supabase.from('images').insert({ url });

    return res.status(200).json({ ok: true });
  }

  if (req.method === "PUT") {
    const { winner, loser } = req.body;

    await supabase.rpc('update_score', {
      winner_id: winner,
      loser_id: loser
    });

    return res.status(200).json({ ok: true });
  }
}
