export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "APIキーない" });
  }

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "stability-ai/sdxl", // とりあえずOK
        input: {
          prompt: "beautiful japanese woman, realistic face, portrait, high quality",
          width: 512,
          height: 512
        }
      })
    });

    const data = await response.json();

    // 🔥 ここ超重要：画像URL取り出し
    const image = data.output?.[0];

    if (!image) {
      return res.status(500).json({ error: "画像生成失敗", data });
    }

    return res.status(200).json({ image });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
