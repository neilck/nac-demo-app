"use client";

import { useState, useEffect } from "react";
import { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import { useNostrContext } from "@/app/context/NostrContext";
import { classifiedListingEvent } from "nostr-access-control";

export default function AddExclusive() {
  const getPubkey = (): string => {
    return ndkUser ? ndkUser.hexpubkey : "<pubkey>";
  };

  const { ndk, ndkUser, publish } = useNostrContext();
  const [pubkey, setPubkey] = useState("<pubkey>");
  const [d, setD] = useState("");
  const [title, setTitle] = useState("My Exclusive");
  const [summary, setSummary] = useState(
    "This is a sample exclusive resource created using nac-demo-app"
  );
  const [image, setImage] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/b/b0/WMF_safe.png"
  );
  const [badgeDefRefs, setBadgeDefRefs] = useState([""]);
  const [pubEvent, setPubEvent] = useState<NostrEvent | undefined>(undefined);

  const event = classifiedListingEvent({
    pubkey,
    d,
    title,
    summary,
    image,
    badgeDefRefs,
  });

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    switch (e.currentTarget.id) {
      case "d":
        setD(value);
        break;
      case "title":
        setTitle(value);
        break;
      case "summary":
        setSummary(value);
        break;
      case "image":
        setImage(image);
        break;
      case "badgeDefRefs":
        setBadgeDefRefs(badgeDefRefs);
    }
  };

  const onChangeTextAreaHandler = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.currentTarget.value;
    switch (e.currentTarget.id) {
      case "badgeDefRefs":
        const lines = value.split(/\r?\n|\r|\n/g);
        const nonEmptyLines: string[] = [];
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (trimmed != "") nonEmptyLines.push(line);
        });
        setBadgeDefRefs(nonEmptyLines);
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
    {
      setPubkey(key);
      setD(`nacdemoapp-myexclusive`);
      setBadgeDefRefs([`30009:${key}:nacdemoapp-mybadge`]);
    }
  }, [ndkUser]);

  return (
    <main>
      <h1>Publish New Exclusive</h1>
      <div className="twoframe">
        <form className="form">
          Author pubkey:
          <br />
          <div style={{ wordBreak: "break-all" }}>{pubkey}</div>
          <label htmlFor="d">Exclusive ID</label>
          <input
            type="text"
            id="d"
            name="d"
            defaultValue={d}
            onChange={onChangeHandler}
          />
          <label htmlFor="title">Exclusive title</label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={title}
            onChange={onChangeHandler}
          />
          <label htmlFor="summary">Summary</label>
          <input
            type="text"
            id="summary"
            name="summary"
            defaultValue={summary}
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
          <label htmlFor="badgeDefRefs">Required Badges (one per line)</label>
          <textarea
            id="badgeDefRefs"
            name="badgeDefRefs"
            rows={5}
            defaultValue={badgeDefRefs}
            onChange={onChangeTextAreaHandler}
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
