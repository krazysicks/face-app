let currentImages = [];

async function loadImages() {
  let res = await fetch("/api/images");
  let data = await res.json();

  // ストック足りないなら生成
  while (data.images.length < 5) {
    const gen = await fetch("/api/generate");
    const g = await gen.json();

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

  // ランダムで2枚
  const shuffled = data.images.sort(() => 0.5 - Math.random());
  currentImages = shuffled.slice(0, 2);

  document.getElementById("img1").src = currentImages[0].url;
  document.getElementById("img2").src = currentImages[1].url;
}

async function choose(index) {
  const winner = index;
  const loser = index === 0 ? 1 : 0;

  await fetch("/api/images", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      winner: winner,
      loser: loser
    })
  });

  loadImages();
}

// 初回ロード
loadImages();
