class UI {
  constructor() {
    this.htmlElement = document.createElement("ul");
    this.htmlElement.className = "ui";
  }

  createBar(items, body) {
    items.forEach((item) => {
      const newItem = document.createElement("li");
      newItem.innerHTML = item.name;
      newItem.addEventListener("click", function () {
        item.function();
      });
      this.htmlElement.appendChild(newItem);
    });

    body.appendChild(this.htmlElement);
  }
}

export default UI;
