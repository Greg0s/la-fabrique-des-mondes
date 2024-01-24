class UI {
  constructor() {
    this.bottomBar = document.createElement("ul");
    this.bottomBar.className = "ui";

    this.headerBar=document.createElement("div");
    this.headerBar.className="header";

    this.secondBar=document.createElement("div");
    this.secondBar.className="secondBar";
  }

  createBar(items, body) {
    items.forEach((item) => {
      const newItem = document.createElement("li");
      newItem.innerHTML = item.name;
      newItem.addEventListener("click", function () {
        item.function();
      });
      this.bottomBar.appendChild(newItem);
    });

    body.appendChild(this.bottomBar);
  }

  createHeader(body){
    const myTitle = document.createElement("h1");
    myTitle.innerHTML="My Generative World";
    this.headerBar.appendChild(myTitle);
    this.secondBar.appendChild(newItem);
    body.appendChild(this.headerBar);
  }
}


export default UI;
