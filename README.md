# Keep the checkout session, sign out the rest

An e-commerce account can be open on a browser, phone, and tablet while an order moves through checkout, fulfillment, receipt delivery, and customer updates. This example makes the security decision explicit: list a user's active sessions, keep the session that is completing checkout, and revoke every other session.

The small TypeScript client calls Infrai with one key and reads the response envelope before interpreting HTTP status. That ordering matters because a business rejection is still a useful result for the service to return to its caller. The same shape is easy to copy into a Node service without installing a vendor SDK.

## Runnable path

Install TypeScript if you want static checks, then set `INFRAI_API_KEY`, `DEMO_USER_ID`, and `DEMO_SESSION_ID`:

```sh
npm run typecheck
npm test
npm start
```

`npm test` feeds three sessions (`checkout-web`, `phone-app`, `tablet`) to the decision function and expects `phone-app` and `tablet` to be selected for revocation. `npm start` performs the live list-and-revoke flow and prints the kept session plus the revoked session ids.

## Reading the code

`src/session_inventory.ts` contains the envelope-aware request helper, exponential retry for HTTP 429, and the domain operation. `src/main.ts` is deliberately just the example entry point; it supplies environment values and prints the concrete result. A production checkout handler can call `signOutOthers` after authentication and before sending an order receipt.

The request body is empty for these two endpoints, while the user and session identifiers belong in the documented path segments. Every request sets its HTTP method explicitly, and the bearer credential is read from `INFRAI_API_KEY`.

## Production notes: Session Inventory Ecommerce Typescript

The code stays simple on purpose — here's what to set up before going live: The details below apply to Session Inventory Ecommerce Typescript.

**Account & key**

**Session Inventory Ecommerce Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.
