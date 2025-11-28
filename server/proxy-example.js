// proxy-example.js
// Minimal Express proxy example. DO NOT commit real keys to source control.

const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// Load keys from env
const GEMINI_KEY = process.env.GEMINI_KEY || 'REPLACE_ME';

// Example endpoint that forwards a prompt to Gemini (pseudo)
app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  try {
    // Replace with real Gemini API call or your cloud provider SDK
    const resp = await fetch('https://api.example.ai/gemini/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_KEY}`
      },
      body: JSON.stringify({ prompt })
    });
    const data = await resp.json();
    res.json(data);
  } catch (e) {
    console.error('proxy error', e);
    res.status(500).json({ error: 'proxy_failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy listening on ${port}`));
