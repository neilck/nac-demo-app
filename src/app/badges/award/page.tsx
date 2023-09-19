"use client";

import { useState, useEffect } from "react";
import { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import { useNostrContext } from "@/app/context/NostrContext";
import { badgeAwardEvent } from "nostr-access-control";

export default function AwardBadge() {
  const { ndk, ndkUser, publish } = useNostrContext();
  const [pubkey, setPubkey] = useState("<pubkey>");
  const [badgeDefRef, setBadgeDefRef] = useState("");
  const [awardedPubkey, setAwardedPubkey] = useState("");

  const [pubEvent, setPubEvent] = useState<NostrEvent | undefined>(undefined);

  const event = badgeAwardEvent({ pubkey, badgeDefRef, awardedPubkey });

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    switch (e.currentTarget.id) {
      case "badgeDefRef":
        setBadgeDefRef(value);
        break;
      case "awardedPubkey":
        setAwardedPubkey(value);
        break;
    }
  };

  const publishHandler = async () => {
    const signedEvent = await publish(event);
    setPubEvent(signedEvent);
  };

  useEffect(() => {
    let key = "<pubkey>";
    if (ndkUser) key = ndkUser.hexpubkey;
    setPubkey(key);
    setBadgeDefRef(`30009:${key}:nacdemoapp-mybadge`);
  }, [ndkUser]);

  return (
    <main>
      <h1>Publish New Badge Award</h1>
      <div className="twoframe">
        <form className="form">
          Pubkey:
          <br />
          <div style={{ wordBreak: "break-all" }}>{pubkey}</div>
          <label htmlFor="badgeDefRef">Badge definition event reference</label>
          <input
            type="text"
            id="badgeDefRef"
            name="badgeDefRef"
            defaultValue={badgeDefRef}
            onChange={onChangeHandler}
          />
          <label htmlFor="awardedPubkey">Pubkey of awardee</label>
          <input
            type="text"
            id="awardedPubkey"
            name="awardedPubkey"
            defaultValue={awardedPubkey}
            onChange={onChangeHandler}
          />
          <br />
          <button
            type="button"
            className="loginButton"
            onClick={publishHandler}
          >
            Publish
          </button>
        </form>

        <div className="whiteframe">
          Unsigned Event
          <pre style={{ wordBreak: "break-all" }}>
            {JSON.stringify(event, null, 2)}
          </pre>
        </div>
      </div>
      <div className="twoframe" style={{ paddingTop: "0.5rem" }}>
        <div style={{ width: "100%", padding: "2rem" }}> </div>
        <div className="whiteframe">
          Published Event
          <pre style={{ wordBreak: "break-all" }}>
            {JSON.stringify(pubEvent, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}
