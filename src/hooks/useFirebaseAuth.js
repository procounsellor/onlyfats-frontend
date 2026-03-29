import { useEffect, useState } from "react";
import { signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../firebase";
import { api } from "../api/client";

export function useFirebaseAuth() {
  const [fbUser, setFbUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      setFbUser(user);
      setReady(true);
    });
    return unsub;
  }, []);

  async function signIn() {
    try {
      const data = await api("/auth/firebase-token");
      await signInWithCustomToken(firebaseAuth, data.firebase_token);
    } catch (e) {
      console.error("Firebase sign-in failed", e);
    }
  }

  return { fbUser, ready, signIn };
}
