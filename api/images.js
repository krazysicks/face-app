let images = [];

export default async function handler(req, res) {

  // 取得
  if (req.method === "GET") {
    return res.status(200).json({ images });
  }

  // 追加
  if (req.method === "POST") {
    const { url } = req.body;

    images.push({
      id: Date.now() + Math.random(),
      url,
      score: 0
    });

    return res.status(200).json({ ok: true });
  }

  // スコア更新
  if (req.method === "PUT") {
    const { winner, loser } = req.body;

    const w = images.find(i => i.id === winner);
    const l = images.find(i => i.id === loser);

    if (w) w.score += 1;
    if (l) l.score -= 1;

    // 弱い個体削除（淘汰）
    images = images.filter(img => img.score > -3);

    return res.status(200).json({ ok: true });
  }
}
