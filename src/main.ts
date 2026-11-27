import "./style.css";

const app = document.querySelector("#app");
if (!app) throw new Error("missing #app");
app.textContent = "sprint";
