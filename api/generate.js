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

    // 🔥 顔生成専用プロンプト（強化版）
    const prompt = `
ultra realistic portrait of a beautiful japanese woman,
solo, looking at camera,
symmetrical face, perfect face,
natural skin texture, pores visible,
sharp focus, 85mm lens, f1.8,
soft lighting, studio lighting,
high detail, photorealistic,
no blur, no distortion
`;

    // 🔥 生成開始（モデル変更済み）
    const start = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "ac732df83cea7fffcb7f3a2f4a9e3a5a3f9e6e4b07c6fba58828a741b93d7c5d",
        input: {
          prompt,
          width: 512,
          height: 768,
          num_inference_steps: 30,
          guidance_scale: 7.5
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
    for (let i = 0; i < 25; i++) {
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

      // fallback（必ず画像返す）
      return res.status(200).json({
        image: "https://picsum.photos/512/768?random=" + Math.random()
      });
    }

  } catch (e) {
    console.error("ERROR:", e);

    // fallback
    return res.status(200).json({
      image: "https://picsum.photos/512/768?random=" + Math.random()
    });
  }
}
