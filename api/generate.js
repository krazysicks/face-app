export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "APIキーない" });
  }

  try {
    // 既存画像取得
    const baseUrl = req.headers.origin;
    const imagesRes = await fetch(`${baseUrl}/api/images`);
    const imagesData = await imagesRes.json();

    const images = imagesData.images || [];

    // 上位3つ取得
    const top = images
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // プロンプト強化
    const stylePrompt = top.length > 0
      ? "similar face style to previously preferred images"
      : "";

    const prompt = `
photorealistic portrait of a japanese woman,
${stylePrompt},
natural lighting, 85mm lens,
realistic skin texture, detailed eyes
`;

    // 生成開始
    const start = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "39ed52f2a78e9341e0d2e6c2f1f7a196ee83fed3673d299c92c45ea1ab696648",
        input: {
          prompt: prompt
        }
      })
    });

    const startData = await start.json();
    console.log("START:", startData);

    if (!startData.urls?.get) {
      return res.status(500).json({ error: "開始失敗", detail: startData });
    }

    const getUrl = startData.urls.get;

    let result;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1500));

      const check = await fetch(getUrl, {
        headers: { "Authorization": `Token ${token}` }
      });

      result = await check.json();
      console.log("RESULT:", result);

      if (result.status === "succeeded") break;
    }

    if (result.status === "succeeded") {
      const imageUrl = Array.isArray(result.output)
        ? result.output[0]
        : result.output;

      return res.status(200).json({
        image: imageUrl
      });
    } else {
      return res.status(500).json({
        error: "生成失敗",
        detail: result
      });
    }

  } catch (e) {
    console.error("ERROR:", e);
    return res.status(500).json({ error: e.message });
  }
}
