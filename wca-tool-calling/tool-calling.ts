import "dotenv/config";
import { streamText, tool, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const WCA_BASE_URL = "https://www.worldcubeassociation.org/api/v0";

// Helper function to fetch from WCA API
async function fetchWCA(endpoint: string) {
  const response = await fetch(`${WCA_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`WCA API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Define WCA tools
const wcaTools = {
  // Get person by WCA ID
  getPerson: tool({
    description: "Get information about a person/competitor by their WCA ID (e.g., '2010ABCD01')",
    inputSchema: z.object({
      wca_id: z.string().describe("The WCA ID of the person (format: YYYYABCD##)"),
    }),
    execute: async ({ wca_id }) => {
      return await fetchWCA(`/persons/${wca_id}`);
    },
  }),

  // Get all results for a person
  getPersonResults: tool({
    description: "Get all competition results for a person by their WCA ID",
    inputSchema: z.object({
      wca_id: z.string().describe("The WCA ID of the person"),
    }),
    execute: async ({ wca_id }) => {
      return await fetchWCA(`/persons/${wca_id}/results`);
    },
  }),

  // Search persons by name
  searchPersons: tool({
    description: "Search for persons/competitors by name. Returns multiple results so the LLM can choose the closest match.",
    inputSchema: z.object({
      query: z.string().describe("The name to search for"),
    }),
    execute: async ({ query }) => {
      return await fetchWCA(`/search/users?q=${encodeURIComponent(query)}&persons_table=true`);
    },
  }),

  // Get competition details
  getCompetition: tool({
    description: "Get details about a competition by its competition ID",
    inputSchema: z.object({
      competition_id: z.string().describe("The competition ID (e.g., 'RubiksCube2024')"),
    }),
    execute: async ({ competition_id }) => {
      return await fetchWCA(`/competitions/${competition_id}`);
    },
  }),

  // List upcoming competitions
  getUpcomingCompetitions: tool({
    description: "Get a list of upcoming competitions",
    inputSchema: z.object({}),
    execute: async () => {
      return await fetchWCA("/competitions?upcoming=true");
    },
  }),

  // Get competition results
  getCompetitionResults: tool({
    description: "Get results for a specific competition",
    inputSchema: z.object({
      competition_id: z.string().describe("The competition ID"),
    }),
    execute: async ({ competition_id }) => {
      return await fetchWCA(`/competitions/${competition_id}/results`);
    },
  }),

  // Get world rankings
  getWorldRankings: tool({
    description: "Get world rankings for an event (single or average)",
    inputSchema: z.object({
      event: z.string().describe("The event ID (e.g., '333', '222', '333oh', 'pyram', etc.)"),
      type: z.enum(["single", "average"]).describe("Whether to get single or average rankings"),
      page: z.number().optional().describe("Page number (default: 1)"),
    }),
    execute: async ({ event, type, page = 1 }) => {
      return await fetchWCA(`/rankings/${event}/${type}?page=${page}`);
    },
  }),

  // Get records
  getRecords: tool({
    description: "Get historical records (WR, CR, NR) for an event",
    inputSchema: z.object({
      event: z.string().describe("The event ID (e.g., '333', '222', '333oh', etc.)"),
    }),
    execute: async ({ event }) => {
      return await fetchWCA(`/records/${event}`);
    },
  }),

  // List countries
  getCountries: tool({
    description: "Get a list of all WCA-recognized countries",
    inputSchema: z.object({}),
    execute: async () => {
      return await fetchWCA("/countries");
    },
  }),
};

// Main function to run tool calling with monitoring
async function runToolCalling(userQuery: string) {
  console.log("=".repeat(80));
  console.log("USER QUERY:", userQuery);
  console.log("=".repeat(80));
  console.log();

  let stepCounter = 0;
  const result = await streamText({
    model: google("gemini-2.5-flash-preview-09-2025"),
    tools: wcaTools,
    prompt: userQuery,
    stopWhen: stepCountIs(5), // Stop after max 5 steps
    onStepFinish: ({ text, toolCalls, toolResults }) => {
      stepCounter++;
      console.log(`\n[STEP ${stepCounter} FINISHED]`);
      console.log("-".repeat(80));

      // Monitor tool calls
      if (toolCalls && toolCalls.length > 0) {
        console.log(`\n🔧 TOOL CALLS (${toolCalls.length}):`);
        toolCalls.forEach((toolCall, index) => {
          console.log(`\n  Tool Call #${index + 1}:`);
          console.log(`    Tool Name: ${toolCall.toolName}`);
          console.log(`    Tool Call ID: ${toolCall.toolCallId}`);
          console.log(`    Input:`, JSON.stringify(toolCall.input, null, 2));
        });
      }

      // Monitor tool results
      if (toolResults && toolResults.length > 0) {
        console.log(`\n📊 TOOL RESULTS (${toolResults.length}):`);
        toolResults.forEach((toolResult, index) => {
          console.log(`\n  Tool Result #${index + 1}:`);
          console.log(`    Tool Name: ${toolResult.toolName}`);
          console.log(`    Tool Call ID: ${toolResult.toolCallId}`);
          const resultOutput = 'output' in toolResult ? toolResult.output : toolResult;
          const resultStr = JSON.stringify(resultOutput, null, 2);
          console.log(`    Result:`, resultStr.substring(0, 500) + (resultStr.length > 500 ? "..." : ""));
        });
      }

      // Show text generated in this step
      if (text) {
        console.log(`\n💬 TEXT GENERATED IN THIS STEP:`);
        console.log(`  ${text.substring(0, 200)}${text.length > 200 ? "..." : ""}`);
      }

      console.log("-".repeat(80));
    },
  });

  // Stream the final response
  console.log("\n🤖 FINAL LLM RESPONSE:");
  console.log("=".repeat(80));
  let fullText = "";
  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
    fullText += textPart;
  }
  console.log("\n" + "=".repeat(80));

  // Show summary
  console.log("\n📈 SUMMARY:");
  console.log("-".repeat(80));
  const response = await result;
  const steps = await response.steps;
  const allToolCalls = steps.flatMap((step: any) => step.toolCalls || []);
  const allToolResults = steps.flatMap((step: any) => step.toolResults || []);

  console.log(`Total Steps: ${steps.length}`);
  console.log(`Total Tool Calls: ${allToolCalls.length}`);
  console.log(`Total Tool Results: ${allToolResults.length}`);
  console.log(`Final Response Length: ${fullText.length} characters`);

  if (allToolCalls.length > 0) {
    console.log("\nTools Used:");
    const toolUsage = new Map<string, number>();
    allToolCalls.forEach((call: any) => {
      toolUsage.set(call.toolName, (toolUsage.get(call.toolName) || 0) + 1);
    });
    toolUsage.forEach((count, toolName) => {
      console.log(`  - ${toolName}: ${count} time(s)`);
    });
  }

  console.log("-".repeat(80));
}

// Example usage
const userQuery = process.argv[2] || "Who is Satya Darshan and what are his best results?";

runToolCalling(userQuery).catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

