export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "APIキーない" });
  }

  try {
    // 既存画像取得
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
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
portrait photo of a japanese woman,
${stylePrompt},
natural lighting, realistic face, 85mm lens,
clean skin, detailed eyes
`;

    // 生成開始
    const start = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "33279060bbbb8858700eb2146350a98d96ef334fcf817f37eb05915e1534aa1c",
        input: { prompt }
      })
    });

    const startData = await start.json();

    if (!startData.urls?.get) {
      return res.status(500).json({ error: "開始失敗", detail: startData });
    }

    const getUrl = startData.urls.get;

    let result;
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 1500));

      const check = await fetch(getUrl, {
        headers: { "Authorization": `Token ${token}` }
      });

      result = await check.json();

      if (result.status === "succeeded") break;
    }

    if (result.status === "succeeded") {
      return res.status(200).json({
        image: Array.isArray(result.output)
          ? result.output[0]
          : result.output
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
