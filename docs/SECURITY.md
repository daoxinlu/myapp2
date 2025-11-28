# Security Remediation

We removed sensitive keys from the repository history and replaced them with placeholders. Immediately rotate/revoke the exposed keys listed below and update your CI/Secrets:

- Google API Key (VITE_API_KEY)
- AMap Key (VITE_AMAP_KEY)
- AMap Secret (VITE_AMAP_SECRET)

Steps to follow:
1. Revoke/rotate the above keys in their provider consoles.
2. Update repository secrets in GitHub Actions (Settings  Secrets).
3. Re-clone the repo: git clone https://github.com/daoxinlu/myapp2.git (all collaborators must do this).

If you need, I can help rotate keys or reconfigure CI.
