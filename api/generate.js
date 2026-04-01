import fetch from "node-fetch";
import FormData from "form-data";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUD_API_KEY = process.env.CLOUD_API_KEY;
const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;

let cache = [];

export default async function handler(req, res) {
  // 🔥 キャッシュがあればそれ返す（70%）
  if (cache.length > 20 && Math.random() < 0.7) {
    const random = cache[Math.floor(Math.random() * cache.length)];
    return res.status(200).json({ image: random });
  }

  const prompt = req.query.prompt || "beautiful woman portrait";

  // 🧠 Replicateで画像生成
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version: "db21e45f...", // ← Stable DiffusionモデルID（後で入れる）
      input: {
        prompt: prompt
      }
    })
  });

  const data = await response.json();

  // ⏳ 完了待ち（簡易版）
  let imageUrl = null;

  while (!imageUrl) {
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${data.id}`, {
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`
      }
    });

    const pollData = await poll.json();

    if (pollData.status === "succeeded") {
      imageUrl = pollData.output[0];
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  // ☁️ Cloudinaryに保存
  const form = new FormData();
  form.append("file", imageUrl);
  form.append("upload_preset", "ml_default");

  const upload = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: form
    }
  );

  const uploaded = await upload.json();
  const finalUrl = uploaded.secure_url;

  // 🔥 キャッシュに追加
  cache.push(finalUrl);

  res.status(200).json({ image: finalUrl });
}
