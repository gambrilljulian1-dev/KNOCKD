import {
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { db } from "./firebase.js";

export function watchFight(
  matchId,
  callback
) {
  return onSnapshot(
    doc(db, "matches", matchId),
    snapshot => {
      if (!snapshot.exists()) {
        return;
      }

      callback({
        id: snapshot.id,
        ...snapshot.data()
      });
    }
  );
}

export async function attack(
  matchId,
  playerUid,
  damage
) {
  const matchRef =
    doc(db, "matches", matchId);

  const result =
    await new Promise(resolve => {

      const unsubscribe =
        onSnapshot(
          matchRef,
          snapshot => {
            unsubscribe();

            if (snapshot.exists()) {
              resolve(snapshot.data());
            }
          }
        );
    });

  if (result.turn !== playerUid) {
    throw new Error(
      "NOT_YOUR_TURN"
    );
  }

  const player1 =
    result.player1;

  const player2 =
    result.player2;

  const updates = {
    updatedAt: serverTimestamp()
  };

  if (playerUid === player1) {

    const newHealth =
      Math.max(
        0,
        result.player2Health - damage
      );

    updates.player2Health =
      newHealth;

    updates.turn =
      newHealth <= 0
        ? null
        : player2;

  } else if (playerUid === player2) {

    const newHealth =
      Math.max(
        0,
        result.player1Health - damage
      );

    updates.player1Health =
      newHealth;

    updates.turn =
      newHealth <= 0
        ? null
        : player1;

  } else {
    throw new Error(
      "NOT_IN_MATCH"
    );
  }

  await updateDoc(
    matchRef,
    updates
  );
}
