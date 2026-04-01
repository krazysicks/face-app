export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "APIキーない" });
  }

  try {
    // ① 生成開始
    const startRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "db21e45b3f3e9b6a4b7c6a9d1d0e5f8c9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
        input: {
          prompt: "beautiful japanese woman, realistic face, portrait, high quality",
          width: 512,
          height: 512
        }
      })
    });

    const startData = await startRes.json();

    if (!startData.urls?.get) {
      return res.status(500).json({ error: "生成開始失敗", startData });
    }

    let result;

    // ② 待機（最大30秒）
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000));

      const checkRes = await fetch(startData.urls.get, {
        headers: {
          "Authorization": `Token ${token}`
        }
      });

      result = await checkRes.json();

      if (result.status === "succeeded") break;
      if (result.status === "failed") {
        return res.status(500).json({ error: "生成失敗", result });
      }
    }

    const image = result?.output?.[0];

    if (!image) {
      return res.status(500).json({ error: "画像なし", result });
    }

    return res.status(200).json({ image });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
