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

## Android (Capacitor) - CI build (no Android Studio required locally)

This project includes a Capacitor config and a GitHub Actions workflow that can build an Android debug APK (and attempt a release bundle) on CI without Android Studio on your machine.

- The appId/package is set to `com.daoxin.travelpal` and the display name is `TravelPal` in `capacitor.config.json`.
- To trigger a CI build, push to `main` or run the workflow manually in GitHub Actions ("Android CI Build (Capacitor)").
- The workflow will produce artifacts: `app-debug.apk` (debug APK) and, if possible, `app-release.aab` (release bundle) in the workflow artifacts.

If you want CI to produce a signed release AAB, create a Java keystore and add the base64 of the keystore file to GitHub Secrets as `ANDROID_KEYSTORE_BASE64`, and add `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` secrets. I can help update the workflow to sign the release bundle in CI if you want.
