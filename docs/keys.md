# API Keys and Configuration

This document explains where to configure API keys used by the app and recommended practices.

## Keys used by the app
- `AMAP_KEY` / `AMAP_SECRET` — AMap (高德) Web API key and security code used for place search and geocoding.
- `DEEPSEEK_KEY` — Optional domestic LLM key (DeepSeek) used as primary TTS/text generation in domestic flows.
- `GEMINI_API_KEY` / `VITE_API_KEY` — Gemini / Google AI key used for fallbacks and web grounding.

## Local development (recommended)

Keys are now entered manually through the app's **API Key 设置** page at runtime. The app no longer reads or writes API keys from `localStorage` or automatically copies Vite env values into the client.

For development you have two safe options:

- Keep keys only on your development backend (recommended): run the `server/proxy-example.js` and set `DEEPSEEK_KEY` as a server environment variable so the frontend calls the proxy.
- Or temporarily enter keys in the app's API Key UI (they are kept in-memory for the session). Do not commit or share any keys used here.

## Using DeepSeek securely in development


If you do use `.env.local` for server-side builds, do NOT put any production secrets there that end up in frontend bundles. Keep secrets on the server or in CI secrets.

- The repo includes `server/proxy-example.js` — recommended for production: run a small server that holds the `DEEPSEEK_KEY` in an environment variable (never put it in frontend code). The frontend can call `/api/deepseek` which forwards the request from the server.

## Important security notes
- Never commit `.env.local` or any file containing secrets to the repository. We added `.gitignore` to ignore `.env.local`.
- For production, keep secrets in server environment variables or a secrets manager and use a server-side proxy for all LLM/AI calls.

## Production security (strongly recommended)
- Do NOT embed your production keys in frontend code or public repos.
- Create a backend proxy (serverless function or small API) to hold the real keys and forward requests from the frontend.

### Minimal proxy (example)
See `server/proxy-example.js` for a simple Express-based example that forwards requests and injects the API key.

## Troubleshooting
- If AMap script fails to load on a domain, ensure the domain is allowed in the AMap console for your key.
- If TTS or Gemini calls fail, check network connectivity and that keys are present in `localStorage` or `import.meta.env`.

If you want, I can scaffold a production-ready serverless proxy for your hosting platform (Vercel / Netlify / AWS Lambda).