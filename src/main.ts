import { InfraiSessionClient } from "./session_inventory.ts";

const userId = process.env.DEMO_USER_ID;
const currentSessionId = process.env.DEMO_SESSION_ID;
if (!userId || !currentSessionId) {
  console.error("Set DEMO_USER_ID and DEMO_SESSION_ID to run the example.");
  process.exitCode = 1;
} else {
  const result = await new InfraiSessionClient().signOutOthers(userId, currentSessionId);
  console.log(JSON.stringify(result, null, 2));
}
