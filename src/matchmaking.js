import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { db } from "./firebase.js";

export async function enterQueue(
  player
) {
  const existing = query(
    collection(db, "matchmaking"),
    where("uid", "==", player.uid),
    limit(1)
  );

  const result =
    await getDocs(existing);

  if (!result.empty) {
    return result.docs[0].id;
  }

  const newPlayer =
    await addDoc(
      collection(db, "matchmaking"),
      {
        uid: player.uid,
        username: player.username,
        status: "searching",
        createdAt: serverTimestamp()
      }
    );

  return newPlayer.id;
}

export async function leaveQueue(
  queueId
) {
  await deleteDoc(
    doc(
      db,
      "matchmaking",
      queueId
    )
  );
}

export async function findOpponent(
  currentUid
) {
  const q = query(
    collection(db, "matchmaking"),
    where("status", "==", "searching"),
    orderBy("createdAt", "asc"),
    limit(10)
  );

  const result =
    await getDocs(q);

  for (const player of result.docs) {
    if (player.data().uid !== currentUid) {
      return {
        id: player.id,
        ...player.data()
      };
    }
  }

  return null;
}

export async function createMatch(
  player1,
  player2
) {
  const match =
    await addDoc(
      collection(db, "matches"),
      {
        player1: player1.uid,
        player1Name: player1.username,

        player2: player2.uid,
        player2Name: player2.username,

        status: "waiting",

        player1Health: 100,
        player2Health: 100,

        turn: player1.uid,

        createdAt: serverTimestamp()
      }
    );

  return match.id;
}
