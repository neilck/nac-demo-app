import styles from "./nav.module.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNostrContext } from "../context/NostrContext";

export default function Nav() {
  const router = useRouter();
  const isLoggedIn = useNostrContext().ndkUser != null;
  const logout = useNostrContext().logout;

  const logoutClicked = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      {isLoggedIn && (
        <div className={styles.navbar}>
          <div className={styles.navlinks}>
            <Link href="/badges/add">Publish Badge</Link>
            <Link href="/badges/award">Award Badge</Link>
            <Link href="/exclusives/add">Publish Exclusive</Link>
            <Link href="/exclusives/check">Check Eligibility</Link>
            <Link href="/events">Fetch Events</Link>
          </div>
          <button className={styles.linkbutton} onClick={logoutClicked}>
            logout
          </button>
        </div>
      )}
    </>
  );
}
