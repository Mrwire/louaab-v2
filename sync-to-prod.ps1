$ErrorActionPreference = "Stop"

Write-Host "Syncing changes to production (Dev Mode)..." -ForegroundColor Cyan

# 1. Create temp directory
$tempDir = "deploy_temp_sync"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# 2. Copy src folder (where code lives)
# Using Robocopy for speed and exclusion if needed, or simple Copy-Item
Write-Host "Copying src folder..."
Copy-Item -Path "src" -Destination $tempDir -Recurse
Copy-Item -Path "package.json" -Destination $tempDir
Copy-Item -Path "package-lock.json" -Destination $tempDir
Copy-Item -Path "next.config.ts" -Destination $tempDir
Copy-Item -Path "tsconfig.json" -Destination $tempDir
Copy-Item -Path "ecosystem.config.js" -Destination $tempDir
Copy-Item -Path "postcss.config.mjs" -Destination $tempDir
Copy-Item -Path "tsconfig.backend.json" -Destination $tempDir

# 3. Zip it
$zipFile = "sync_patch.zip"
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
Write-Host "Zipping..."
Compress-Archive -Path "$tempDir\src" -DestinationPath $zipFile

# 4. SCP to server
Write-Host "Uploading to server..."
scp $zipFile root@164.90.190.154:/root/louaab-project/

# 5. Unzip on server (No build trigger, assuming Dev Mode is running)
Write-Host "Applying changes..."
ssh root@164.90.190.154 "cd /root/louaab-project && unzip -o sync_patch.zip"

# Cleanup
Remove-Item $tempDir -Recurse -Force
Remove-Item $zipFile -Force

Write-Host "Done! If server is in Dev Mode, changes are live." -ForegroundColor Green
