import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase.js";

export async function searchUser(username) {
  const usersRef = collection(db, "users");

  const q = query(
    usersRef,
    where("usernameLower", "==", username.toLowerCase())
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
}

export async function sendFriendRequest(fromUser, toUser) {
  const requestsRef = collection(db, "friendRequests");

  const existingQuery = query(
    requestsRef,
    where("from", "==", fromUser.uid),
    where("to", "==", toUser.uid)
  );

  const existing = await getDocs(existingQuery);

  if (!existing.empty) {
    throw new Error("REQUEST_EXISTS");
  }

  await addDoc(requestsRef, {
    from: fromUser.uid,
    fromUsername: fromUser.username,
    to: toUser.uid,
    toUsername: toUser.username,
    status: "pending",
    createdAt: serverTimestamp()
  });
}

export async function getIncomingRequests(userId) {
  const requestsRef = collection(db, "friendRequests");

  const q = query(
    requestsRef,
    where("to", "==", userId),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data()
  }));
}

export async function acceptFriendRequest(request) {
  const requestRef = doc(
    db,
    "friendRequests",
    request.id
  );

  await updateDoc(requestRef, {
    status: "accepted"
  });

  await addDoc(collection(db, "friends"), {
    user1: request.from,
    user2: request.to,
    usernames: [
      request.fromUsername,
      request.toUsername
    ],
    createdAt: serverTimestamp()
  });
}

export async function declineFriendRequest(requestId) {
  await deleteDoc(
    doc(db, "friendRequests", requestId)
  );
}
