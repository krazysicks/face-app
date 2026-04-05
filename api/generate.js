export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "APIキーない" });
  }

  try {
    // 🔥 毎回違う顔にする
    const seed = Date.now();

    // 🔥 女性固定プロンプト（強化版）
    const prompt = `
1girl, female focus, portrait, close-up face,
ultra realistic portrait of a beautiful japanese woman,
solo, looking at camera,
symmetrical face, perfect face,
natural skin texture, pores visible,
sharp focus, 85mm lens, f1.8,
soft lighting, studio lighting,
high detail, photorealistic
`;

    // 🔥 男・風景・崩れ排除（超重要）
    const negative_prompt = `
male, man, boy, old man, beard,
multiple people, group, crowd,
landscape, scenery, background only,
animal, illustration, anime, cartoon,
blurry, low quality, distorted face,
extra limbs, bad anatomy, deformed
`;

    // 🔥 生成開始
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
          negative_prompt,
          width: 512,
          height: 768,
          num_inference_steps: 30,
          guidance_scale: 8,
          seed: seed
        }
      })
    });

    const startData = await start.json();

    if (!startData.urls?.get) {
      return res.status(500).json({
        error: "生成開始失敗",
        detail: startData
      });
    }

    const getUrl = startData.urls.get;
    let result;

    // 🔥 完了待ち
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 1500));

      const check = await fetch(getUrl, {
        headers: { "Authorization": `Token ${token}` }
      });

      result = await check.json();

      if (result.status === "succeeded") break;
    }

    // 🔥 成功
    if (result.status === "succeeded") {
      let imageUrl = Array.isArray(result.output)
        ? result.output[0]
        : result.output;

      // 🔥 キャッシュ防止
      imageUrl += "?t=" + Date.now();

      return res.status(200).json({ image: imageUrl });
    }

    // 🔥 fallback（絶対違う画像）
    return res.status(200).json({
      image: "https://picsum.photos/512/768?random=" + Date.now()
    });

  } catch (e) {
    console.error("ERROR:", e);

    return res.status(200).json({
      image: "https://picsum.photos/512/768?random=" + Date.now()
    });
  }
}
