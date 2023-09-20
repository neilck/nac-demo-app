import { NextResponse } from "next/server";
import NDK, {
  NDKKind,
  NDKUser,
  NDKNip07Signer,
  NostrEvent,
  NDKEvent,
  NDKFilter,
} from "@nostr-dev-kit/ndk";
import {
  parseATag,
  verifyEligibility,
  EligibilityResult,
  ValidateBadgeAwardError,
  ValidateBadgeAwardResult,
} from "nostr-access-control";
import getErrorMessage from "@/app/errors";

export async function POST(request: Request) {
  console.log("api/check called");
  let exclusiveid = "";
  let pubkey = "";
  let owner = "";
  try {
    const reqBody: { owner: string; exclusiveid: string; pubkey: string } =
      await request.json();
    owner = reqBody.owner;
    exclusiveid = reqBody.exclusiveid;
    pubkey = reqBody.pubkey;
  } catch (error) {
    return NextResponse.json(
      { error: "bad json in post body" },
      { status: 400 }
    );
  }

  if (exclusiveid == "" || pubkey == "" || owner == "") {
    return NextResponse.json(
      { error: "request json has blank values" },
      { status: 400 }
    );
  }

  // TODO: check format of parameters

  const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io"],
    outboxRelayUrls: ["wss://purplepag.es"],
    enableOutboxModel: true,
  });
  ndk.connect();

  let result: EligibilityResult = {
    isEligible: false,
    errors: [],
    badges: [],
  };

  try {
    // get exclusive
    let filter: NDKFilter = {
      authors: [owner],
      kinds: [30402],
      "#d": [exclusiveid],
    };

    const exclusiveEvent = await ndk.fetchEvent(filter);

    if (!exclusiveEvent) {
      result.errors?.push("exclusive event not found: " + exclusiveid);
      return NextResponse.json(result);
    }

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
      result.errors?.push(
        "No related badge awards found: " + JSON.stringify(awardFilter)
      );
      return NextResponse.json(result);
    }

    // filter matching specific badge
    const filteredAwards: NDKEvent[] = [];
    awardEvents.forEach((event) => {
      const aTags = event.getMatchingTags("a");
      // badge award should only have one "a" tag
      if (aTags.length != 1 || aTags[0].length < 2) {
        return;
      }

      const aTagValue = aTags[0][1];
      if (aTagValues.includes(aTagValue)) {
        const tokens = parseATag(aTagValue);
        filteredAwards.push(event);
      }
    });

    result = verifyEligibility({
      userPublicKey: pubkey,
      classifiedListingEvent: exclusiveEvent.rawEvent() as any,
      badgeAwardEvents: filteredAwards as any,
    });
  } catch (error) {
    result.errors?.push("Error occured: " + getErrorMessage(error));
    return NextResponse.json(result);
  }

  return NextResponse.json(result);
}

export async function GET(request: Request) {
  return new Response("Please use POST.", {
    status: 200,
  });
}
