import { createContext, useContext, useState, useEffect } from "react";
import NDK, {
  NDKKind,
  NDKUser,
  NDKNip07Signer,
  NostrEvent,
  NDKEvent,
  NDKFilter,
} from "@nostr-dev-kit/ndk";

const nip07signer = new NDKNip07Signer();
const ndk = new NDK({
  signer: nip07signer,
  explicitRelayUrls: ["wss://relay.damus.io"],
  outboxRelayUrls: ["wss://purplepag.es"],
  enableOutboxModel: true,
});

type NostrProviderProps = { children: React.ReactNode };

const NostrContext = createContext<
  | {
      ndk: NDK | null;
      ndkUser: NDKUser | null;
      loadNDKUser: () => Promise<NDKUser | undefined>;
      publish: (event: NostrEvent) => Promise<NostrEvent | undefined>;
      deleteEvent: (id: string) => void;
      logout: () => void;
    }
  | undefined
>(undefined);

function NostrProvider({ children }: NostrProviderProps) {
  const [ndkUser, setNDKUser] = useState<NDKUser | null>(null);

  useEffect(() => {
    ndk.connect();
    const nip07signer = new NDKNip07Signer();
    const hexpubkey = localStorage.getItem("pubkey");
    if (hexpubkey) {
      console.log("Found pubkey in local storage: " + hexpubkey);
      const loadedUser = new NDKUser({ hexpubkey: hexpubkey });
      console.log("User created: " + loadedUser.hexpubkey);
      setNDKUser(loadedUser);
    }
  }, []);

  const loadNDKUser = async (): Promise<NDKUser | undefined> => {
    const user = await ndk.signer?.user();
    if (user) {
      setNDKUser(user);
      localStorage.setItem("pubkey", user.hexpubkey);
      return;
    }
  };

  const publish = async (event: NostrEvent) => {
    const ndkEvent = new NDKEvent(ndk, event);
    const result = await ndkEvent.publish();
    const signedEvent = await ndkEvent.toNostrEvent();
    return signedEvent;
  };

  const logout = () => {
    setNDKUser(null);
    localStorage.removeItem("pubkey");
  };

  const deleteEvent = async (id: string) => {
    ndk.assertSigner();

    ndk.assertSigner();

    const event = new NDKEvent(ndk, {
      kind: NDKKind.EventDeletion,
      content: "",
      tags: [["e", id]],
    } as NostrEvent);

    const relays = await event
      .publish()
      .catch((error) => console.log("delete error: " + JSON.stringify(error)));
  };

  const value = { ndk, ndkUser, loadNDKUser, publish, logout, deleteEvent };
  return (
    <NostrContext.Provider value={value}>{children}</NostrContext.Provider>
  );
}

// use Context methods
const useNostrContext = () => {
  const context = useContext(NostrContext);
  if (context === undefined) {
    throw new Error("useNostrContext must be used within a NostrProvider");
  }
  return context;
};

export { useNostrContext };
export default NostrProvider;
