import "./style.css";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";

import {
  createUserProfile
} from "./profile.js";

import {
  searchUser,
  sendFriendRequest,
  getIncomingRequests,
  acceptFriendRequest,
  declineFriendRequest
} from "./friends.js";

const app = document.querySelector("#app");

function showAuth() {
  app.innerHTML = `
    <main class="knockd">
      <section class="auth-card">

        <div class="logo">KNOCKD</div>

        <p class="tagline">
          FIGHT. CONNECT. WIN.
        </p>

        <div class="tabs">
          <button id="loginTab" class="active">
            LOG IN
          </button>

          <button id="signupTab">
            SIGN UP
          </button>
        </div>

        <form id="authForm">

          <input
            id="username"
            type="text"
            placeholder="Username"
            maxlength="20"
            style="display:none"
          >

          <input
            id="email"
            type="email"
            placeholder="Email"
            required
          >

          <input
            id="password"
            type="password"
            placeholder="Password"
            minlength="6"
            required
          >

          <button
            id="submitButton"
            class="primary"
            type="submit"
          >
            LOG IN
          </button>

        </form>

        <p id="authMessage" class="message"></p>

      </section>
    </main>
  `;

  let mode = "login";

  const form =
    document.querySelector("#authForm");

  const usernameInput =
    document.querySelector("#username");

  const loginTab =
    document.querySelector("#loginTab");

  const signupTab =
    document.querySelector("#signupTab");

  const submitButton =
    document.querySelector("#submitButton");

  const message =
    document.querySelector("#authMessage");

  function setMode(newMode) {
    mode = newMode;

    const signup = mode === "signup";

    loginTab.classList.toggle(
      "active",
      !signup
    );

    signupTab.classList.toggle(
      "active",
      signup
    );

    usernameInput.style.display =
      signup ? "block" : "none";

    usernameInput.required = signup;

    submitButton.textContent =
      signup
        ? "CREATE ACCOUNT"
        : "LOG IN";

    message.textContent = "";
  }

  loginTab.addEventListener(
    "click",
    () => setMode("login")
  );

  signupTab.addEventListener(
    "click",
    () => setMode("signup")
  );

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const email =
        document.querySelector("#email")
          .value
          .trim();

      const password =
        document.querySelector("#password")
          .value;

      const username =
        usernameInput.value.trim();

      message.textContent = "Loading...";

      try {
        if (mode === "login") {
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

          return;
        }

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

        const usernameQuery = query(
          collection(db, "users"),
          where(
            "usernameLower",
            "==",
            username.toLowerCase()
          )
        );

        const usernameResults =
          await getDocs(usernameQuery);

        if (!usernameResults.empty) {
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
          error.message ||
          "Something went wrong.";
      }
    }
  );
}

async function getProfile(user) {
  const snapshot =
    await getDoc(
      doc(db, "users", user.uid)
    );

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

async function showHome(user) {
  const profile =
    await getProfile(user);

  const username =
    profile?.username || "PLAYER";

  const wins =
    profile?.wins ?? 0;

  const losses =
    profile?.losses ?? 0;

  app.innerHTML = `
    <main class="knockd">
      <section class="home">

        <div class="logo">
          KNOCKD
        </div>

        <p class="tagline">
          WELCOME TO THE FIGHT.
        </p>

        <div class="profile-preview">

          <div class="avatar">
            ${username[0].toUpperCase()}
          </div>

          <h2>
            @${username}
          </h2>

          <div class="stats">

            <div>
              <strong>${wins}</strong>
              <span>WINS</span>
            </div>

            <div>
              <strong>${losses}</strong>
              <span>LOSSES</span>
            </div>

          </div>

        </div>

        <div class="menu">

          <button class="primary">
            QUICK MATCH
          </button>

          <button id="friendsButton">
            FRIENDS
          </button>

          <button>
            PRACTICE
          </button>

          <button>
            FIGHTERS
          </button>

          <button id="profileButton">
            PROFILE
          </button>

          <button id="logoutButton">
            LOG OUT
          </button>

        </div>

      </section>
    </main>
  `;

  document
    .querySelector("#friendsButton")
    .addEventListener(
      "click",
      () => showFriends(user)
    );

  document
    .querySelector("#profileButton")
    .addEventListener(
      "click",
      () => showProfile(user)
    );

  document
    .querySelector("#logoutButton")
    .addEventListener(
      "click",
      () => signOut(auth)
    );
}

async function showFriends(user) {
  const profile =
    await getProfile(user);

  const username =
    profile?.username || "PLAYER";

  app.innerHTML = `
    <main class="knockd">
      <section class="home">

        <button
          id="backButton"
          class="back"
        >
          ← BACK
        </button>

        <div class="logo small-logo">
          FRIENDS
        </div>

        <p class="tagline">
          FIND YOUR OPPONENTS.
        </p>

        <div class="friend-search">

          <input
            id="friendUsername"
            type="text"
            placeholder="Search username"
            maxlength="20"
          >

          <button
            id="searchButton"
            class="primary"
          >
            SEARCH
          </button>

          <p
            id="friendMessage"
            class="message"
          ></p>

          <div id="searchResult"></div>

        </div>

        <div class="friend-section">

          <h2>
            FRIEND REQUESTS
          </h2>

          <div id="requests">
            Loading...
          </div>

        </div>

      </section>
    </main>
  `;

  document
    .querySelector("#backButton")
    .addEventListener(
      "click",
      () => showHome(user)
    );

  document
    .querySelector("#searchButton")
    .addEventListener(
      "click",
      async () => {

        const input =
          document.querySelector(
            "#friendUsername"
          );

        const message =
          document.querySelector(
            "#friendMessage"
          );

        const result =
          document.querySelector(
            "#searchResult"
          );

        const searched =
          input.value.trim();

        if (!searched) {
          message.textContent =
            "Enter a username.";

          return;
        }

        message.textContent =
          "Searching...";

        result.innerHTML = "";

        try {
          const found =
            await searchUser(searched);

          if (!found) {
            message.textContent =
              "User not found.";

            return;
          }

          if (found.uid === user.uid) {
            message.textContent =
              "You can't add yourself.";

            return;
          }

          message.textContent = "";

          result.innerHTML = `
            <div class="user-result">

              <div>
                <strong>
                  @${found.username}
                </strong>

                <span>
                  PLAYER
                </span>
              </div>

              <button id="addFriend">
                ADD
              </button>

            </div>
          `;

          document
            .querySelector("#addFriend")
            .addEventListener(
              "click",
              async () => {

                const button =
                  document.querySelector(
                    "#addFriend"
                  );

                try {
                  await sendFriendRequest(
                    {
                      uid: user.uid,
                      username
                    },
                    found
                  );

                  button.textContent =
                    "SENT";

                  button.disabled = true;

                  message.textContent =
                    "Friend request sent.";

                } catch (error) {
                  console.error(error);

                  if (
                    error.message ===
                    "REQUEST_EXISTS"
                  ) {
                    message.textContent =
                      "Request already sent.";
                  } else {
                    message.textContent =
                      "Couldn't send request.";
                  }
                }
              }
            );

        } catch (error) {
          console.error(error);

          message.textContent =
            "Something went wrong.";
        }
      }
    );

  await loadFriendRequests(user);
}

async function loadFriendRequests(user) {
  const container =
    document.querySelector("#requests");

  try {
    const requests =
      await getIncomingRequests(
        user.uid
      );

    if (requests.length === 0) {
      container.innerHTML = `
        <p class="empty">
          No friend requests.
        </p>
      `;

      return;
    }

    container.innerHTML =
      requests
        .map(
          (request) => `
            <div class="request">

              <div>
                <strong>
                  @${request.fromUsername}
                </strong>

                <span>
                  WANTS TO FIGHT
                </span>
              </div>

              <div class="request-buttons">

                <button
                  class="accept"
                  data-id="${request.id}"
                >
                  ACCEPT
                </button>

                <button
                  class="decline"
                  data-id="${request.id}"
                >
                  DECLINE
                </button>

              </div>

            </div>
          `
        )
        .join("");

    document
      .querySelectorAll(".accept")
      .forEach((button) => {

        button.addEventListener(
          "click",
          async () => {

            const request =
              requests.find(
                (item) =>
                  item.id ===
                  button.dataset.id
              );

            try {
              await acceptFriendRequest(
                request
              );

              await loadFriendRequests(
                user
              );

            } catch (error) {
              console.error(error);
            }
          }
        );
      });

    document
      .querySelectorAll(".decline")
      .forEach((button) => {

        button.addEventListener(
          "click",
          async () => {

            try {
              await declineFriendRequest(
                button.dataset.id
              );

              await loadFriendRequests(
                user
              );

            } catch (error) {
              console.error(error);
            }
          }
        );
      });

  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <p class="empty">
        Couldn't load requests.
      </p>
    `;
  }
}

async function showProfile(user) {
  const profile =
    await getProfile(user);

  const username =
    profile?.username || "PLAYER";

  const wins =
    profile?.wins ?? 0;

  const losses =
    profile?.losses ?? 0;

  app.innerHTML = `
    <main class="knockd">
      <section class="home">

        <button
          id="backButton"
          class="back"
        >
          ← BACK
        </button>

        <div class="avatar large">
          ${username[0].toUpperCase()}
        </div>

        <div class="logo small-logo">
          KNOCKD
        </div>

        <h1>
          @${username}
        </h1>

        <p class="email">
          ${user.email}
        </p>

        <div class="big-stats">

          <div class="stat-card">
            <strong>${wins}</strong>
            <span>WINS</span>
          </div>

          <div class="stat-card">
            <strong>${losses}</strong>
            <span>LOSSES</span>
          </div>

        </div>

        <div class="menu">

          <button id="menuButton">
            BACK TO MENU
          </button>

          <button id="logoutButton">
            LOG OUT
          </button>

        </div>

      </section>
    </main>
  `;

  document
    .querySelector("#backButton")
    .addEventListener(
      "click",
      () => showHome(user)
    );

  document
    .querySelector("#menuButton")
    .addEventListener(
      "click",
      () => showHome(user)
    );

  document
    .querySelector("#logoutButton")
    .addEventListener(
      "click",
      () => signOut(auth)
    );
}

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {
      showAuth();
      return;
    }

    try {
      await showHome(user);

    } catch (error) {
      console.error(error);

      app.innerHTML = `
        <main class="knockd">
          <section class="auth-card">

            <div class="logo">
              KNOCKD
            </div>

            <p class="message">
              Couldn't load your profile.
            </p>

          </section>
        </main>
      `;
    }
  }
);
