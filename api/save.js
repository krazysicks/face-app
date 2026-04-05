import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const { image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: "image_urlない" });
    }

    const response = await fetch(image_url);
    const buffer = await response.arrayBuffer();

    const fileName = `face_${Date.now()}_${Math.random()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('faces')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError });
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('faces')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    await supabase
      .from('images')
      .insert([{ url: publicUrl }]);

    return res.status(200).json({ success: true, url: publicUrl });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "保存失敗" });
  }
}
