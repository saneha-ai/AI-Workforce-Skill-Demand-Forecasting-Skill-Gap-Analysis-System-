# Test 1: Normal Data (Should be NO DRIFT)
$normal_payload = @{
    skills_batch = @(
        @("python", "data analysis", "sql", "machine learning"),
        @("java", "software engineering", "react", "node.js"),
        @("project management", "agile", "communication"),
        @("python", "pandas", "numpy", "scikit-learn")
    )
} | ConvertTo-Json

Write-Host "--- Test 1: Normal Data ---"
try {
    $res1 = Invoke-RestMethod -Method Post -Uri "http://localhost:8006/debug_drift" -ContentType "application/json" -Body $normal_payload
    Write-Host "Drift Detected: $($res1.is_drift)"
    Write-Host "Message: $($res1.message)"
    Write-Host "P-Value: $($res1.p_value_avg)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

# Test 2: Drifting Data (Should be DRIFT DETECTED)
# Using completely different vocabulary (Cooking/Medical) that shouldn't match Job Descriptions
$drift_payload = @{
    skills_batch = @(
        @("surgery", "patient care", "anatomy", "medicine"),
        @("cooking", "chef", "culinary arts", "food safety"),
        @("painting", "art", "sculpture", "history"),
        @("farming", "agriculture", "soil", "crops")
    )
} | ConvertTo-Json

Write-Host "`n--- Test 2: Drifting Data ---"
try {
    $res2 = Invoke-RestMethod -Method Post -Uri "http://localhost:8006/debug_drift" -ContentType "application/json" -Body $drift_payload
    Write-Host "Drift Detected: $($res2.is_drift)"
    Write-Host "Message: $($res2.message)"
    Write-Host "P-Value: $($res2.p_value_avg)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
