import Anthropic from "@anthropic-ai/sdk";

export { SYSTEM_PROMPT, quickActions, type ChatMessage } from "./prompts";

/** Default model for the LIFE OS assistant. Configurable via env. */
export const AI_MODEL = process.env.AI_MODEL ?? "claude-opus-5";

export const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;

/** Lazily-constructed singleton client (only when a key is present). */
let _client: Anthropic | null = null;
export function anthropic() {
  if (!_client) _client = new Anthropic();
  return _client;
}
