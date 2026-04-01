// ページ読み込み時に実行
window.onload = () => {
  loadImages();
};

// 画像を読み込む
async function loadImages() {
  try {
    // 2枚取得
    const res1 = await fetch("/api/generate");
    const data1 = await res1.json();

    const res2 = await fetch("/api/generate");
    const data2 = await res2.json();

    // 画像セット
    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");

    img1.src = data1.image;
    img2.src = data2.image;

  } catch (error) {
    console.error("画像取得エラー:", error);
  }
}

// 画像クリック時
function choose(num) {
  console.log("選択:", num);

  // 次の画像へ
  loadImages();
}
