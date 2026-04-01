export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "APIキーない" });
  }

  try {
    const startRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "ac732df83cea7fff8b46c8c0d4b4fdbd7b9d2f9c7e8e7c3e6c6c9f3a4b5c6d7e",
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
