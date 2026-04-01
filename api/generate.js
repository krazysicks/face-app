export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "APIキーない" });
  }

  try {
    // ① 生成リクエスト
    const startRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "stability-ai/sdxl",
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
    let status = "starting";

    // ② 完成するまで待つ（最大10回）
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1500)); // 1.5秒待機

      const checkRes = await fetch(startData.urls.get, {
        headers: {
          "Authorization": `Token ${token}`
        }
      });

      result = await checkRes.json();
      status = result.status;

      if (status === "succeeded") break;
      if (status === "failed") {
        return res.status(500).json({ error: "生成失敗", result });
      }
    }

    // ③ 画像取得
    const image = result?.output?.[0];

    if (!image) {
      return res.status(500).json({ error: "画像取得失敗", result });
    }

    return res.status(200).json({ image });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
