import { useState, useEffect } from "react";

export default function Welcome() {
  return (
    <>
      <div className="whiteframe">
        <h2>Nostr Access Control Demo App</h2>
        <p>
          This demo app demonstrates how to integrate the nostr-acesss-control
          package into a Next.js application.
        </p>
        <br />
        <h4>Github Respository Links</h4>
        <table>
          <tr>
            <td>
              {" "}
              <a href="https://github.com/neilck/nac-demo-app" target="_blank">
                nac-demo-app
              </a>
            </td>
            <td> source code for this app</td>
          </tr>
          <tr>
            <td>
              {" "}
              <a
                href="https://github.com/neilck/nostr-access-control"
                target="_blank"
              >
                nostr-accesss-control
              </a>
            </td>
            <td>create events in Nostr and verify access based on badges</td>
          </tr>
          <tr>
            <td>
              {" "}
              <a href="https://github.com/nostr-dev-kit/ndk" target="_blank">
                ndk
              </a>
            </td>
            <td>Nostr Development Kit - easiest Nostr integration</td>
          </tr>
        </table>
        <br />
        Relays are hard-coded in <i>/app/context/NostrContext.tsx</i>
        <br />
        <br />
        <h3>Guide</h3>
        <p>
          You can login in with different pubkeys to act as various <i>roles</i>{" "}
          to perform the actions below.
        </p>
        <br />
        <p>
          1. As a <i>badge issuer</i> use <b>Publish Badge</b> to define a new
          badge.
        </p>
        <p>
          2. As a <i>badge issuer</i> use <b>Award Badge</b> to award a badge to
          a user.
        </p>
        <p>
          3. As a <i>resource owner</i> use <b>Publish Exclusive</b> to define
          an exclusive resource that required badges to access.
        </p>
        <p>
          4. As a <i>resource owner</i> use <b>Check Eligiblity</b> to check if
          a user has been awarded all the required badges to access the
          exclusive resource.
        </p>
        <p>
          5. As an <i>app</i> provide access to protected content / features to
          eligible users.
        </p>
        <br />
        <p>
          Login with any NIP07 Signer extension.&nbsp;
          <a
            href="https://chrome.google.com/webstore/detail/aka-profiles/ncmflpbbagcnakkolfpcpogheckolnad"
            target="_blank"
          >
            AKA Profiles
          </a>{" "}
          supports multiple keys.
        </p>
        Use <b>Fetch Events</b> to view and delete events published to relay(s)
        from the above actions.
        <br />
        <br />
        <h3>Check Eligibility - Client vs Server</h3>
        <p>
          This demo app allows Check Eligibility to be run either client-side or
          server-side.
        </p>
        <p>
          {" "}
          Client-side provide more details in demo app, but in a real
          application, this shold always be run server-side.
        </p>
      </div>
    </>
  );
}
