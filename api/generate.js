export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "APIキーない" });
  }

  try {
    const baseUrl =
      req.headers.origin ||
      `https://${req.headers.host}`;

    // 画像一覧取得
    const imagesRes = await fetch(`${baseUrl}/api/images`);
    const imagesData = await imagesRes.json();
    const images = imagesData.images || [];

    console.log("images:", images);

    const prompt = `
photorealistic portrait of a japanese woman,
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
        version: "33279060bbbb8858700eb2146350a98d96ef334fcf817f37eb05915e1534aa1c",
        input: { prompt }
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

      console.log("生成成功:", imageUrl);

      return res.status(200).json({ image: imageUrl });
    } else {
      console.log("生成失敗:", result);

      // 🔥 fallback（絶対画像出す）
      return res.status(200).json({
        image: "https://picsum.photos/300?random=" + Math.random()
      });
    }

  } catch (e) {
    console.error("ERROR:", e);

    // 🔥 fallback
    return res.status(200).json({
      image: "https://picsum.photos/300?random=" + Math.random()
    });
  }
}
