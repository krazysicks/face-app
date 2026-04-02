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

  img.src = url;
}

async function loadImages() {
  showLoading();

  let res = await fetch("/api/images");
  let data = await res.json();

  while (data.images.length < 2) {
    const gen = await fetch("/api/generate");
    const g = await gen.json();

    console.log("生成:", g);

    await fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: g.image })
    });

    res = await fetch("/api/images");
    data = await res.json();
  }

  const shuffled = [...data.images].sort(() => 0.5 - Math.random());
  currentImages = shuffled.slice(0, 2);

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
