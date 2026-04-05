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
model: "stability-ai/sdxl"
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

      // 🚨 HTTPエラーチェック
      if (!start.ok) {
        const text = await start.text();
        console.error("START HTTP ERROR:", text);
        throw new Error("Replicate start failed");
      }

      const startData = await start.json();
      console.log("START:", startData);

      // 🚨 URL取得できない場合
      if (!startData.urls?.get) {
        console.error("START ERROR:", startData);
        throw new Error("Start failed");
      }

      let result;

      // 🔁 ステータス確認ループ
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 3000)); // ← 3秒待機

        const check = await fetch(startData.urls.get, {
          headers: { "Authorization": `Token ${token}` }
        });

        result = await check.json();
        console.log("CHECK:", result.status);

        if (result.status === "succeeded") break;

        if (result.status === "failed") {
          console.error("REPLICATE FAILED:", result);
          throw new Error(result.error || "Replicate failed");
        }
      }

      // 画像取得
      if (result?.output) {
        imageUrl = Array.isArray(result.output)
          ? result.output[0]
          : result.output;
      }
    }

    // =========================
    // 🔥 fallback（必ず画像）
    // =========================
    if (!imageUrl) {
      console.warn("⚠ fallback使用");
      imageUrl = "https://thispersondoesnotexist.com/?" + Date.now();
    }

    console.log("FINAL IMAGE:", imageUrl);

    // =========================
    // 🔥 保存
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
      save: saveData
    });

  } catch (e) {
    console.error("❌ ERROR:", e);

    return res.status(500).json({
      error: e.message || "生成失敗"
    });
  }
}
