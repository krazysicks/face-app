window.onload = () => {
  loadImages();
};

async function loadImages() {
  try {
    // ① 1枚目
    const res1 = await fetch("/api/generate");
    const data1 = await res1.json();

    document.getElementById("img1").src = data1.output?.[0] || "";

    // ⏳ 少し待つ（超重要）
    await new Promise(r => setTimeout(r, 8000));

    // ② 2枚目
    const res2 = await fetch("/api/generate");
    const data2 = await res2.json();

    document.getElementById("img2").src = data2.output?.[0] || "";

  } catch (error) {
    console.error("エラー:", error);
  }
}

function choose(num) {
  loadImages();
}
