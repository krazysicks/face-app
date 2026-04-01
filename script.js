async function generate() {
  try {
    const res = await fetch("/api/generate");
    const data = await res.json();

    console.log(data);

    if (data.image) {
      document.getElementById("img").src = data.image;
    } else {
      alert("エラー: " + JSON.stringify(data));
    }

  } catch (e) {
    console.error(e);
    alert("通信エラー");
  }
}
