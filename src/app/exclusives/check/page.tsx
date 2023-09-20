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
  const [owner, setOwner] = useState("");
  const [events, setEvents] = useState<Set<NDKEvent> | undefined>(undefined);
  const [mesgs, setMesgs] = useState<{ id: string; mesg: string }[]>([]);
  const [runOn, setRunOn] = useState("client");
  const [resullDisplay, setResultDisplay] = useState(-1);

  useEffect(() => {
    let key = "<pubkey>";
    if (ndkUser) key = ndkUser.hexpubkey;
    {
      setOwner(key);
      setPubkey(key);
    }
  }, [ndkUser]);

  // <---------- on-screen logging ---------->
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
    if (result.isEligible) setResultDisplay(1);
    else setResultDisplay(0);
    addMesg("---------- Result ----------");
    addMesg(`isEligible: ${result.isEligible}`);
    if (result.errors) {
      addMesg("Errors");
      result.errors.forEach((error) => addMesg(error));
    }

    if (result.badges) {
      addMesg("badges:");
      result.badges.forEach((badge) => {
        addMesg(`${badge.d} isValid: ${badge.isValid}`);
        if (badge.errors) addMesg(`  errors: ${badge.errors?.toString()}`);
      });
    }
  };

  // <---------- event handlers ---------->
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
      case "owner":
        setOwner(value);
    }
  };

  /**
   * Run eligibilty check server side
   */
  const checkOnServer = async () => {
    const jsonBody = JSON.stringify({
      owner: owner,
      exclusiveid: exclusive,
      pubkey: pubkey,
    });
    addMesg("sending post request with body " + jsonBody);
    const response = await fetch("http://localhost:3000/api/check", {
      method: "POST",
      body: jsonBody,
      headers: { "content-type": "application/json" },
    }).catch((e) => {
      addMesg("Error calling check API: " + getErrorMessage(e));
      return null;
    });

    if (response) {
      const json = await response.json();
      processEligibilityResult(json);
    }
  };

  /**
   * Run eligibilty check client side
   */
  const checkClicked = async () => {
    myMesgs = [];
    myEvents = new Set<NDKEvent>();
    setMesgs(myMesgs);
    setEvents(myEvents);

    setResultDisplay(-1);
    if (runOn == "client") addMesg("starting eligibility check on client");
    else {
      addMesg("starting eligibility check on server");
      checkOnServer();
      return;
    }

    try {
      // get exclusive
      let filter: NDKFilter = {
        authors: [owner],
        kinds: [30402],
        "#d": [exclusive],
      };
      const exclusiveEvent = await ndk?.fetchEvent(filter);

      if (!exclusiveEvent) {
        addMesg(`exclusive event not found: ${JSON.stringify(filter)}`);
        return;
      }

      addMesg("found exclusive event");
      addEvent(exclusiveEvent);

      const aTags = exclusiveEvent.getMatchingTags("a");
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

      // get badge awards
      const awardFilter: NDKFilter = {
        authors: badgePublishers,
        kinds: [8],
        // "#a": aTagValues, // don't include as will expand result set
        "#p": [pubkey],
      };

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

  // <---------- render ---------->
  return (
    <main>
      <h1>Check Exclusive Eligibility</h1>
      <div className="twoframe">
        <div style={{ width: "100%" }}>
          <form className="form">
            <label htmlFor="owner">Resource Owner pubkey</label>
            <input
              type="text"
              id="owner"
              name="owner"
              defaultValue={owner}
              onChange={onChangeHandler}
            />
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
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
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
            {resullDisplay == 1 && <div className="success">ELIGIBLE</div>}
            {resullDisplay == 0 && <div className="fail">NOT ELIGIBLE</div>}
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
