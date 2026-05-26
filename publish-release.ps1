param(
  [string]$RepoName = "TaskLaunch",
  [string]$Visibility = "public"
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host "Checking GitHub login..."
gh auth status

Write-Host "Checking local repository..."
if (-not (Test-Path ".git")) {
  throw "No .git repository found in $PSScriptRoot"
}

$repoFullName = "wangych0707/$RepoName"
$repoUrl = "https://github.com/$repoFullName.git"

Write-Host "Creating GitHub repository if needed: $repoFullName"
$repoExists = $true
try {
  gh repo view $repoFullName *> $null
} catch {
  $repoExists = $false
}

if (-not $repoExists) {
  gh repo create $repoFullName --source . --remote origin --$Visibility --description "One task, one workspace. A lightweight desktop task manager and workspace launcher." --push
} else {
  Write-Host "Repository already exists. Using it as origin."
  $origin = git remote get-url origin 2>$null
  if ($LASTEXITCODE -ne 0) {
    git remote add origin $repoUrl
  } else {
    git remote set-url origin $repoUrl
  }
  git push -u origin main
}

Write-Host "Pushing v0.1.0 tag..."
git push origin v0.1.0

$asset = Join-Path $PSScriptRoot "src-tauri\target\release\tasklaunch.exe"
if (-not (Test-Path $asset)) {
  Write-Host "Release executable not found. Building it now..."
  $tmp = Join-Path $PSScriptRoot ".tmpbuild"
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  $env:TMP = $tmp
  $env:TEMP = $tmp
  npm run desktop:build
}

Write-Host "Creating GitHub release v0.1.0..."
$releaseExists = $true
try {
  gh release view v0.1.0 --repo $repoFullName *> $null
} catch {
  $releaseExists = $false
}

if ($releaseExists) {
  gh release upload v0.1.0 $asset --repo $repoFullName --clobber
} else {
  gh release create v0.1.0 $asset --repo $repoFullName --title "TaskLaunch v0.1.0" --notes-file RELEASE_NOTES.md
}

Write-Host "Done: https://github.com/$repoFullName/releases/tag/v0.1.0"
