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
        version: "33279060bbbb8858700eb2146350a98d96ef334fcf817f37eb05915e1534aa1c",
        input: {
          prompt: "photorealistic portrait of a japanese woman, realistic skin, natural lighting, 85mm lens"
        }
      })
    });

    const startData = await start.json();
    console.log("START:", startData);

    if (!startData.urls || !startData.urls.get) {
      return res.status(500).json({ error: "開始失敗", detail: startData });
    }

    const getUrl = startData.urls.get;

    // ② 完成待ち
    let result;
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 1500));

      const check = await fetch(getUrl, {
        headers: {
          "Authorization": `Token ${token}`
        }
      });

      result = await check.json();
      console.log("CHECK:", result);

      if (result.status === "succeeded") break;
    }

    // ③ 結果返す
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
