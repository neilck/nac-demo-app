"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import Nav from "./components/Nav";
import { useNostrContext } from "./context/NostrContext";

export default function Home() {
  const { ndkUser, loadNDKUser } = useNostrContext();
  const isLoggedIn = ndkUser != null;

  const loginClicked = () => {
    loadNDKUser();
  };

  return (
    <main className={styles.main}>
      <div id="centerbox" className={styles.centerbox}>
        <button
          id="button"
          name="button"
          className="loginButton"
          onClick={loginClicked}
        >
          Login with Nostr
        </button>
      </div>
    </main>
  );
}
