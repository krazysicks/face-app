export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  try {
    const baseUrl =
      req.headers.origin ||
      `https://${req.headers.host}`;

    let imageUrl;

    // =========================
    // 🔥 Replicate生成
    // =========================
    if (token) {
      const start = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          version: "ac732df83cea7fffcb7f3a2f4a9e3a5a3f9e6e4b07c6fba58828a741b93d7c5d",
          input: {
            prompt: "ultra realistic portrait of a beautiful japanese woman",
            negative_prompt: "male, man, multiple people, landscape",
            width: 512,
            height: 768,
            num_inference_steps: 20,
            seed: Math.floor(Math.random() * 1000000)
          }
        })
      });

      const startData = await start.json();
      console.log("START:", startData);

      if (startData.urls?.get) {
        let result;

        for (let i = 0; i < 15; i++) {
          await new Promise(r => setTimeout(r, 2000));

          const check = await fetch(startData.urls.get, {
            headers: { "Authorization": `Token ${token}` }
          });

          result = await check.json();
          console.log("CHECK:", result.status);

          if (result.status === "succeeded") break;
        }

        if (result?.output) {
          imageUrl = Array.isArray(result.output)
            ? result.output[0]
            : result.output;
        }
      }
    }

    // =========================
    // 🔥 fallback（必ず画像）
    // =========================
    if (!imageUrl) {
      imageUrl = "https://thispersondoesnotexist.com/?" + Date.now();
    }

    console.log("FINAL IMAGE:", imageUrl);

    // =========================
    // 🔥 保存（ここが本命）
    // =========================
    const saveRes = await fetch(`${baseUrl}/api/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image_url: imageUrl
      })
    });

    const saveData = await saveRes.json();
    console.log("SAVE RESULT:", saveData);

    return res.status(200).json({
      image: imageUrl,
      save: saveData // ←確認用
    });

  } catch (e) {
    console.error("ERROR:", e);

    return res.status(500).json({
      error: "生成失敗"
    });
  }
}
