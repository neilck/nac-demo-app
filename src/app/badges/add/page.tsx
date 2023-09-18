"use client";

import { useState, useEffect } from "react";
import { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import { useNostrContext } from "@/app/context/NostrContext";
import { badgeDefinitionEvent } from "nostr-access-control";

export default function AddBadge() {
  const initializePubkey = (): string => {
    return ndkUser ? ndkUser.hexpubkey : "<pubkey>";
  };

  const { ndk, ndkUser } = useNostrContext();

  const [pubkey, setPubkey] = useState(initializePubkey());
  const [d, setD] = useState(`30009:${pubkey}:badgeId`);
  const [name, setName] = useState("My Badge");
  const [description, setDescription] = useState(
    "This is a sample badge created using nac-demo-app"
  );
  const [image, setImage] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/b/b8/50M%402x.png"
  );

  const event = badgeDefinitionEvent({ d, name, description, image, pubkey });

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    switch (e.currentTarget.id) {
      case "d":
        setD(value);
        break;
      case "name":
        setName(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "image":
        setImage(image);
        break;
    }
  };

  const publish = async () => {
    if (ndk) {
      const ndkEvent = new NDKEvent(ndk, event);
      const result = await ndkEvent.publish();
      const test = await ndkEvent.toNostrEvent();
      console.log("result: " + JSON.stringify(test));
    }
  };

  return (
    <main>
      <h1>Publish New Badge</h1>
      <div className="twoframe">
        <form className="form">
          Pubkey:
          <br />
          <div style={{ wordBreak: "break-all" }}>{pubkey}</div>
          <label htmlFor="d">Parameterized replaceable descriptor</label>
          <input
            type="text"
            id="d"
            name="d"
            defaultValue={d}
            onChange={onChangeHandler}
          />
          <label htmlFor="name">Badge name</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={name}
            onChange={onChangeHandler}
          />
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            defaultValue={description}
            onChange={onChangeHandler}
          />
          <label htmlFor="image">Image URL</label>
          <input
            type="text"
            id="image"
            name="image"
            defaultValue={image}
            onChange={onChangeHandler}
          />
          <br />
          <button type="button" onClick={publish}>
            Publish
          </button>
        </form>

        <div className="whiteframe">
          <pre style={{ wordBreak: "break-all" }}>
            {JSON.stringify(event, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}
