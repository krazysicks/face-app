import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // 🔥 ここ修正
);

export default async function handler(req, res) {
  try {
    const { image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: "image_urlない" });
    }

    // 🔥 重複チェック（これ重要）
    const { data: existing } = await supabase
      .from('images')
      .select('*')
      .eq('url', image_url)
      .maybeSingle();

    if (existing) {
      return res.status(200).json({ success: true, url: existing.url });
    }

    // ① 画像ダウンロード
    const response = await fetch(image_url);
    const buffer = await response.arrayBuffer();

    // ② ファイル名（被り防止）
    const fileName = `face_${Date.now()}_${Math.floor(Math.random()*10000)}.jpg`;

    // ③ Storageアップロード
    const { error: uploadError } = await supabase.storage
      .from('faces')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ error: uploadError });
    }

    // ④ 公開URL
    const { data: publicUrlData } = supabase
      .storage
      .from('faces')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // ⑤ DB保存
    const { error } = await supabase
      .from('images')
      .insert([{ url: publicUrl }]);

    if (error) {
      console.error(error);
      return res.status(500).json({ error });
    }

    return res.status(200).json({
      success: true,
      url: publicUrl
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "保存失敗" });
  }
}
