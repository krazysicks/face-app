let count = 0;

async function generateFace() {
  const res = await fetch("https://randomuser.me/api/");
  const data = await res.json();

  return data.results[0].picture.large;
}

async function generateImages() {
  const img1 = await generateFace();
  const img2 = await generateFace();

  const el1 = document.getElementById("img1");
  const el2 = document.getElementById("img2");

  el1.src = img1;
  el2.src = img2;

  el1.classList.remove("selected", "loser");
  el2.classList.remove("selected", "loser");
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

  count++;

  setTimeout(() => {
    if (count >= 10) {
      showResult();
    } else {
      generateImages();
    }
  }, 500);
}

function showResult() {
  document.getElementById("game").style.display = "none";
  document.getElementById("result").style.display = "block";

  const types = [
    "清楚系がタイプ",
    "クール系がタイプ",
    "かわいい系がタイプ",
    "大人っぽい系がタイプ"
  ];

  const result = types[Math.floor(Math.random() * types.length)];
  document.getElementById("resultText").innerText = result;
}

function restart() {
  count = 0;
  document.getElementById("game").style.display = "flex";
  document.getElementById("result").style.display = "none";
  generateImages();
}

generateImages();
