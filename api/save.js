import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  const { image_url } = req.body;

  // ① 画像ダウンロード
  const response = await fetch(image_url);
  const buffer = await response.arrayBuffer();

  // ② ファイル名作る
  const fileName = `face_${Date.now()}.jpg`;

  // ③ Storageにアップロード
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('faces')
    .upload(fileName, buffer, {
      contentType: 'image/jpeg'
    });

  if (uploadError) {
    return res.status(500).json({ error: uploadError });
  }

  // ④ 公開URL取得
  const { data: publicUrlData } = supabase
    .storage
    .from('faces')
    .getPublicUrl(fileName);

  const publicUrl = publicUrlData.publicUrl;

  // ⑤ DB保存
  const { data, error } = await supabase
    .from('images')
    .insert([{ url: publicUrl }]);

  if (error) {
    return res.status(500).json({ error });
  }

  res.status(200).json({ success: true, url: publicUrl });
}
