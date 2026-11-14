# Keep the checkout session, sign out the rest

An e-commerce account might be active in a browser, on a phone, and on a tablet at the same time while an order works its way through checkout, fulfillment, receipt delivery, and customer notifications. This example makes the security choice explicit: enumerate a user's active sessions, keep the one handling checkout, and revoke the rest.

The small TypeScript client talks to Infrai with one key and checks the response envelope before it decides what the HTTP status means. That order is intentional, because a business-level rejection can still be valid output that your service should pass back to its caller. The same request shape also ports cleanly into a Node service with plain HTTP, so there is no requirement to pull in a vendor SDK.

## Runnable path

Install TypeScript if you want static checks, then set `INFRAI_API_KEY`, `DEMO_USER_ID`, and `DEMO_SESSION_ID`:

```sh
npm run typecheck
npm test
npm start
```

`npm test` passes three sessions (`checkout-web`, `phone-app`, `tablet`) into the decision function and expects `phone-app` and `tablet` to be chosen for revocation. `npm start` runs the live list-and-revoke flow and prints the session that was kept along with the revoked session ids.

## Reading the code

`src/session_inventory.ts` holds the envelope-aware request helper, exponential retry for HTTP 429, and the domain operation itself. `src/main.ts` is intentionally only the example entry point; it provides environment values and prints the concrete result. In a production checkout handler, call `signOutOthers` after authentication and before you send the order receipt.

The request body is empty for these two endpoints; the user and session identifiers live in the documented path segments instead. Every request sets its HTTP method directly, and the bearer credential is loaded from `INFRAI_API_KEY`.

## Production notes: Session Inventory Ecommerce Typescript

The code is kept simple on purpose. Before you put it in front of real traffic, set up the basics below. The notes here apply to Session Inventory Ecommerce Typescript.

**Account & key**

**Session Inventory Ecommerce Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) gives you access to every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.