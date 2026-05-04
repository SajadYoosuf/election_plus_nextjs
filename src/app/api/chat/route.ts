import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';

// GET handler for simple testing
export async function GET() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  return new Response(JSON.stringify({
    status: 'AI Route Active',
    apiKeyConfigured: !!apiKey,
    model: 'gemini-2.0-flash',
    version: 'SDK v6 compatible'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  try {
    const { messages, liveResultsJson, currentConstituency } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'AI Key Missing',
        details: 'GOOGLE_GENERATIVE_AI_API_KEY is not set in .env.local'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // In AI SDK v6, we should convert messages to model format
    const modelMessages = await convertToModelMessages(messages);

    // streamText returns synchronously in AI SDK v6 (do NOT await it)
    const result = streamText({
      model: google('gemini-2.0-flash-exp'),
      system: `
        നിങ്ങൾ Kerala Election Pulse-ന്റെ AI അസിസ്റ്റന്റ് ആണ്.
        You are the AI assistant for Kerala Election Pulse — 2026 Kerala Assembly Elections.

        LIVE RESULTS DATA (updated every 60s):
        ${liveResultsJson}

        CURRENT USER CONSTITUENCY: ${currentConstituency}

        TONE: Friendly knowledgeable neighbor. Keep it short. Respond in Malayalam if asked in Malayalam.
      `,
      messages: modelMessages,
    });

    // In AI SDK v6, useChat expects toUIMessageStreamResponse()
    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chat API Error:', message);
    return new Response(JSON.stringify({
      error: 'AI Error',
      details: message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
