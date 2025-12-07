# WCA Tool Calling

LLM tool calling system for querying World Cube Association (WCA) data using Google Gemini and the Vercel AI SDK.

## Setup

```bash
pnpm install
```

Create a `.env` file:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```
Get your API key from: https://aistudio.google.com/apikey

## Usage

```bash
npx tsx tool-calling.ts "Who is Feliks Zemdegs and what are his best results?"
```

## Available Tools

- `getPerson`, `getPersonResults`, `searchPersons` - Person/competitor data
- `getCompetition`, `getUpcomingCompetitions`, `getCompetitionResults` - Competition data
- `getWorldRankings`, `getRecords` - Rankings and records
- `getCountries` - Country list

## Features

- Real-time monitoring of tool calls and results
- Streaming LLM responses
- Multi-step tool call chaining (up to 5 steps)


