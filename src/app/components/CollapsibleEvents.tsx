import { NDKEvent, NostrEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { useNostrContext } from "../context/NostrContext";
import Collapsible from "react-collapsible";
import { use } from "react";

export const CollapsibleEvents = (props: {
  events: Set<NDKEvent> | undefined;
  enableDelete?: boolean;
}) => {
  const { deleteEvent } = useNostrContext();
  const enableDelete = props.enableDelete;

  if (!props.events) return <>no events</>;
  else {
    const eventArray: NostrEvent[] = [];
    props.events.forEach((event) => {
      eventArray.push(event.rawEvent());
    });

    eventArray.sort((a, b) => {
      if (a.created_at > b.created_at) return -1;
      return 1;
    });

    const formatTrigger = (event: NostrEvent) => {
      const id = event.id ? event.id.slice(0, 10) + "..." : "<no id>";
      let name = "";
      if (event.kind != undefined) {
        switch (event.kind) {
          case 30009:
            name = "badge definition";
            break;
          case 30402:
            name = "exclusive";
            break;
          case 8:
            name = "badge award";
            break;
          default:
            name = "kind " + event.kind.toString();
            break;
        }
      }

      const date = new Date(event.created_at * 1000);
      const title = `${date.toISOString()}  ${name} ${id}`;
      return title;
    };

    return (
      <>
        <i>Click rows to expand...</i>
        {enableDelete && (
          <>
            <br />
            <i>Re-Fetch to verify delete result...</i>
          </>
        )}
        <br /> <br />
        {eventArray.map((event) => (
          <Collapsible key={event.id} trigger={formatTrigger(event)}>
            <div
              className="whiteframe"
              style={{ paddingTop: "1rem", paddingBottom: "1rem" }}
            >
              <pre>{JSON.stringify(event, null, 2)}</pre>
              {enableDelete && (
                <div style={{ display: "flex", justifyContent: "end" }}>
                  <button
                    id={event.id}
                    className="deleteButton"
                    type="button"
                    onClick={(e) => {
                      if (event.id) {
                        deleteEvent(event.id);
                        e.currentTarget.disabled = true;
                      }
                    }}
                  >
                    delete
                  </button>
                </div>
              )}
            </div>
          </Collapsible>
        ))}
      </>
    );
  }
};

{
  /* <Collapsible key={event.id} trigger={formatTrigger(event)}>
{JSON.stringify(event, null, 2)}
</Collapsible>; */
}
