export let storyEnd = false;

export function firstPopUp() {
  // first popup
  openPopup(
    "Bienvenue à la Fabrique des Mondes, le seul endroit où tu peux créer des univers à ton image ! Nous sommes ravis de t'accueillir parmi nous et de t'avoir comme nouvel employé. ",
    "Suivant"
  );

  document
    .querySelector(".popup-content button")
    .addEventListener("click", openNewPopup);
}

function openPopup(content, txtButton) {
  document.getElementById("popupContent").textContent = content;
  document.querySelector(".popup-content button").textContent = txtButton;
  document.getElementById("popup").style.display = "block";
}

function closePopup() {
  // Hide actual popup
  document.getElementById("popup").style.display = "none";
}

function openNewPopup() {
  // Close actual popup
  closePopup();

  // New infos
  openPopup(
    "Bienvenue dans ton nouveau bureau ! Avec vue panoramique sur tes futures planètes ! Ici, l'imagination est la seule limite, et nous sommes impatients de voir les mondes incroyables que tu vas contribuer à fabriquer. N'hésite pas à explorer, créer et innover. Ton voyage commence maintenant, et nous sommes certains qu'il sera aussi passionnant que les mondes que tu vas concevoir 🌌🚀✨",
    "À toi de jouer !"
  );

  // Close button
  document
    .querySelector(".popup-content button")
    .addEventListener("click", function () {
      closePopup();
      storyEnd = true;
    });
}
