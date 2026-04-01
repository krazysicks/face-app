let count = 0;

let preference = {
  age: [],
  country: []
};

let currentData = [];

// 徐々に80%寄せる
function getBoost() {
  return Math.min(0.8, (count / 10) * 0.8);
}

// 仮の好み（あとでAIに使う）
function getMost(arr) {
  if (arr.length === 0) return null;
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
}

// AI画像URL取得
function generateFace() {
  const preferred = getMost(preference.country) || "japanese";

  const prompt = `beautiful ${preferred} woman portrait, realistic, 4k`;

  return `/api/generate?prompt=${encodeURIComponent(prompt)}`;
}

// 画像表示
function generateImages() {
  const el1 = document.getElementById("img1");
  const el2 = document.getElementById("img2");

  el1.src = generateFace();
  el2.src = generateFace();

  el1.classList.remove("selected", "loser");
  el2.classList.remove("selected", "loser");
}

// 選択
function choose(side) {
  const fakeCountry = ["japanese", "korean", "american"];

  // 仮でランダム学習（ここ後で精度上げれる）
  preference.country.push(fakeCountry[Math.floor(Math.random() * 3)]);

  const img1 = document.getElementById("img1");
  const img2 = document.getElementById("img2");

  if (side === 1) {
    img1.classList.add("selected");
    img2.classList.add("loser");
  } else {
    img2.classList.add("selected");
    img1.classList.add("loser");
  }

  count++;

  setTimeout(() => {
    if (count >= 10) {
      showResult();
    } else {
      generateImages();
    }
  }, 500);
}

// 結果
function showResult() {
  document.getElementById("game").style.display = "none";
  document.getElementById("result").style.display = "block";

  const country = getMost(preference.country);

  document.getElementById("resultText").innerText =
    `あなたは「${country}系」の顔が好きです`;
}

// リスタート
function restart() {
  count = 0;
  preference = { age: [], country: [] };

  document.getElementById("game").style.display = "flex";
  document.getElementById("result").style.display = "none";

  generateImages();
}

generateImages();
