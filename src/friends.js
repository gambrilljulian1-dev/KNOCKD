import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { db } from "./firebase.js";

export async function findUser(
  username
) {
  const q = query(
    collection(db, "users"),
    where(
      "usernameLower",
      "==",
      username.toLowerCase()
    )
  );

  const results =
    await getDocs(q);

  if (results.empty) {
    return null;
  }

  return results.docs[0].data();
}

export async function sendFriendRequest(
  from,
  to
) {
  await addDoc(
    collection(db, "friendRequests"),
    {
      from: from.uid,
      fromUsername: from.username,

      to: to.uid,
      toUsername: to.username,

      status: "pending",

      createdAt: serverTimestamp()
    }
  );
}

export async function getRequests(
  uid
) {
  const q = query(
    collection(db, "friendRequests"),
    where("to", "==", uid),
    where("status", "==", "pending")
  );

  const results =
    await getDocs(q);

  return results.docs.map(
    item => ({
      id: item.id,
      ...item.data()
    })
  );
}

export async function acceptRequest(
  request
) {
  await updateDoc(
    doc(
      db,
      "friendRequests",
      request.id
    ),
    {
      status: "accepted"
    }
  );

  await addDoc(
    collection(db, "friends"),
    {
      user1: request.from,
      user2: request.to,

      usernames: [
        request.fromUsername,
        request.toUsername
      ],

      createdAt: serverTimestamp()
    }
  );
}

export async function declineRequest(
  requestId
) {
  await deleteDoc(
    doc(
      db,
      "friendRequests",
      requestId
    )
  );
}
