import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { image_url } = req.body;

    console.log("SAVE START:", image_url);

    if (!image_url) {
      return res.status(400).json({ error: "image_urlない" });
    }

    // 画像取得
    const response = await fetch(image_url);
    const buffer = await response.arrayBuffer();

    const fileName = `face_${Date.now()}_${Math.floor(Math.random()*10000)}.jpg`;

    // Storageアップロード
    const { error: uploadError } = await supabase.storage
      .from('faces')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error("UPLOAD ERROR:", uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    // URL取得
    const { data: publicUrlData } = supabase
      .storage
      .from('faces')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    console.log("UPLOADED:", publicUrl);

    // DB保存
    const { error } = await supabase
      .from('images')
      .insert([{ url: publicUrl }]);

    if (error) {
      console.error("DB ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      url: publicUrl
    });

  } catch (e) {
    console.error("SAVE ERROR:", e);
    return res.status(500).json({ error: "保存失敗" });
  }
}
