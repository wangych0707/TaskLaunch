param(
  [string]$Version = "0.2.1",
  [string]$Makensis = ""
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$appExe = Join-Path $root "src-tauri\target\release\tasklaunch.exe"
$outDir = Join-Path $root "src-tauri\target\release\bundle\nsis"
$outFile = Join-Path $outDir "TaskLaunch_0.2.1_x64-setup.exe"
$script = Join-Path $PSScriptRoot "installer.nsi"

if (!(Test-Path $appExe)) {
  throw "Missing app executable: $appExe"
}

if (!(Test-Path $script)) {
  throw "Missing NSIS script: $script"
}

if (!$Makensis) {
  $fromPath = Get-Command makensis.exe -ErrorAction SilentlyContinue
  if ($fromPath) {
    $Makensis = $fromPath.Source
  } elseif (Test-Path "C:\Program Files (x86)\NSIS\makensis.exe") {
    $Makensis = "C:\Program Files (x86)\NSIS\makensis.exe"
  } elseif (Test-Path "C:\Program Files\NSIS\makensis.exe") {
    $Makensis = "C:\Program Files\NSIS\makensis.exe"
  }
}

if (!$Makensis -or !(Test-Path $Makensis)) {
  throw "Could not find makensis.exe. Install NSIS or pass -Makensis <path>."
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

& $Makensis `
  "/DPRODUCT_VERSION=$Version" `
  "/DAPP_EXE=$appExe" `
  "/DOUT_FILE=$outFile" `
  $script

if ($LASTEXITCODE -ne 0) {
  throw "NSIS build failed."
}

if (!(Test-Path $outFile)) {
  throw "Setup build failed: $outFile"
}

Get-Item -LiteralPath $outFile
