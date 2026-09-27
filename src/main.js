import "./style.css";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import { auth } from "./firebase.js";
import { createUserProfile } from "./profile.js";

const app = document.querySelector("#app");

function showAuth() {
  app.innerHTML = `
    <main class="knockd">
      <section class="auth-card">
        <div class="logo">KNOCKD</div>
        <p class="tagline">FIGHT. CONNECT. WIN.</p>

        <div class="tabs">
          <button id="loginTab" class="active">LOG IN</button>
          <button id="signupTab">SIGN UP</button>
        </div>

        <form id="authForm">
          <input
            id="username"
            type="text"
            placeholder="Username"
            maxlength="20"
            autocomplete="username"
            style="display: none;"
          >

          <input
            id="email"
            type="email"
            placeholder="Email"
            autocomplete="email"
            required
          >

          <input
            id="password"
            type="password"
            placeholder="Password"
            autocomplete="current-password"
            minlength="6"
            required
          >

          <button type="submit" class="primary">LOG IN</button>
        </form>

        <p id="authMessage" class="message"></p>
      </section>
    </main>
  `;

  let mode = "login";

  const form = document.querySelector("#authForm");
  const usernameInput = document.querySelector("#username");
  const loginTab = document.querySelector("#loginTab");
  const signupTab = document.querySelector("#signupTab");
  const message = document.querySelector("#authMessage");
  const submitButton = form.querySelector(".primary");

  function setMode(newMode) {
    mode = newMode;

    loginTab.classList.toggle("active", mode === "login");
    signupTab.classList.toggle("active", mode === "signup");

    usernameInput.style.display =
      mode === "signup" ? "block" : "none";

    usernameInput.required = mode === "signup";

    submitButton.textContent =
      mode === "login" ? "LOG IN" : "CREATE ACCOUNT";

    message.textContent = "";
  }

  loginTab.addEventListener("click", () => setMode("login"));
  signupTab.addEventListener("click", () => setMode("signup"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;
    const username = usernameInput.value.trim();

    message.textContent = "Loading...";

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        if (username.length < 3) {
          message.textContent =
            "Username must be at least 3 characters.";
          return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          message.textContent =
            "Username can only use letters, numbers, and _.";
          return;
        }

        const usernameLower = username.toLowerCase();

        const usernameTaken = await checkUsernameTaken(usernameLower);

        if (usernameTaken) {
          message.textContent =
            "That username is already taken.";
          return;
        }

        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        await createUserProfile(
          result.user,
          username
        );
      }
    } catch (error) {
      console.error(error);

      const errors = {
        "auth/invalid-credential":
          "Incorrect email or password.",

        "auth/email-already-in-use":
          "That email is already registered.",

        "auth/invalid-email":
          "Enter a valid email.",

        "auth/weak-password":
          "Password must be at least 6 characters.",

        "auth/network-request-failed":
          "Check your internet connection."
      };

      message.textContent =
        errors[error.code] ||
        "Something went wrong. Try again.";
    }
  });
}

async function checkUsernameTaken(usernameLower) {
  const { collection, getDocs, query, where } =
    await import("firebase/firestore");

  const { db } = await import("./firebase.js");

  const usersRef = collection(db, "users");

  const usernameQuery = query(
    usersRef,
    where("usernameLower", "==", usernameLower)
  );

  const snapshot = await getDocs(usernameQuery);

  return !snapshot.empty;
}

function showHome(user) {
  app.innerHTML = `
    <main class="knockd">
      <section class="home">
        <div class="logo">KNOCKD</div>
        <p class="tagline">WELCOME TO THE FIGHT.</p>

        <p class="signed-in">
          Signed in as<br>
          <strong>${user.email}</strong>
        </p>

        <div class="menu">
          <button class="primary">QUICK MATCH</button>
          <button>FRIENDS</button>
          <button>PRACTICE</button>
          <button>FIGHTERS</button>
          <button>PROFILE</button>
          <button id="logout">LOG OUT</button>
        </div>
      </section>
    </main>
  `;

  document
    .querySelector("#logout")
    .addEventListener("click", async () => {
      await signOut(auth);
    });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    showHome(user);
  } else {
    showAuth();
  }
});
