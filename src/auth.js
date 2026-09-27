import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";

export async function signup(
  email,
  password,
  username
) {
  const result =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  await setDoc(
    doc(db, "users", result.user.uid),
    {
      uid: result.user.uid,
      username,
      usernameLower: username.toLowerCase(),
      email,

      wins: 0,
      losses: 0,

      online: true,

      createdAt: serverTimestamp()
    }
  );

  return result.user;
}

export async function login(
  email,
  password
) {
  const result =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  await setDoc(
    doc(db, "users", result.user.uid),
    {
      online: true
    },
    {
      merge: true
    }
  );

  return result.user;
}

export async function logout() {
  if (auth.currentUser) {
    await setDoc(
      doc(
        db,
        "users",
        auth.currentUser.uid
      ),
      {
        online: false
      },
      {
        merge: true
      }
    );
  }

  await signOut(auth);
}

export async function getProfile(uid) {
  const result =
    await getDoc(
      doc(db, "users", uid)
    );

  if (!result.exists()) {
    return null;
  }

  return result.data();
}
