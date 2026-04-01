export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "APIキーない" });
  }

  try {
    // ① 生成開始
    const start = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "←ここにコピーしたやつ入れる",
        input: {
          prompt: "photorealistic portrait of a japanese woman, realistic skin, natural lighting, 85mm lens"
        }
      })
    });

    const startData = await start.json();

    if (!startData.urls || !startData.urls.get) {
      return res.status(500).json({ error: "開始失敗", detail: startData });
    }

    const getUrl = startData.urls.get;

    // ② 完成まで待つ（最大10回）
    let result;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1500));

      const check = await fetch(getUrl, {
        headers: {
          "Authorization": `Token ${token}`
        }
      });

      result = await check.json();

      if (result.status === "succeeded") break;
    }

    // ③ 画像URL返す
    if (result.status === "succeeded") {
      return res.status(200).json({
        image: result.output[0]
      });
    } else {
      return res.status(500).json({
        error: "生成失敗",
        detail: result
      });
    }

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
