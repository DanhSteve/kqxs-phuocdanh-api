# deploy.ps1 — chạy SAU KHI đã gh auth login + có tài khoản Vercel (đăng ký bằng GitHub)
# Usage:  cd e:\vesophuocdanh\kqxs-phuocdanh-api ; .\deploy.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "==> Check GitHub auth..." -ForegroundColor Cyan
gh auth status
if ($LASTEXITCODE -ne 0) {
  Write-Host "Chay: gh auth login --web" -ForegroundColor Yellow
  exit 1
}

Write-Host "==> Create / push repo DanhSteve/kqxs-phuocdanh-api ..." -ForegroundColor Cyan
$remote = git remote 2>$null
if (-not $remote) {
  gh repo create DanhSteve/kqxs-phuocdanh-api --public --source=. --remote=origin --push --description "KQXS Phuoc Danh API for n8n Fanpage"
} else {
  git push -u origin HEAD
}

Write-Host "==> Deploy Vercel production..." -ForegroundColor Cyan
npx vercel --prod --yes

Write-Host ""
Write-Host "XONG. Copy URL Vercel roi gui team n8n (xem HANDOFF_N8N.md)" -ForegroundColor Green
