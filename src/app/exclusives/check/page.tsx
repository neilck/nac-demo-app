"use client";

import { useState, useEffect } from "react";
import { useNostrContext } from "@/app/context/NostrContext";
import { NDKEvent, NostrEvent, NDKTag, NDKFilter } from "@nostr-dev-kit/ndk";
import { CollapsibleEvents } from "@/app/components/CollapsibleEvents";
import { MesgList } from "@/app/components/MesgList";
import {
  parseATag,
  verifyEligibility,
  EligibilityResult,
  ValidateBadgeAwardError,
  ValidateBadgeAwardResult,
} from "nostr-access-control";
import getErrorMessage from "@/app/errors";

export default function CheckEligibility() {
  const { ndk, ndkUser, publish } = useNostrContext();
  const [pubkey, setPubkey] = useState("");
  const [exclusive, setExclusive] = useState("nacdemoapp-myexclusive");
  const [events, setEvents] = useState<Set<NDKEvent> | undefined>(undefined);
  const [mesgs, setMesgs] = useState<{ id: string; mesg: string }[]>([]);
  const [runOn, setRunOn] = useState("client");

  // non-state lists to avoid overriding due to multiple adds before render
  let myMesgs = [...mesgs];
  let myEvents = new Set(events);

  const addMesg = (mesg: string) => {
    const id = myMesgs.length.toString();
    const item = { id: id, mesg: mesg };
    myMesgs = [...myMesgs, item];
    setMesgs(myMesgs);
  };

  const addEvent = (event: NDKEvent) => {
    myEvents = new Set(myEvents);
    myEvents.add(event);
    setEvents(myEvents);
  };

  const processEligibilityResult = (result: EligibilityResult) => {
    addMesg("---------- Result ----------");
    addMesg(`isEligible: ${result.isEligible}`);
    if (result.errors) {
      addMesg("Errors");
      result.errors.forEach((error) => addMesg(error));
    }
    if (result.badges) {
      addMesg("badge errors:");
      result.badges.forEach((badge) => {
        if (badge.errors) {
          addMesg(`${badge.errors.toString()}: ${badge.d}`);
        }
      });
    }
  };

  const onRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRunOn(e.currentTarget.value);
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    switch (e.currentTarget.id) {
      case "pubkey":
        setPubkey(value);
        break;
      case "exclusive":
        setExclusive(value);
        break;
    }
  };

  const checkClicked = async () => {
    myMesgs = [];
    myEvents = new Set<NDKEvent>();
    if (runOn == "client") addMesg("starting eligibility check on client");
    else {
      addMesg("starting eligibility check on server");
      return;
    }

    try {
      // get exclusive
      let filter: NDKFilter = { kinds: [30402], "#d": [exclusive] };
      const exclusiveEvent = await ndk?.fetchEvent(filter);

      if (!exclusiveEvent) {
        addMesg(`exclusive event not found: ${JSON.stringify(filter)}`);
        return;
      }

      addMesg("found exclusive event");
      addEvent(exclusiveEvent);

      const aTags = exclusiveEvent.getMatchingTags("a");
      const fakeTake: NDKTag = [
        "a",
        "30009:12300003775402413595ac9e1612bed508815e98ec4aa9d68a2628ff6154856f:otherapp-badgex",
      ];

      aTags.push(fakeTake);
      const badgeIds: string[] = [];
      const badgePublishers: string[] = [];
      const aTagValues: string[] = [];
      aTags.forEach((tag) => {
        aTagValues.push(tag[1]);
        const value = parseATag(tag[1]);

        if (value.id) badgeIds.push(value.id);
        if (value.pubkey) badgePublishers.push(value.pubkey);
      });

      addMesg("required badges: " + JSON.stringify(badgeIds));
      // addMesg("badge publishers: " + JSON.stringify(badgePublishers));

      // get badge awards
      const awardFilter: NDKFilter = {
        authors: badgePublishers,
        kinds: [8],
        // "#a": aTagValues, // don't include as will expand result set
        "#p": [pubkey],
      };

      // addMesg("filter: " + JSON.stringify(awardFilter));

      // get badge awards
      const awardEvents = await ndk?.fetchEvents(awardFilter);
      if (!awardEvents) {
        addMesg(
          "No related badge awards found: " + JSON.stringify(awardFilter)
        );
        return;
      }

      // filter matching specific badge
      const filteredAwards: NDKEvent[] = [];
      awardEvents.forEach((event) => {
        const aTags = event.getMatchingTags("a");
        // badge award should only have one "a" tag
        if (aTags.length != 1 || aTags[0].length < 2) return;
        const aTagValue = aTags[0][1];
        if (aTagValues.includes(aTagValue)) {
          const tokens = parseATag(aTagValue);
          addMesg("found badge award: " + tokens.id);
          filteredAwards.push(event);
        }
      });

      filteredAwards.forEach((event) => addEvent(event));

      const result = verifyEligibility({
        userPublicKey: pubkey,
        classifiedListingEvent: exclusiveEvent.rawEvent() as any,
        badgeAwardEvents: filteredAwards as any,
      });

      processEligibilityResult(result);
    } catch (error) {
      addMesg("Error occured:");
      addMesg(getErrorMessage(error));
    }
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
      <h1>Check Exclusive Eligibility</h1>
      <div className="twoframe">
        <div style={{ width: "100%" }}>
          <form className="form">
            <label htmlFor="exclusive">Exclusive ID</label>
            <input
              type="text"
              id="exclusive"
              name="exclusive"
              defaultValue={exclusive}
              onChange={onChangeHandler}
            />
            <label htmlFor="pubkey">User pubkey</label>
            <input
              type="text"
              id="pubkey"
              name="pubkey"
              defaultValue={pubkey}
              onChange={onChangeHandler}
            />

            <br />
            <div style={{ display: "flex", justifyContent: "start" }}>
              <button
                type="button"
                className="loginButton"
                onClick={checkClicked}
              >
                Check Eligibility
              </button>
              <div>
                <input
                  type="radio"
                  id="client"
                  name="fav_language"
                  value="client"
                  checked={"client" === runOn}
                  onChange={(e) => onRadioChange(e)}
                />
                <label htmlFor="client" style={{ paddingLeft: "10px" }}>
                  run on client
                </label>
                <br />
                <input
                  type="radio"
                  id="server"
                  name="fav_language"
                  value="server"
                  checked={"server" === runOn}
                  onChange={(e) => onRadioChange(e)}
                />
                <label htmlFor="server" style={{ paddingLeft: "10px" }}>
                  run on server
                </label>
              </div>
            </div>
          </form>
          <div style={{ paddingLeft: "2rem" }}>
            <MesgList mylist={mesgs} />
          </div>
        </div>
        <div className="frame">
          <CollapsibleEvents events={events} />
        </div>
      </div>
    </main>
  );
}
