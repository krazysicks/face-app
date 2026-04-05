export default async function handler(req, res) {
  const baseUrl =
    req.headers.origin ||
    `https://${req.headers.host}`;

  // 🔥 画像取得
  let imagesRes = await fetch(`${baseUrl}/api/get-images`);
  let data = await imagesRes.json();
  let images = data.images || [];

  // 🔥 足りない分だけ生成（429対策で待機）
  while (images.length < 2) {
    await fetch(`${baseUrl}/api/generate`);

    // 🔥 ここ超重要（429防止）
    await new Promise(r => setTimeout(r, 9000));

    imagesRes = await fetch(`${baseUrl}/api/get-images`);
    data = await imagesRes.json();
    images = data.images || [];
  }

  // 🔥 ランダム2枚（完全重複防止）
  const shuffled = images.sort(() => 0.5 - Math.random());

  let first = shuffled[0];
  let second = shuffled.find(img => img.id !== first.id);

  // 念のためfallback
  if (!second) second = shuffled[1];

  res.json({ images: [first, second] });
}
