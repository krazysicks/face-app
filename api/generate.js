export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "APIキーない" });
  }

  try {
    // 🔥 女性固定＋男性・風景完全排除
    const prompt = `
ultra realistic portrait of a beautiful japanese woman,
solo, looking at camera,
symmetrical face, perfect face,
natural skin texture, pores visible,
85mm lens, f1.8, sharp focus,
soft studio lighting,
photorealistic, high detail
`;

    const negative_prompt = `
male, man, boy,
multiple people,
landscape, scenery, background only,
blurry, low quality, deformed, ugly face
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
          num_inference_steps: 25,
          guidance_scale: 7,
          seed: Math.floor(Math.random() * 1000000) // 🔥 同じ顔防止
        }
      })
    });

    const startData = await start.json();

    if (!startData.urls?.get) {
      throw new Error("生成開始失敗");
    }

    const getUrl = startData.urls.get;

    let result;

    // 🔥 待機ループ（最大40秒）
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 2000));

      const check = await fetch(getUrl, {
        headers: { "Authorization": `Token ${token}` }
      });

      result = await check.json();

      if (result.status === "succeeded") break;
    }

    if (result.status === "succeeded") {
      const imageUrl = Array.isArray(result.output)
        ? result.output[0]
        : result.output;

      return res.status(200).json({ image: imageUrl });
    }

    // 🔥 fallback（必ず女性）
    return res.status(200).json({
      image: "https://thispersondoesnotexist.com/?" + Date.now()
    });

  } catch (e) {
    console.error(e);

    return res.status(200).json({
      image: "https://thispersondoesnotexist.com/?" + Date.now()
    });
  }
}
