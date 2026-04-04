import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error });
  }

  if (!data || data.length < 2) {
    return res.status(200).json({ images: data });
  }

  // シャッフル（元配列壊さない）
  const shuffled = [...data].sort(() => 0.5 - Math.random());

  const selected = [];

  for (let i = 0; i < shuffled.length; i++) {
    const item = shuffled[i];

    // nullは除外
    if (!item.url) continue;

    if (selected.length === 0) {
      selected.push(item);
    } else {
      if (
        item.id !== selected[0].id &&
        item.url !== selected[0].url
      ) {
        selected.push(item);
        break;
      }
    }
  }

  // 万が一2枚取れなかった場合
  if (selected.length < 2) {
    const fallback = data.filter(d => d.url).slice(0, 2);
    return res.status(200).json({ images: fallback });
  }

  return res.status(200).json({ images: selected });
}
