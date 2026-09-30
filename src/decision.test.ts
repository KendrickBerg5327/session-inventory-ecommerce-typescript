import { chooseOtherSessions, InfraiSessionClient } from "./session_inventory.ts";

const sessions = [
  { id: "checkout-web", user_id: "u-42", device: "browser" },
  { id: "phone-app", user_id: "u-42", device: "phone" },
  { id: "tablet", user_id: "u-42", device: "tablet" }
];

const selected = chooseOtherSessions(sessions, "checkout-web").map((session) => session.id);
if (selected.join(",") !== "phone-app,tablet") throw new Error(`unexpected selection: ${selected.join(",")}`);
console.log("session decision test passed");

const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true, data: { items: sessions } }));
  const listed = await new InfraiSessionClient("test-key").listForUser("test-user");
  if (listed.length !== sessions.length || listed[0].id !== sessions[0].id) {
    throw new Error("listForUser must unwrap data.items");
  }
} finally {
  globalThis.fetch = originalFetch;
}
