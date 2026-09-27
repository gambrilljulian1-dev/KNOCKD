import "./style.css";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  auth
} from "./firebase.js";

import {
  login,
  signup,
  logout,
  getProfile
} from "./auth.js";

const app =
  document.querySelector("#app");

function loginScreen() {

  app.innerHTML = `
    <main class="screen">

      <div class="card">

        <h1>KNOCKD</h1>

        <p>
          ONLINE FIGHTING
        </p>

        <input
          id="email"
          placeholder="Email"
          type="email"
        >

        <input
          id="password"
          placeholder="Password"
          type="password"
        >

        <input
          id="username"
          placeholder="Username (signup)"
          type="text"
        >

        <button id="login">
          LOG IN
        </button>

        <button id="signup">
          CREATE ACCOUNT
        </button>

        <div id="message"></div>

      </div>

    </main>
  `;

  const email =
    document.querySelector("#email");

  const password =
    document.querySelector("#password");

  const username =
    document.querySelector("#username");

  const message =
    document.querySelector("#message");

  document
    .querySelector("#login")
    .onclick = async () => {

      try {

        await login(
          email.value,
          password.value
        );

      } catch (error) {

        message.textContent =
          error.message;
      }
    };

  document
    .querySelector("#signup")
    .onclick = async () => {

      try {

        await signup(
          email.value,
          password.value,
          username.value
        );

      } catch (error) {

        message.textContent =
          error.message;
      }
    };
}

async function homeScreen(user) {

  const profile =
    await getProfile(user.uid);

  app.innerHTML = `
    <main class="screen">

      <div class="card">

        <h1>KNOCKD</h1>

        <h2>
          @${profile?.username || "PLAYER"}
        </h2>

        <p>
          WINS: ${profile?.wins || 0}
        </p>

        <p>
          LOSSES: ${profile?.losses || 0}
        </p>

        <button id="fight">
          FIND FIGHT
        </button>

        <button id="friends">
          FRIENDS
        </button>

        <button id="practice">
          PRACTICE
        </button>

        <button id="logout">
          LOG OUT
        </button>

      </div>

    </main>
  `;

  document
    .querySelector("#logout")
    .onclick = logout;

  document
    .querySelector("#fight")
    .onclick = () => {
      alert(
        "MATCHMAKING COMES NEXT."
      );
    };

  document
    .querySelector("#friends")
    .onclick = () => {
      alert(
        "FRIENDS SYSTEM COMES NEXT."
      );
    };

  document
    .querySelector("#practice")
    .onclick = () => {
      alert(
        "PRACTICE MODE COMES AFTER ONLINE."
      );
    };
}

onAuthStateChanged(
  auth,
  async user => {

    if (!user) {
      loginScreen();
      return;
    }

    await homeScreen(user);
  }
);
