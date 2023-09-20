"use client";

import styles from "./page.module.css";
import Login from "./components/Login";
import { useNostrContext } from "./context/NostrContext";

const welcome = () => {
  return (
    <>
      <h2>Nostr Access Control Demo App</h2>
    </>
  );
};

export default function Home() {
  const { ndk, ndkUser, loadNDKUser, nip07Ready } = useNostrContext();
  const isLoggedIn = ndkUser != null;

  return (
    <main className={styles.main}>
      {!isLoggedIn && <Login />}
      {isLoggedIn && welcome()}
    </main>
  );
}
