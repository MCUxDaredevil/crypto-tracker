document.addEventListener("DOMContentLoaded", function () {

  fetch("http://localhost:3001/coins")
    .then((response) => response.json())
    .then((cryptoData) => {
      console.log(cryptoData)
      const cryptoContainer = document.getElementById("coin-list");
      cryptoData.forEach((crypto) => {
        const box = document.createElement("div");
        box.classList.add("coin-container");
        box.id = crypto.coin_id;

        const logo = document.createElement("img");
        logo.classList.add("coin-img");
        logo.src = crypto.image;
        logo.alt = `${crypto.name} Logo`;

        const name = document.createElement("div");
        name.classList.add("coin-name");
        name.textContent = crypto.name;


        box.appendChild(logo);
        box.appendChild(name);
        cryptoContainer.appendChild(box);
      });

      adjustFontSize();
      window.addEventListener("resize", adjustFontSize);
    });
});

function adjustFontSize() {
  const cryptoBoxes = document.querySelectorAll(".coin-container");
  cryptoBoxes.forEach((box) => {
    const name = box.querySelector(".coin-name");
    const containerWidth = box.clientWidth;
    const fontSize = containerWidth / 10; // Adjust this multiplier as needed
    name.style.fontSize = `${fontSize}px`;
  });
}
