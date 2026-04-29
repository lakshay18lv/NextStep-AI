$path = 'C:\Users\HP\OneDrive\Desktop\NextStep Ai\NextStepAI.pdf'
$bytes = [System.IO.File]::ReadAllBytes($path)
$text = [System.Text.Encoding]::ASCII.GetString($bytes)
$matches = [regex]::Matches($text, '[ -~]{4,}')
$matches | ForEach-Object { $_.Value } | Set-Content -Path 'C:\Users\HP\OneDrive\Desktop\NextStep Ai\pdf_strings_all.txt'
