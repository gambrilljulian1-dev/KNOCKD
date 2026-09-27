import "./style.css";
const app = document.querySelector("#app");
app.innerHTML = `
  <main class="knockd">
    <section class="hero">
      <div class="logo">KNOCKD</div>
      <p class="tagline">FIGHT. CONNECT. WIN.</p>
      <div class="status">
        <span class="status-dot"></span>
        <span>ONLINE</span>
      </div>
      <div class="buttons">
        <button id="loginButton">LOG IN</button>
        <button id="signupButton" class="secondary">SIGN UP</button>
      </div>
    </section>
  </main>
`;
document.querySelector("#loginButton").addEventListener("click", () => {
  alert("KNOCKD login coming next.");
});
document.querySelector("#signupButton").addEventListener("click", () => {
  alert("KNOCKD signup coming next.");
});
