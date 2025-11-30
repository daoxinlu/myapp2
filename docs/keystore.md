# Generating an Android Keystore (JKS) for CI signing

This repository includes a PowerShell helper to generate a JKS keystore and produce a base64-encoded file suitable for GitHub Secrets.

IMPORTANT: Do not commit keystore or passwords into the repo. Keep them secret.

Steps (Windows PowerShell):

1. Ensure JDK is installed and `keytool` is on your `PATH`.
2. From project root run:

```powershell
./scripts/generate-keystore.ps1
```

This will generate three files in the project root:
- `travelpal-release-key.jks` — the keystore file (keep safe, do NOT commit)
- `keystore-info.txt` — alias and passwords (keep safe)
- `keystore-base64.txt` — base64 representation (copy this into GitHub Secrets)

3. In GitHub repository settings → Secrets → Actions, add the following secrets:
- `ANDROID_KEYSTORE_BASE64` — contents of `keystore-base64.txt`
- `KEYSTORE_PASSWORD` — the `storepass` from `keystore-info.txt`
- `KEY_ALIAS` — the alias from `keystore-info.txt`
- `KEY_PASSWORD` — the `keypass` from `keystore-info.txt`

4. After adding secrets, modify the CI workflow if you want the release bundle to be signed during the action (we can help with that step).

Security note: If the keystore is ever compromised, generate a new keystore and rotate upload key in Google Play Console per Play guidelines.
