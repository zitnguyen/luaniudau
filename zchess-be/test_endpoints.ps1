$baseUrl = "http://localhost:5000/api"
$endpoints = @(
    "/users/teachers",
    "/courses",
    "/chapters",
    "/lessons",
    "/posts",
    "/students",
    "/classes",
    "/enrollments", 
    "/attendance",
    "/parents",
    "/orders",
    "/reviews",
    "/inquiries",
    "/progress",
    "/finance/stats",
    "/revenue",
    "/expenses"
)

# 1. Authenticate
Write-Host "Authenticating..." -ForegroundColor Cyan
$body = @{username="admin@chess.com"; password="123456"} | ConvertTo-Json
try {
    $tokenResponse = Invoke-RestMethod -Uri "$baseUrl/auth/signin" -Method Post -ContentType "application/json" -Body $body
    $token = $tokenResponse.accessToken
    Write-Host "Authentication successful!" -ForegroundColor Green
} catch {
    Write-Host "Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

$headers = @{Authorization="Bearer $token"}

# 2. Test Endpoints
foreach ($ep in $endpoints) {
    Write-Host "Testing $ep..." -NoNewline
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$ep" -Method Get -Headers $headers
        Write-Host " OK" -ForegroundColor Green
    } catch {
        Write-Host " FAILED ($($_.Exception.Message))" -ForegroundColor Red
    }
}
