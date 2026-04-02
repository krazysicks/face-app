let images = [];

export default async function handler(req, res) {

  if (req.method === "GET") {
    return res.status(200).json({ images });
  }

  if (req.method === "POST") {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URLない" });
    }

    images.push({
      id: Date.now() + Math.random(),
      url,
      score: 0
    });

    console.log("追加:", url);

    return res.status(200).json({ ok: true });
  }

  if (req.method === "PUT") {
    const { winner, loser } = req.body;

    const w = images.find(i => i.id === winner);
    const l = images.find(i => i.id === loser);

    if (w) w.score++;
    if (l) l.score--;

    images = images.filter(img => img.score > -3);

    return res.status(200).json({ ok: true });
  }
}
