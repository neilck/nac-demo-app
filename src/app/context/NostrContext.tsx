import { createContext, useContext, useState, useEffect } from "react";
import NDK, { NDKUser, NDKNip07Signer } from "@nostr-dev-kit/ndk";

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
      ndkUser: NDKUser | null;
      loadNDKUser: () => Promise<NDKUser | undefined>;
      logout: () => void;
    }
  | undefined
>(undefined);

function NostrProvider({ children }: NostrProviderProps) {
  const [ndkUser, setNDKUser] = useState<NDKUser | null>(null);

  useEffect(() => {
    ndk.connect();
  }, []);

  const loadNDKUser = async (): Promise<NDKUser | undefined> => {
    const user = await ndk.signer?.user();
    if (user) {
      setNDKUser(user);
      return;
    }
  };

  const logout = () => {
    setNDKUser(null);
  };

  const value = { ndkUser, loadNDKUser, logout };
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
