"use client";

import { useState, useEffect } from "react";
import { useNostrContext } from "@/app/context/NostrContext";
import { NDKFilter } from "@nostr-dev-kit/ndk";

export default function Events() {
  const { ndk, ndkUser, publish } = useNostrContext();
  const [pubkey, setPubkey] = useState("");

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    switch (e.currentTarget.id) {
      case "pubkey":
        setPubkey(value);
        break;
    }
  };

  const subscribeClicked = async () => {
    const filter: NDKFilter = { kinds: [30009, 8, 30402], authors: [pubkey] };
    const events = await ndk?.fetchEvents(filter);
    events?.forEach((event) => {
      event.toNostrEvent().then((event) => {
        console.log(event);
      });
    });
  };

  useEffect(() => {
    let key = "<pubkey>";
    if (ndkUser) key = ndkUser.hexpubkey;
    {
      setPubkey(key);
    }
  }, [ndkUser]);

  return (
    <main>
      <h1>Events</h1>
      <div className="frame">
        <input
          type="text"
          id="pubkey"
          name="pubkey"
          key={pubkey}
          defaultValue={pubkey}
          onChange={onChangeHandler}
          size={70}
        />
        <button className="actionButton" onClick={subscribeClicked}>
          Subscribe
        </button>
      </div>
    </main>
  );
}
