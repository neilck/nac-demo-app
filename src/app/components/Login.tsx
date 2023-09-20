import styles from "./login.module.css";
import { useNostrContext } from "../context/NostrContext";

export default function Login() {
  const { ndk, ndkUser, loadNDKUser, nip07Ready } = useNostrContext();
  const loginClicked = () => {
    loadNDKUser();
  };

  return (
    <div className={styles.centerbox}>
      <h2>Nostr Access Control Demo App</h2>
      <img src="/aka-logo.svg" width="260px" height="260px"></img>
      Login with Nostr Signer Extension
      <a href="https://chrome.google.com/webstore/detail/aka-profiles/ncmflpbbagcnakkolfpcpogheckolnad">
        <i>e.g. AKA Profiles</i>
      </a>
      <br />
      <button
        id="button"
        name="button"
        className="loginButton"
        onClick={loginClicked}
        disabled={!nip07Ready}
      >
        Login with Nostr
      </button>
      {!nip07Ready && (
        <>
          <br />
          <h3>
            <span style={{ color: "red" }}>
              Nostr Signing Extension not detected
            </span>
          </h3>
        </>
      )}
    </div>
  );
}
