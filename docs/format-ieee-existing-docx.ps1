param(
    [string]$InputDocxPath = "docs\TipJar_Research_Paper_IEEE.docx",
    [string]$OutputDocxPath = "docs\TipJar_Research_Paper_IEEE_IEEEStyle.docx"
)

$ErrorActionPreference = "Stop"

$wdCollapseStart = 1
$wdSectionBreakContinuous = 3
$wdAlignParagraphLeft = 0
$wdAlignParagraphCenter = 1
$wdAlignParagraphJustify = 3
$wdLineSpaceSingle = 0

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    $inputFull = (Resolve-Path $InputDocxPath).Path
    $outputFull = Join-Path (Get-Location) $OutputDocxPath

    $doc = $word.Documents.Open($inputFull)

    $doc.PageSetup.PageWidth = 612
    $doc.PageSetup.PageHeight = 792
    $doc.PageSetup.TopMargin = 45
    $doc.PageSetup.BottomMargin = 14
    $doc.PageSetup.LeftMargin = 36
    $doc.PageSetup.RightMargin = 36

    for ($i = 1; $i -le $doc.Paragraphs.Count; $i++) {
        $para = $doc.Paragraphs.Item($i)
        $text = ($para.Range.Text -replace '[\r\a]', '').Trim()
        if ([string]::IsNullOrWhiteSpace($text)) { continue }

        $range = $para.Range
        $range.Font.Name = "Times New Roman"
        $range.Font.Bold = 0
        $range.Font.Italic = 0
        $range.ParagraphFormat.LineSpacingRule = $wdLineSpaceSingle
        $range.ParagraphFormat.SpaceBefore = 0
        $range.ParagraphFormat.SpaceAfter = 4
        $range.ParagraphFormat.FirstLineIndent = 18
        $range.ParagraphFormat.LeftIndent = 0
        $range.ParagraphFormat.Alignment = $wdAlignParagraphJustify

        if ($i -eq 1) {
            $range.Font.Size = 18
            $range.Font.Bold = 1
            $range.ParagraphFormat.Alignment = $wdAlignParagraphCenter
            $range.ParagraphFormat.SpaceAfter = 6
            $range.ParagraphFormat.FirstLineIndent = 0
            continue
        }

        if ($i -in 2, 3) {
            $range.Font.Size = 9
            $range.ParagraphFormat.Alignment = $wdAlignParagraphCenter
            $range.ParagraphFormat.SpaceAfter = 4
            $range.ParagraphFormat.FirstLineIndent = 0
            continue
        }

        if ($text -in @("Abstract:", "Index Terms:")) {
            $range.Font.Size = 9
            $range.Font.Bold = 1
            $range.ParagraphFormat.Alignment = $wdAlignParagraphLeft
            $range.ParagraphFormat.SpaceAfter = 0
            $range.ParagraphFormat.FirstLineIndent = 0
            continue
        }

        if ($i -in 5, 7) {
            $range.Font.Size = 9
            $range.ParagraphFormat.Alignment = $wdAlignParagraphJustify
            $range.ParagraphFormat.FirstLineIndent = 0
            $range.ParagraphFormat.SpaceAfter = 4
            continue
        }

        if ($text -match '^[IVXLCDM]+\.\s+') {
            $range.Font.Size = 10
            $range.Font.Bold = 1
            $range.ParagraphFormat.Alignment = $wdAlignParagraphCenter
            $range.ParagraphFormat.SpaceBefore = 6
            $range.ParagraphFormat.SpaceAfter = 4
            $range.ParagraphFormat.FirstLineIndent = 0
            continue
        }

        if ($text -match '^[A-Z]\.\s+') {
            $range.Font.Size = 10
            $range.Font.Bold = 1
            $range.ParagraphFormat.Alignment = $wdAlignParagraphLeft
            $range.ParagraphFormat.SpaceBefore = 4
            $range.ParagraphFormat.SpaceAfter = 2
            $range.ParagraphFormat.FirstLineIndent = 0
            continue
        }

        if ($text -match '^\[\d+\]') {
            $range.Font.Size = 9
            $range.ParagraphFormat.LeftIndent = 18
            $range.ParagraphFormat.FirstLineIndent = -18
            $range.ParagraphFormat.SpaceAfter = 2
            continue
        }

        $range.Font.Size = 10
    }

    $bodyStart = $doc.Paragraphs.Item(8).Range.Duplicate
    $bodyStart.Collapse($wdCollapseStart)
    $bodyStart.InsertBreak($wdSectionBreakContinuous)

    if ($doc.Sections.Count -ge 2) {
        $doc.Sections.Item(1).PageSetup.TextColumns.SetCount(1)
        $doc.Sections.Item(2).PageSetup.TextColumns.SetCount(2)
    }

    $doc.SaveAs2($outputFull, 16)
    Write-Output $outputFull
    $doc.Close([ref]0)
}
finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
