# FCM Test - Create Test Order
$url = "https://hnoadcbppldmawognwdx.supabase.co/rest/v1/orders"
$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhub2FkY2JwcGxkbWF3b2dud2R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODgwMjEsImV4cCI6MjA3MjA2NDAyMX0.cMQBW7VFcWFdVsXY-0H0PaLRDSY13jicT4lPGh9Pmlo"

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$orderNumber = "FCM-TEST-$timestamp"

$bodyObject = @{
    order_number = $orderNumber
    customer_name = "FCM Test Customer"
    customer_phone = "+39 123 456 7890"
    total_amount = 199.99
    status = "pending"
    payment_method = "card"
    order_type = "delivery"
}
$body = $bodyObject | ConvertTo-Json -Compress

$headers = @{
    "apikey" = $apiKey
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

Write-Host "Creating test order: $orderNumber" -ForegroundColor Cyan
$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
Write-Host "Order created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Order Details:" -ForegroundColor Yellow
$response | Format-List
