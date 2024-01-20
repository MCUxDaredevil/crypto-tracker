const SQLManager = require("../db");
require("dotenv").config();

document.addEventListener("DOMContentLoaded", function () {

  const db = new SQLManager({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const cryptoData = db.executeQuery("SELECT coin_id, name, logo FROM coins WHERE tracking=1")

  const cryptoContainer = document.getElementById("coin-list");

  cryptoData.forEach((crypto) => {
    const box = document.createElement("div");
    box.classList.add("coin-container");
    box.id = crypto.coin_id;

    const logo = document.createElement("img");
    logo.classList.add("coin-img");
    logo.src = crypto.logo;
    logo.alt = `${crypto.name} Logo`;

    const name = document.createElement("div");
    name.classList.add("coin-name");
    name.textContent = crypto.name;


    box.appendChild(logo);
    box.appendChild(name);
    cryptoContainer.appendChild(box);
  });

  // adjustFontSize();
  window.addEventListener("resize", adjustFontSize);
});

function adjustFontSize() {
  const cryptoBoxes = document.querySelectorAll(".coin-container");
  cryptoBoxes.forEach((box) => {
    const name = box.querySelector(".coin-name");
    const containerWidth = box.clientWidth;
    const fontSize = containerWidth / 12; // Adjust this multiplier as needed
    name.style.fontSize = `${fontSize}px`;
  });
}
