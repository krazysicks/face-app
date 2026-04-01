window.onload = () => {
  loadImages();
};

async function loadImages() {
  try {
    const res = await fetch("/api/generate");
    const data = await res.json();

    console.log(data); // 👈 ここ見る

    // 🔥 とりあえず仮表示
    if (data.output && data.output[0]) {
      document.getElementById("img1").src = data.output[0];
      document.getElementById("img2").src = data.output[0];
    } else {
      alert("エラー:\n" + JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error(error);
  }
}

function choose(num) {
  loadImages();
}
