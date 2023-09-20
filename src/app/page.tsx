"use client";

import styles from "./page.module.css";
import { useNostrContext } from "./context/NostrContext";
import Login from "./components/Login";
import Welcome from "./components/Welcome";

export default function Home() {
  const { ndk, ndkUser, loadNDKUser, nip07Ready } = useNostrContext();
  const isLoggedIn = ndkUser != null;

  return (
    <main className={styles.main}>
      {!isLoggedIn && <Login />}
      {isLoggedIn && <Welcome />}
    </main>
  );
}
