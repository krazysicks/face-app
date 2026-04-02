let images = []; // メモリ保存（最初はこれでOK）

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ images });
  }

  if (req.method === "POST") {
    const { url } = req.body;
    images.push({
      url,
      score: 0
    });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "PUT") {
    const { winner, loser } = req.body;

    images[winner].score += 1;
    images[loser].score -= 1;

    return res.status(200).json({ ok: true });
  }
}
