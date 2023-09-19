"use client";

import { useState, useEffect } from "react";
import { useNostrContext } from "@/app/context/NostrContext";
import { NDKEvent, NostrEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { CollapsibleEvents } from "./CollapsibleEvents";

export default function Events() {
  const { ndk, ndkUser, publish } = useNostrContext();
  const [pubkey, setPubkey] = useState("");
  const [events, setEvents] = useState<Set<NDKEvent> | undefined>(undefined);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    switch (e.currentTarget.id) {
      case "pubkey":
        setPubkey(value);
        break;
    }
  };

  const subscribeClicked = async () => {
    const filter: NDKFilter = { kinds: [30009, 8, 30402] };
    setEvents(undefined);
    // const filter: NDKFilter = { kinds: [30402] };
    if (pubkey != "") {
      filter.authors = [pubkey];
    }
    const events = await ndk?.fetchEvents(filter);
    setEvents(events);
  };

  useEffect(() => {
    let key = "<pubkey>";
    if (ndkUser) key = ndkUser.hexpubkey;
    {
      setPubkey(key);
    }
  }, [ndkUser]);

  const renderEvents = (myEvents: Set<NDKEvent>) => {
    return (
      <>
        {myEvents.forEach((event) => {
          <>
            <div>{"event"}</div>
            <div>event.rawEvent()</div>
            <br />
            <br />
          </>;
        })}
      </>
    );
  };

  return (
    <main>
      <h1>Events</h1>
      <div className="frame" style={{ alignItems: "end" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="pubkey">Author pubkey</label>
          <input
            type="text"
            id="pubkey"
            name="pubkey"
            key={pubkey}
            defaultValue={pubkey}
            onChange={onChangeHandler}
            size={70}
          />
        </div>
        <button className="actionButton" onClick={subscribeClicked}>
          Fetch
        </button>
        <br />
      </div>
      <div style={{ width: "800px", paddingLeft: "4rem", paddingTop: "1rem" }}>
        <CollapsibleEvents events={events} />
      </div>
    </main>
  );
}
