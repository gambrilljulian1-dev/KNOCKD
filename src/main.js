const app = document.querySelector("#app");

app.innerHTML = `
  <div style="
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    background:#050505;
    color:white;
    font-family:Arial,sans-serif;
  ">
    <div>
      <div style="
        font-size:70px;
        font-weight:900;
        letter-spacing:-5px;
      ">
        KNOCKD
      </div>

      <div style="
        margin-top:15px;
        color:#888;
        font-size:12px;
        letter-spacing:4px;
      ">
        ONLINE
      </div>
    </div>
  </div>
`;

console.log("KNOCKD main.js loaded");
