export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "APIキーない" });
  }

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // 👇 とりあえず軽いモデル（重要）
        version: "a9758cbf7a7c9d8c8f9c8c7e7f6e5d4c3b2a19087654321abcdefabcdef1234",
        input: {
          prompt: "portrait photo of a beautiful japanese woman"
        }
      })
    });

    const data = await response.json();

    // 🔥 ここで全部返す（超重要）
    return res.status(200).json(data);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
