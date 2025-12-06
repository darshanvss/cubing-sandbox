import "dotenv/config";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

const result = await streamText({
  model: google("gemini-2.5-flash-preview-09-2025"),
  prompt: "What is CFOP method?",
});

// Stream the text as it arrives
for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}

// Add a newline at the end
console.log();