<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1DeeZx2tO9QFxnpuNiEcOmymFjvVfNQLa

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure API keys securely:
   - For local development, open the app and go to **API Key 设置** to enter keys for this session (keys are kept in-memory and not persisted).
   - For production, run a backend proxy (see `server/proxy-example.js`) and set secrets as server environment variables; do not place production secrets in client-side `.env` files.
3. Run the app:
   `npm run dev`
