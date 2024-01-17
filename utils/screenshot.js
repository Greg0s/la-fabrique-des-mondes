export function saveScreenshot(renderer) {
  const canvas = renderer.domElement;

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);

    const timestamp = getDatetime();

    const a = document.createElement("a");
    a.href = url;
    a.download = "generative-world-" + timestamp + ".png";
    // Simulate click to auto dl
    a.click();

    // Free the URL object after dl
    URL.revokeObjectURL(url);
  }, "image/png");
}

function getDatetime() {
  const now = new Date();

  const year = now.getFullYear().toString().slice(-2); // Les deux derniers chiffres de l'année
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Mois (de 0 à 11)
  const day = now.getDate().toString().padStart(2, "0"); // Jour du mois
  const hours = now.getHours().toString().padStart(2, "0"); // Heures (format 24 heures)
  const minutes = now.getMinutes().toString().padStart(2, "0"); // Minutes
  const secondes = now.getSeconds().toString().padStart(2, "0"); // Secondes

  return `${year}-${month}-${day}-${hours}${minutes}${secondes}`;
}
