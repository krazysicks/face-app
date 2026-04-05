export default async function handler(req, res) {
  const baseUrl =
    req.headers.origin ||
    `https://${req.headers.host}`;

  let imagesRes = await fetch(`${baseUrl}/api/get-images`);
  let data = await imagesRes.json();
  let images = data.images || [];

  // 🔥 足りない分だけ生成（間隔あける）
  while (images.length < 2) {
    await fetch(`${baseUrl}/api/generate`);

    // 🔥 429回避
    await new Promise(r => setTimeout(r, 9000));

    imagesRes = await fetch(`${baseUrl}/api/get-images`);
    data = await imagesRes.json();
    images = data.images || [];
  }

  const shuffled = images.sort(() => 0.5 - Math.random());

  const first = shuffled[0];
  const second = shuffled.find(img => img.id !== first.id) || shuffled[1];

  res.status(200).json({ images: [first, second] });
}
