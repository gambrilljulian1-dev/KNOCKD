import "./style.css";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import { auth, db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "firebase/firestore";

import { createUserProfile } from "./profile.js";

import {
  searchUser,
  sendFriendRequest,
  getIncomingRequests,
  acceptFriendRequest,
  declineFriendRequest
} from "./friends.js";

const app = document.querySelector("#app");

async function checkUsernameTaken(usernameLower) {
  const usersRef = collection(db, "users");

  const usernameQuery = query(
    usersRef,
    where("usernameLower", "==", usernameLower)
  );

  const snapshot = await getDocs(usernameQuery);

  return !snapshot.empty;
}

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
            style="display:none;"
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

          <button type="submit" class="primary">
            LOG IN
          </button>
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
      mode === "login"
        ? "LOG IN"
        : "CREATE ACCOUNT";

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

        if (await checkUsernameTaken(usernameLower)) {
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

async function showHome(user) {
  const profileRef = doc(db, "users", user.uid);
  const profileSnap = await getDoc(profileRef);

  const profile = profileSnap.exists()
    ? profileSnap.data()
    : null;

  const username = profile?.username || "PLAYER";
  const wins = profile?.wins ?? 0;
  const losses = profile?.losses ?? 0;

  app.innerHTML = `
    <main class="knockd">
      <section class="home">

        <div class="logo">KNOCKD</div>

        <p class="tagline">
          WELCOME TO THE FIGHT.
        </p>

        <div class="profile-preview">
          <div class="avatar">
            ${username.charAt(0).toUpperCase()}
          </div>

          <h2>@${username}</h2>

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

          <button id="friends">
            FRIENDS
          </button>

          <button>
            PRACTICE
          </button>

          <button>
            FIGHTERS
          </button>

          <button id="profile">
            PROFILE
          </button>

          <button id="logout">
            LOG OUT
          </button>
        </div>

      </section>
    </main>
  `;

  document
    .querySelector("#friends")
    .addEventListener("click", () => {
      showFriends(user);
    });

  document
    .querySelector("#profile")
    .addEventListener("click", () => {
      showProfile(user);
    });

  document
    .querySelector("#logout")
    .addEventListener("click", async () => {
      await signOut(auth);
    });
}

async function showFriends(user) {
  const profileSnap = await getDoc(
    doc(db, "users", user.uid)
  );

  const profile = profileSnap.exists()
    ? profileSnap.data()
    : {};

  const username = profile.username || "PLAYER";

  app.innerHTML = `
    <main class="knockd">
      <section class="home">

        <button id="back" class="back">
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

          <button id="searchFriend" class="primary">
            SEARCH
          </button>

          <p id="friendMessage" class="message"></p>

          <div id="searchResult"></div>
        </div>

        <div class="friend-section">
          <h2>FRIEND REQUESTS</h2>
          <div id="requests">
            Loading...
          </div>
        </div>

      </section>
    </main>
  `;

  document
    .querySelector("#back")
    .addEventListener("click", () => {
      showHome(user);
    });

  document
    .querySelector("#searchFriend")
    .addEventListener("click", async () => {
      const input =
        document.querySelector("#friendUsername");

      const message =
        document.querySelector("#friendMessage");

      const result =
        document.querySelector("#searchResult");

      const searchedUsername =
        input.value.trim();

      if (!searchedUsername) {
        message.textContent =
          "Enter a username.";
        return;
      }

      message.textContent = "Searching...";
      result.innerHTML = "";

      try {
        const foundUser =
          await searchUser(searchedUsername);

        if (!foundUser) {
          message.textContent =
            "User not found.";
          return;
        }

        if (foundUser.uid === user.uid) {
          message.textContent =
            "You can't add yourself.";
          return;
        }

        message.textContent = "";

        result.innerHTML = `
          <div class="user-result">
            <div>
              <strong>@${foundUser.username}</strong>
              <span>PLAYER</span>
            </div>

            <button id="addFriend">
              ADD
            </button>
          </div>
        `;

        document
          .querySelector("#addFriend")
          .addEventListener("click", async () => {
            try {
              await sendFriendRequest(
                {
                  uid: user.uid,
                  username
                },
                foundUser
              );

              message.textContent =
                "Friend request sent.";

              document
                .querySelector("#addFriend")
                .disabled = true;

              document
                .querySelector("#addFriend")
                .textContent = "SENT";
            } catch (error) {
              if (error.message === "REQUEST_EXISTS") {
                message.textContent =
                  "Friend request already sent.";
              } else {
                message.textContent =
                  "Couldn't send request.";
              }
            }
          });
      } catch (error) {
        console.error(error);
        message.textContent =
          "Something went wrong.";
      }
    });

  loadFriendRequests(user);
}

async function loadFriendRequests(user) {
  const container =
    document.querySelector("#requests");

  const requests =
    await getIncomingRequests(user.uid);

  if (requests.length === 0) {
    container.innerHTML = `
      <p class="empty">
        No friend requests.
      </p>
    `;
    return;
  }

  container.innerHTML = requests
    .map(
      (request) => `
        <div class="request">
          <div>
            <strong>@${request.fromUsername}</strong>
            <span>WANTS TO FIGHT</span>
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
      button.addEventListener("click", async () => {
        const request =
          requests.find(
            (item) => item.id === button.dataset.id
          );

        await acceptFriendRequest(request);

        loadFriendRequests(user);
      });
    });

  document
    .querySelectorAll(".decline")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        await declineFriendRequest(
          button.dataset.id
        );

        loadFriendRequests(user);
      });
    });
}

async function showProfile(user) {
  const profileSnap = await getDoc(
    doc(db, "users", user.uid)
  );

  const profile = profileSnap.exists()
    ? profileSnap.data()
    : {};

  const username = profile.username || "PLAYER";
  const wins = profile.wins ?? 0;
  const losses = profile.losses ?? 0;

  app.innerHTML = `
    <main class="knockd">
      <section class="home">

        <button id="back" class="back">
          ← BACK
        </button>

        <div class="avatar large">
          ${username.charAt(0).toUpperCase()}
        </div>

        <div class="logo small-logo">
          KNOCKD
        </div>

        <h1>@${username}</h1>

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
          <button id="back2">
            BACK TO MENU
          </button>

          <button id="logout">
            LOG OUT
          </button>
        </div>

      </section>
    </main>
  `;

  document
    .querySelector("#back")
    .addEventListener("click", () => showHome(user));

  document
    .querySelector("#back2")
    .addEventListener("click", () => showHome(user));

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
