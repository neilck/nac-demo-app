
## Introduction
This demo application shows how to integrate the [nostr-acess-control package](https://github.com/neilck/nostr-access-control).

- shows in real-time the publishing of badge definition, badge award, and classified listing events
- demostrates nostr-access-control's `verifyEligibilty` function running either client-side or server-side
- supports logging in with NIP07 Nostr signing extension
- event fetching and deletion

Developed using [Nostr Development Kit](https://github.com/nostr-dev-kit/ndk) in a Next.js React app.

## Screenshots
![demo-instructions](https://github.com/neilck/nac-demo-app/assets/11378702/14fb99c2-f4d1-4e75-881e-cb0acb0a9457)
![demo-screen](https://github.com/neilck/nac-demo-app/assets/11378702/3b66a0a4-f1fa-4e12-8534-d8ede6fde737)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

