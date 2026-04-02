let currentImages = [];
let loading = false;

async function loadImages() {
  let res = await fetch("/api/images");
  let data = await res.json();

  let tries = 0;

  // 生成確率（徐々に減らす）
  const generationChance = Math.max(0.3, 1 - data.images.length * 0.1);

  while (data.images.length < 5 && tries < 5) {
    tries++;

    if (Math.random() > generationChance) break;

    const gen = await fetch("/api/generate");
    const g = await gen.json();

    console.log("生成:", g);

    if (g.image) {
      await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: g.image })
      });
    }

    res = await fetch("/api/images");
    data = await res.json();
  }

  // ランダム2枚
  const shuffled = [...data.images].sort(() => 0.5 - Math.random());
  currentImages = shuffled.slice(0, 2);

  document.getElementById("img1").src = currentImages[0]?.url || "";
  document.getElementById("img2").src = currentImages[1]?.url || "";

  document.getElementById("img1").onclick = () => choose(0);
  document.getElementById("img2").onclick = () => choose(1);
}

async function choose(index) {
  if (loading) return;
  loading = true;

  const winner = currentImages[index];
  const loser = currentImages[index === 0 ? 1 : 0];

  await fetch("/api/images", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      winner: winner.id,
      loser: loser.id
    })
  });

  loading = false;
  loadImages();
}

loadImages();
