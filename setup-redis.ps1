# Step 1: Docker Desktop start 
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
Write-Host "Docker Desktop starting... please wait" -ForegroundColor Yellow
Start-Sleep -Seconds 5  

# Step 1.1: Wait until Docker is ready
Write-Host "Waiting for Docker to be ready..." -ForegroundColor Yellow
while (-not (docker version 2>$null)) {
    Start-Sleep -Seconds 2
}
Write-Host "Docker is ready!" -ForegroundColor Green

# Step 2: Set project path and data path 
$projectPath = "D:\Backend\social-media-blog-app"
$dataPath = "$projectPath\redis-data"

# Step 3: Create redis data folder if not exists
if (-not (Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath | Out-Null
    Write-Host "Redis data folder created at $dataPath" -ForegroundColor Green
} else {
    Write-Host "Redis data folder already exists" -ForegroundColor Cyan
}

# Step 4: Old redis container deleted if exists
docker rm -f myredis 2>$null

# Step 5: Redis container persistence started
docker run --name myredis `
  -p 6379:6379 `
  -v "${dataPath}:/data" `
  -d redis redis-server --appendonly yes

Write-Host "Redis with persistence is now running on localhost:6379" -ForegroundColor Green

# Step 6: Test PING
docker exec -it myredis redis-cli PING
