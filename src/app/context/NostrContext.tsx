import { createContext, useContext, useState, useEffect } from "react";
import NDK, {
  NDKKind,
  NDKUser,
  NDKNip07Signer,
  NostrEvent,
  NDKEvent,
  NDKFilter,
} from "@nostr-dev-kit/ndk";

const ndk = new NDK({
  explicitRelayUrls: ["wss://relay.damus.io"],
  outboxRelayUrls: ["wss://purplepag.es"],
  enableOutboxModel: true,
});

type NostrProviderProps = { children: React.ReactNode };

const NostrContext = createContext<
  | {
      ndk: NDK | null;
      ndkUser: NDKUser | null;
      nip07Ready: boolean;
      loadNDKUser: () => Promise<NDKUser | undefined>;
      publish: (event: NostrEvent) => Promise<NostrEvent | undefined>;
      deleteEvent: (id: string) => void;
      logout: () => void;
    }
  | undefined
>(undefined);

function NostrProvider({ children }: NostrProviderProps) {
  const [ndkUser, setNDKUser] = useState<NDKUser | null>(null);
  const [nip07Ready, setNip07Ready] = useState(false);

  useEffect(() => {
    ndk.connect();
    let nip07signer: NDKNip07Signer | undefined = undefined;
    console.log("About to initialize NDKNip07Signer...");
    try {
      nip07signer = new NDKNip07Signer();
      ndk.signer = nip07signer;
      setNip07Ready(true);
      console.log("success");
    } catch (error) {
      setNip07Ready(false);
      console.log("failure: " + error);
    }

    const hexpubkey = localStorage.getItem("pubkey");
    if (hexpubkey) {
      console.log("Loading pubkey found in local storage: " + hexpubkey);
      const loadedUser = new NDKUser({ hexpubkey: hexpubkey });
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

  const value = {
    ndk,
    ndkUser,
    loadNDKUser,
    publish,
    logout,
    deleteEvent,
    nip07Ready,
  };
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
