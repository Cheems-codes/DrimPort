# Gemini Flash chatbot

The chatbot endpoint lives at `api/chat.ts` and is compatible with Vercel Node.js serverless functions. It uses the native `fetch` API and has no new npm, pnpm, or SDK dependency.

## Vercel environment variable

Add this project environment variable in Vercel:

```text
GEMINI_API_KEY=your-gemini-api-key
```

`GOOGLE_API_KEY` is also accepted as a fallback. The key is read only on the server and is never sent to the browser. The model defaults to `gemini-2.5-flash`; set `GEMINI_MODEL` if a different Gemini Flash model is preferred.

## Request

Send a `POST` request to `/api/chat`:

```json
{
  "message": "What certificates does Josh have?",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "model", "content": "Hello! How can I help?" }
  ]
}
```

The `history` field is optional. The endpoint limits message sizes and history length, includes the portfolio context in a server-side system instruction, and returns a concise response.

## Response

```json
{ "reply": "Josh has five listed academic and research recognitions...", "model": "gemini-2.5-flash" }
```

The endpoint handles `OPTIONS`, rejects non-`POST` requests, applies a 25-second upstream timeout, and returns JSON errors for missing configuration or invalid requests.

## Deployment note

No additional package is required for the chatbot. Vercel will use the existing project dependencies to build the React portfolio, while `api/chat.ts` itself relies only on Node's built-in HTTP types and native `fetch`. Set the environment variable in Vercel before testing `/api/chat`.
