let changesMade = false;
document.addEventListener("DOMContentLoaded", function () {
  const saveButton = document.getElementById("save-button");
  saveButton.addEventListener("click", function () {
    const confirmed = confirm("Are you sure you want to save changes?");
    if (confirmed) {
      const coinContainers = document.querySelectorAll(".coin-container");
      const coinData = Array.from(coinContainers).map((container) => {
        return {
          coin_id: container.id,
          tracking: container.classList.contains("tracked-box")
        };
      });

      fetch("http://localhost:3001/multiquery", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: "UPDATE coins SET tracking = ? WHERE coin_id = ?",
          params: coinData.map(coin => [coin.tracking ? 1 : 0, coin.coin_id])
        })
       }).then(r => {
          console.log(r);
      })
      changesMade = false;
      saveButton.style.display = "none";
    }
  });


  fetch("http://localhost:3001/coins")
    .then((response) => response.json())
    .then((cryptoData) => {
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

        if (crypto.tracking === 1) {
          box.classList.add("tracked-box");
        } else {
          box.classList.add("untracked-box");
        }

        box.addEventListener("click", function () {
          box.classList.toggle("tracked-box");
          box.classList.toggle("untracked-box");

          changesMade = true;
          saveButton.style.display = "block";
        });


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
