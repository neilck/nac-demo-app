"use client";

import { useState, useEffect } from "react";
import { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";

const initializeEvent = () => {
  const event = new NDKEvent();
  event.pubkey = "asdf";
  event.content = "Hello!";
  return event;
};
export default function AddBadge() {
  const [event, setEvent] = useState(initializeEvent());
  const [eventString, setEventString] = useState("");

  useEffect(() => {
    console.log("useEffect");
    event.toNostrEvent().then((event) => {
      setEventString(JSON.stringify(event, null, 2));
      console.log(eventString);
    });
  }, [event]);

  return (
    <main>
      <h1>Publish New Badge</h1>
      <form>
        <label htmlFor="fname">First name:</label>
        <br></br>
        <input type="text" id="fname" name="fname" defaultValue="John" />
        <br></br>
        <label htmlFor="lname">Last name:</label>
        <br></br>
        <input type="text" id="lname" name="lname" defaultValue="Smith" />
        <br></br>
      </form>
      <pre>{eventString}</pre>
    </main>
  );
}
