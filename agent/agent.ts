import { groq } from "@ai-sdk/groq";
import { defineAgent } from "eve";

export default defineAgent({
  // Called directly through Groq (reads GROQ_API_KEY), not through the AI Gateway.
  model: groq("openai/gpt-oss-120b"),
  // The AI Gateway catalog has no metadata for direct-provider models. Value from Groq's model page.
  modelContextWindowTokens: 131_072,
  reasoning: "high",
  // Only the authored tools (create_charge): no bash, web or file tools. Keeps the agent on
  // collections and each request under Groq's free-tier limit of 8K tokens per minute.
  defaultTools: false,
});
