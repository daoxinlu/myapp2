<#
Generate a JKS keystore for Android signing and output base64+info files.
Usage:
  1. Open PowerShell in project root (requires `keytool` from JDK on PATH).
  2. Run: `./scripts/generate-keystore.ps1` to auto-generate with random password and alias.
  3. Optional: `./scripts/generate-keystore.ps1 -Alias myalias -KeystorePath ./my-release-key.jks -CommonName "Your Name"`

Outputs:
  - travelpal-release-key.jks (keystore file)
  - keystore-info.txt       (alias, storepass, keypass)
  - keystore-base64.txt     (base64-encoded keystore, suitable for GitHub Secrets)

Security: DO NOT commit the generated keystore or keystore-info.txt to version control.
#>

param(
    [string]$Alias = "upload",
    [string]$KeystorePath = "travelpal-release-key.jks",
    [int]$ValidityDays = 10000,
    [string]$CommonName = "TravelPal",
    [string]$OrganizationalUnit = "Dev",
    [string]$Organization = "TravelPal",
    [string]$Locality = "Beijing",
    [string]$State = "Beijing",
    [string]$Country = "CN"
)

function Random-Password($length = 24) {
    $chars = @()
    $chars += 48..57    # 0-9
    $chars += 65..90    # A-Z
    $chars += 97..122   # a-z
    -join ((1..$length) | ForEach-Object { [char]($chars | Get-Random) })
}

if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) {
    Write-Error "keytool not found. Please install a JDK and ensure `keytool` is in your PATH."
    exit 1
}

$pw = Random-Password 24
$dname = "CN=$CommonName, OU=$OrganizationalUnit, O=$Organization, L=$Locality, ST=$State, C=$Country"

Write-Host "Generating keystore at: $KeystorePath"
$keytoolArgs = @(
    '-genkeypair', '-v',
    '-keystore', $KeystorePath,
    '-storetype', 'JKS',
    '-keyalg', 'RSA',
    '-keysize', '2048',
    '-validity', $ValidityDays.ToString(),
    '-alias', $Alias,
    '-storepass', $pw,
    '-keypass', $pw,
    '-dname', $dname
)

# Run keytool
$keytool = Get-Command keytool | Select-Object -ExpandProperty Source
$proc = Start-Process -FilePath $keytool -ArgumentList $keytoolArgs -NoNewWindow -PassThru -Wait -ErrorAction Stop
if ($proc.ExitCode -ne 0) {
    Write-Error "keytool exited with code $($proc.ExitCode)"
    exit $proc.ExitCode
}

# Write info and base64
$info = @"
alias=$Alias
storepass=$pw
keypass=$pw
keystore_path=$KeystorePath
validity_days=$ValidityDays
"@

$infoPath = "keystore-info.txt"
[IO.File]::WriteAllText($infoPath, $info)

$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($KeystorePath))
$base64Path = "keystore-base64.txt"
[IO.File]::WriteAllText($base64Path, $base64)

Write-Host "Keystore generation complete."
Write-Host "Files created: $KeystorePath, $infoPath, $base64Path"
Write-Host "IMPORTANT: Do NOT commit these files to git. Add the base64 content to GitHub Secrets (e.g. ANDROID_KEYSTORE_BASE64) and the passwords/alias as separate secrets."**