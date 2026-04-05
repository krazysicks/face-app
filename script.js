let currentImages = [];
let loading = false;

function showLoading() {
  ["1", "2"].forEach(n => {
    document.getElementById("loader" + n).style.display = "block";
    document.getElementById("img" + n).style.display = "none";
    document.getElementById("error" + n).style.display = "none";
  });
}

function showImage(n, url) {
  const img = document.getElementById("img" + n);
  const loader = document.getElementById("loader" + n);
  const error = document.getElementById("error" + n);

  if (!url) {
    loader.style.display = "none";
    error.style.display = "block";
    return;
  }

  img.onload = () => {
    loader.style.display = "none";
    img.style.display = "block";
  };

  img.onerror = () => {
    loader.style.display = "none";
    error.style.display = "block";
  };

  // 🔥 キャッシュ完全破壊（同じ画像対策）
  img.src = url + "?v=" + Date.now() + Math.random();
}

async function loadImages() {
  showLoading();

  let res = await fetch("/api/images");
  let data = await res.json();

  // 足りなければ生成
  while (data.images.length < 2) {
    const gen = await fetch("/api/generate");
    const g = await gen.json();

    console.log("生成:", g);

    await fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: g.image // ← そのままでOK
      })
    });

    res = await fetch("/api/images");
    data = await res.json();
  }

  // 🔥 重複防止ランダム
  const shuffled = [...data.images]
    .filter(img => img.url) // null除外
    .sort(() => 0.5 - Math.random());

  let first = shuffled[0];
  let second = shuffled.find(
    img => img.id !== first.id && img.url !== first.url
  );

  // fallback
  if (!second) second = shuffled[1];

  currentImages = [first, second];

  console.log("表示:", currentImages);

  showImage(1, currentImages[0]?.url);
  showImage(2, currentImages[1]?.url);

  document.getElementById("img1").onclick = () => choose(0);
  document.getElementById("img2").onclick = () => choose(1);
}

async function choose(index) {
  if (loading) return;
  loading = true;

  const winner = currentImages[index];
  const loser = currentImages[index === 0 ? 1 : 0];

  showLoading();

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
