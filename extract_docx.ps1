Add-Type -AssemblyName System.IO.Compression.FileSystem
$docxPath = Join-Path $PSScriptRoot "AI_Product_Lead_Practical_Project_Brief_2.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xmlText = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$xml = [xml]$xmlText
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xml.SelectNodes("//w:p", $ns)
$lines = foreach ($p in $paragraphs) {
    $texts = $p.SelectNodes(".//w:t", $ns) | ForEach-Object { $_.InnerText }
    if ($texts) { $texts -join "" }
}
$lines | Out-File -FilePath (Join-Path $PSScriptRoot "project_brief.md") -Encoding utf8
Write-Host "Extracted $($lines.Count) paragraphs to project_brief.md"
