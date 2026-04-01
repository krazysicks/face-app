let count = 0;

let preference = {
  age: [],
  country: []
};

let currentData = [];

// 🔥 徐々に80%まで寄せる
function getBoost() {
  return Math.min(0.8, (count / 10) * 0.8);
}

// 一番多い国を取得
function getMost(arr) {
  if (arr.length === 0) return null;

  return arr.sort((a, b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
}

// 平均年齢
function getAverage(arr) {
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

// 顔生成（80%で好みに寄せる）
async function generateFace(preferredCountry = null) {
  let url = "https://randomuser.me/api/?gender=female";

  const boost = getBoost();

  if (preferredCountry && Math.random() < boost) {
    url += `&nat=${preferredCountry}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  return data.results[0];
}

// 画像表示
async function generateImages() {
  const preferredCountry = getMost(preference.country);

  const data1 = await generateFace(preferredCountry);
  const data2 = await generateFace(preferredCountry);

  currentData = [data1, data2];

  const el1 = document.getElementById("img1");
  const el2 = document.getElementById("img2");

  el1.src = data1.picture.large;
  el2.src = data2.picture.large;

  el1.classList.remove("selected", "loser");
  el2.classList.remove("selected", "loser");
}

// 選択
function choose(side) {
  const selected = currentData[side - 1];

  // 👇 学習
  preference.age.push(selected.dob.age);
  preference.country.push(selected.nat);

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

// 結果表示
function showResult() {
  document.getElementById("game").style.display = "none";
  document.getElementById("result").style.display = "block";

  const avgAge = getAverage(preference.age);
  const country = getMost(preference.country);

  const result = `
あなたの好み分析結果👇

・平均年齢：${avgAge}歳
・好きな系統：${country}

※後半ほどあなたの好みに80%寄せています
`;

  document.getElementById("resultText").innerText = result;
}

// リスタート
function restart() {
  count = 0;
  preference = { age: [], country: [] };

  document.getElementById("game").style.display = "flex";
  document.getElementById("result").style.display = "none";

  generateImages();
}

// 初期表示
generateImages();
