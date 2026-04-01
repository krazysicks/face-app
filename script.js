let count = 0;

let preference = {
  age: [],
  country: []
};

let currentData = [];

async function generateFace() {
  const res = await fetch("https://randomuser.me/api/?gender=female");
  const data = await res.json();

  return data.results[0];
}

async function generateImages() {
  const data1 = await generateFace();
  const data2 = await generateFace();

  currentData = [data1, data2];

  const el1 = document.getElementById("img1");
  const el2 = document.getElementById("img2");

  el1.src = data1.picture.large;
  el2.src = data2.picture.large;

  el1.classList.remove("selected", "loser");
  el2.classList.remove("selected", "loser");
}

function choose(side) {
  const selected = currentData[side - 1];

  // 👇 好みを記録
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

function getAverage(arr) {
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function getMost(arr) {
  return arr.sort((a,b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
}

function showResult() {
  document.getElementById("game").style.display = "none";
  document.getElementById("result").style.display = "block";

  const avgAge = getAverage(preference.age);
  const country = getMost(preference.country);

  const result = `
平均年齢: ${avgAge}歳くらい
好きな系統: ${country}系
`;

  document.getElementById("resultText").innerText = result;
}

function restart() {
  count = 0;
  preference = { age: [], country: [] };

  document.getElementById("game").style.display = "flex";
  document.getElementById("result").style.display = "none";

  generateImages();
}

generateImages();
