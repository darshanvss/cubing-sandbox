# WCA Tool Calling

LLM tool calling system for querying World Cube Association (WCA) data using Google Gemini and the Vercel AI SDK.

## Features

- 🔧 **9 WCA API Tools**: Search competitors, get rankings, competitions, records, and more
- 📊 **Real-time Monitoring**: Track tool calls, results, and LLM responses
- 🌊 **Streaming Output**: Get responses as they're generated
- 🔄 **Multi-step Tool Calls**: Automatic chaining of tool calls up to 5 steps

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Create a `.env` file:**
   ```bash
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```
   Get your API key from: https://aistudio.google.com/apikey

## Usage

Run with a query:
```bash
npx tsx tool-calling.ts "Who is Feliks Zemdegs and what are his best results?"
```

Or pass a query as an argument:
```bash
npx tsx tool-calling.ts "What are the world records for 3x3?"
```

## Available Tools

- `getPerson` - Get person by WCA ID
- `getPersonResults` - Get all competition results for a person
- `searchPersons` - Search persons by name (returns multiple matches)
- `getCompetition` - Get competition details
- `getUpcomingCompetitions` - List upcoming competitions
- `getCompetitionResults` - Get competition results
- `getWorldRankings` - Get world rankings (single/average)
- `getRecords` - Get historical records (WR, CR, NR)
- `getCountries` - List all WCA-recognized countries

## Output

The script provides:
- **Step-by-step monitoring**: See each tool call, its inputs, and results
- **Streaming response**: Watch the LLM generate its final answer
- **Summary statistics**: Total steps, tool usage, and response length

## API Reference

All tools use the [WCA API v0](https://www.worldcubeassociation.org/api/v0) endpoints.

