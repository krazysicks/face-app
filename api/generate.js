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
        version: "db21e45b...ここは後でOK（とりあえず動作確認用）",
        input: {
          prompt: "beautiful japanese woman, portrait, realistic face"
        }
      })
    });

    const data = await response.json();

    // 🔥 ここ重要（ログ）
    console.log(data);

    // 仮：ダミー返す（まず動作確認）
    return res.status(200).json({
      image: "https://picsum.photos/400"
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
