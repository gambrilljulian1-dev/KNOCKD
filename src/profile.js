import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { db } from "./firebase.js";

export async function createUserProfile(user, username) {
  const profileRef = doc(db, "users", user.uid);

  await setDoc(profileRef, {
    uid: user.uid,
    username,
    usernameLower: username.toLowerCase(),
    email: user.email,
    wins: 0,
    losses: 0,
    createdAt: serverTimestamp()
  });
}

export async function getUserProfile(uid) {
  const profileRef = doc(db, "users", uid);

  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}
