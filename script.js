function generateImages() {
  const seed1 = Math.floor(Math.random() * 1000);
  const seed2 = Math.floor(Math.random() * 1000);

  document.getElementById("img1").src =
    `https://picsum.photos/seed/${seed1}/300`;

  document.getElementById("img2").src =
    `https://picsum.photos/seed/${seed2}/300`;

  // クラスリセット
  document.getElementById("img1").classList.remove("selected", "loser");
  document.getElementById("img2").classList.remove("selected", "loser");
}

function choose(side) {
  const img1 = document.getElementById("img1");
  const img2 = document.getElementById("img2");

  if (side === 1) {
    img1.classList.add("selected");
    img2.classList.add("loser");
  } else {
    img2.classList.add("selected");
    img1.classList.add("loser");
  }

  // 0.5秒後に次の画像
  setTimeout(() => {
    generateImages();
  }, 500);
}

// 初回表示
generateImages();