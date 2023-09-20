"use client";

import { useState, useEffect } from "react";
import { useNostrContext } from "@/app/context/NostrContext";
import { NDKEvent, NostrEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { CollapsibleEvents } from "../components/CollapsibleEvents";

export default function Events() {
  const { ndk, ndkUser, publish } = useNostrContext();
  const [pubkey, setPubkey] = useState("");
  const [kinds, setKinds] = useState([30009, 8, 30402]);
  const [events, setEvents] = useState<Set<NDKEvent> | undefined>(undefined);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    switch (e.currentTarget.id) {
      case "pubkey":
        setPubkey(value);
        break;
      case "kinds":
        const numArray = value
          .split(",")
          .filter((x) => x.trim().length && !isNaN(Number(x)))
          .map(Number);
        setKinds(numArray);
        break;
    }
  };

  const subscribeClicked = async () => {
    const filter: NDKFilter = { kinds: kinds };
    setEvents(undefined);
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
      <div className="twoframe">
        <form className="form">
          <label htmlFor="pubkey">Author pubkey</label>
          <input
            type="text"
            id="pubkey"
            name="pubkey"
            defaultValue={pubkey}
            onChange={onChangeHandler}
          />
          <label htmlFor="kinds">Kinds</label>
          <input
            type="text"
            id="kinds"
            name="kinds"
            defaultValue={kinds.toString()}
            onChange={onChangeHandler}
          />
          <br />
          <button
            type="button"
            className="loginButton"
            onClick={subscribeClicked}
          >
            Fetch
          </button>
        </form>

        <div className="frame">
          <CollapsibleEvents events={events} enableDelete={true} />
        </div>
      </div>
    </main>
  );
}
