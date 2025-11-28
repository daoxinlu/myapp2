# API Keys and Configuration

This document explains where to configure API keys used by the app and recommended practices.

## Keys used by the app
- `AMAP_KEY` / `AMAP_SECRET` — AMap (高德) Web API key and security code used for place search and geocoding.
- `DEEPSEEK_KEY` — Optional domestic LLM key (DeepSeek) used as primary TTS/text generation in domestic flows.
- `GEMINI_API_KEY` / `VITE_API_KEY` — Gemini / Google AI key used for fallbacks and web grounding.

## Local development (recommended)
- Use a local `.env.local` file for Vite env variables (do NOT commit this file):

```
VITE_API_KEY=your_gemini_key_here
VITE_AMAP_KEY=your_amap_key_here
VITE_AMAP_SECRET=your_amap_secret_here
```

- Or set keys in browser `localStorage` from DevTools (immediate):

```js
localStorage.setItem('AMAP_KEY', 'your_amap_key_here');
localStorage.setItem('AMAP_SECRET', 'your_amap_secret_here');
localStorage.setItem('GEMINI_API_KEY', 'your_gemini_key_here');
```

The app prefers `localStorage` keys first, then Vite env values.

## Production security (strongly recommended)
- Do NOT embed your production keys in frontend code or public repos.
- Create a backend proxy (serverless function or small API) to hold the real keys and forward requests from the frontend.

### Minimal proxy (example)
See `server/proxy-example.js` for a simple Express-based example that forwards requests and injects the API key.

## Troubleshooting
- If AMap script fails to load on a domain, ensure the domain is allowed in the AMap console for your key.
- If TTS or Gemini calls fail, check network connectivity and that keys are present in `localStorage` or `import.meta.env`.

If you want, I can scaffold a production-ready serverless proxy for your hosting platform (Vercel / Netlify / AWS Lambda).