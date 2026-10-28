import {
  randomBytes,
  createHash
} from "crypto";

export interface GeneratedToken {
  rawToken: string;
  hashedToken: string;
}

export function generateSecureToken(): GeneratedToken {

  const rawToken = randomBytes(32).toString("hex");

  const hashedToken = createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return {
    rawToken,
    hashedToken
  };
}

export function hashToken(token: string): string {

  return createHash("sha256")
    .update(token)
    .digest("hex");
}