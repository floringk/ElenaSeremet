import "server-only";

import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Server-only Payload Local API client (Next.js / Node).
 */
export async function getPayloadClient() {
  return getPayload({ config });
}
