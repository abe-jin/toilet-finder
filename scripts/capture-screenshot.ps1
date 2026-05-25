# capture-screenshot.ps1
# Usage: powershell -ExecutionPolicy Bypass -File scripts/capture-screenshot.ps1 <name>
# Example: powershell -ExecutionPolicy Bypass -File scripts/capture-screenshot.ps1 home
#   -> saves to store-assets/screenshots/home.png

param(
    [Parameter(Mandatory = $true)]
    [string]$Name
)

$ADB = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$SCREENSHOTS_DIR = Join-Path $PSScriptRoot "..\store-assets\screenshots"
$DEVICE_PATH = "/sdcard/${Name}.png"
$OUTPUT_PATH = Join-Path $SCREENSHOTS_DIR "${Name}.png"

# Verify adb exists
if (-not (Test-Path $ADB)) {
    Write-Error "adb not found at: $ADB"
    exit 1
}

# Resolve output directory
$SCREENSHOTS_DIR = (Resolve-Path $SCREENSHOTS_DIR).Path

# Pick device: prefer emulator-5554
$devices = & $ADB devices |
    Select-Object -Skip 1 |
    Where-Object { $_ -match '\S' -and $_ -notmatch '^\s*$' } |
    ForEach-Object { ($_ -split '\s+')[0] }

if (-not $devices) {
    Write-Error "No Android devices/emulators found. Start the emulator first."
    exit 1
}

$DEVICE = if ($devices -contains "emulator-5554") { "emulator-5554" } else { $devices | Select-Object -First 1 }
Write-Host "Using device: $DEVICE"

# Capture
Write-Host "Capturing screen -> $OUTPUT_PATH"
& $ADB -s $DEVICE shell screencap -p $DEVICE_PATH
if ($LASTEXITCODE -ne 0) { Write-Error "screencap failed"; exit 1 }

& $ADB -s $DEVICE pull $DEVICE_PATH $OUTPUT_PATH
if ($LASTEXITCODE -ne 0) { Write-Error "adb pull failed"; exit 1 }

& $ADB -s $DEVICE shell rm $DEVICE_PATH

Write-Host "Saved: $OUTPUT_PATH"

# Show image dimensions via .NET
Add-Type -AssemblyName System.Drawing
try {
    $img = [System.Drawing.Image]::FromFile($OUTPUT_PATH)
    Write-Host "Size: $($img.Width) x $($img.Height) px"
    $img.Dispose()
} catch {
    Write-Host "(Could not read image dimensions)"
}
