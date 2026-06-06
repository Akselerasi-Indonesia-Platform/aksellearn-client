# sync-client.ps1
# Syncs clean FE source code from the dev repo to the aksellearn delivery worktree.
# Dev artifacts (strategies, .agents, old files, debug dumps, binaries) are never included.
#
# Usage:
#   .\scripts\sync-client.ps1 -CommitMessage "feat: add new feature"
#   .\scripts\sync-client.ps1 -DryRun
#
# Prerequisites (one-time setup):
#   See strategies/delivery/repository.md for full setup instructions.

param(
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "chore: sync updates",

    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

$DevRepo     = $PSScriptRoot | Split-Path -Parent
$ClientRepo  = Join-Path $DevRepo "..\aksellearn-fe-delivery"

if (-not (Test-Path $ClientRepo)) {
    Write-Host "ERROR: Client delivery worktree not found at: $ClientRepo" -ForegroundColor Red
    Write-Host "Run the one-time setup first (see strategies/delivery/repository.md)." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "  Clara FE -> AkselLearn Sync" -ForegroundColor Cyan
Write-Host "  ----------------------------" -ForegroundColor DarkGray
Write-Host "  From : $DevRepo" -ForegroundColor Gray
Write-Host "  To   : $ClientRepo" -ForegroundColor Gray
if ($DryRun) {
    Write-Host "  Mode : DRY RUN (no changes will be committed)" -ForegroundColor Yellow
}
Write-Host ""

# Directories to exclude from sync
$excludeDirs = @(
    ".git",
    ".agents",
    ".agent",
    ".output",
    ".tanstack",
    "strategies",
    "scratch",
    "tmp",
    "samples",
    "showcase",
    "node_modules",
    "logs",
    "dist"
)

# Files to exclude from sync
$excludeFiles = @(
    "*.txt",
    "*.csv",
    "*.log",
    "AGENTS.md",
    "GEMINI.md",
    "old_*.tsx",
    "old_*.ts",
    "old_*.js",
    "debug-*.ts",
    "debug-*.js",
    "api_response.json",
    "response.json",
    "diff.txt",
    ".env",
    ".env.production",
    ".env.local",
    ".env.development"
)

# Build robocopy arguments
# /MIR  - Mirror source to destination (delete files in dest that are gone in source)
# /XD   - Exclude directories
# /XF   - Exclude files
# /NFL  - No file list in output
# /NDL  - No directory list in output
# /NJH  - No job header
# /NJS  - No job summary
# /R:1  - Retry once on failure
# /W:1  - Wait 1 second between retries
$robocopyArgs = @(
    $DevRepo,
    $ClientRepo,
    "/MIR",
    "/XD"
) + $excludeDirs + @("/XF") + $excludeFiles + @("/NFL", "/NDL", "/NJH", "/NJS", "/R:1", "/W:1")

if ($DryRun) {
    $robocopyArgs += "/L"  # List only, no copying
}

Write-Host "Syncing files..." -ForegroundColor Yellow
$result = robocopy @robocopyArgs

# Robocopy exit codes: 0-7 are success (8+ are errors)
if ($LASTEXITCODE -ge 8) {
    Write-Host "ERROR: robocopy failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

Write-Host "Sync complete." -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN complete. No files were copied or committed." -ForegroundColor Yellow
    exit 0
}

# Stage and commit in the delivery worktree
Push-Location $ClientRepo

$status = git status --porcelain
if ($status) {
    Write-Host "Changes detected:" -ForegroundColor Cyan
    git status --short
    Write-Host ""
    git add -A
    git commit -m $CommitMessage
    Write-Host ""
    Write-Host "Committed: '$CommitMessage'" -ForegroundColor Green
    Write-Host ""
    Write-Host "To push to client remote, run:" -ForegroundColor Yellow
    Write-Host "  cd $ClientRepo" -ForegroundColor White
    Write-Host "  git push aksellearn aksellearn:main" -ForegroundColor White
} else {
    Write-Host "No changes to commit. Client repo is already up to date." -ForegroundColor Gray
}

Pop-Location
Write-Host ""
