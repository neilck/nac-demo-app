"use client";

import { useState, useEffect } from "react";
import { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import { useNostrContext } from "@/app/context/NostrContext";
import { badgeAwardEvent } from "nostr-access-control";

export default function AwardBadge() {
  const { ndk, ndkUser, publish } = useNostrContext();
  const [pubkey, setPubkey] = useState("<pubkey>");
  const [badgeID, setBadgeID] = useState("nacdemoapp-mybadge");
  const [badgeDefRef, setBadgeDefRef] = useState("");
  const [awardedPubkey, setAwardedPubkey] = useState("");

  const [pubEvent, setPubEvent] = useState<NostrEvent | undefined>(undefined);

  const event = badgeAwardEvent({ pubkey, badgeDefRef, awardedPubkey });

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    switch (e.currentTarget.id) {
      case "badgeID":
        setBadgeID(value);
        const ref = `30009:${pubkey}:${value}`;
        setBadgeDefRef(ref);
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
    setAwardedPubkey(key);
    setBadgeDefRef(`30009:${key}:${badgeID}`);
  }, [ndkUser]);

  return (
    <main>
      <h1>Publish New Badge Award</h1>
      <div className="twoframe">
        <form className="form">
          Author pubkey:
          <br />
          <div style={{ wordBreak: "break-all" }}>{pubkey}</div>
          <label htmlFor="badgeID">Badge ID</label>
          <input
            type="text"
            id="badgeID"
            name="badgeID"
            defaultValue={badgeID}
            onChange={onChangeHandler}
          />
          <label htmlFor="awardedPubkey">Awardee pubkey</label>
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
          <pre>{JSON.stringify(event, null, 2)}</pre>
        </div>
      </div>
      <div className="twoframe">
        <div style={{ width: "100%", padding: "2rem" }}> </div>
        <div className="whiteframe">
          Published Event
          <pre>{JSON.stringify(pubEvent, null, 2)}</pre>
        </div>
      </div>
    </main>
  );
}
