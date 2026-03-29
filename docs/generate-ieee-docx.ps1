param(
    [string]$MarkdownPath = "docs\TipJar_Research_Paper_IEEE.md",
    [string]$OutputDocxPath = "docs\TipJar_Research_Paper_IEEE.docx"
)

$ErrorActionPreference = "Stop"

function Clean-InlineText {
    param([string]$Text)
    if ($null -eq $Text) { return "" }
    $clean = $Text -replace '\*\*', ''
    $clean = $clean -replace '`([^`]+)`', '$1'
    return $clean.Trim()
}

function Parse-Blocks {
    param([string[]]$Lines)

    $blocks = New-Object System.Collections.Generic.List[object]
    $i = 0
    while ($i -lt $Lines.Count) {
        $line = $Lines[$i].Trim()

        if ([string]::IsNullOrWhiteSpace($line)) {
            $i++
            continue
        }

        if ($line -match '^(#{1,6})\s+(.+)$') {
            $blocks.Add([pscustomobject]@{
                Type = "heading"
                Level = $matches[1].Length
                Text = $matches[2].Trim()
            })
            $i++
            continue
        }

        if ($line -match '^- ') {
            $items = New-Object System.Collections.Generic.List[string]
            while ($i -lt $Lines.Count -and $Lines[$i].Trim() -match '^- ') {
                $items.Add((Clean-InlineText ($Lines[$i].Trim() -replace '^- ', '')))
                $i++
            }
            $blocks.Add([pscustomobject]@{
                Type = "ul"
                Items = $items
            })
            continue
        }

        if ($line -match '^\d+\.\s+') {
            $items = New-Object System.Collections.Generic.List[string]
            while ($i -lt $Lines.Count -and $Lines[$i].Trim() -match '^\d+\.\s+') {
                $items.Add((Clean-InlineText ($Lines[$i].Trim() -replace '^\d+\.\s+', '')))
                $i++
            }
            $blocks.Add([pscustomobject]@{
                Type = "ol"
                Items = $items
            })
            continue
        }

        $paragraph = New-Object System.Collections.Generic.List[string]
        while ($i -lt $Lines.Count) {
            $current = $Lines[$i].Trim()
            if ([string]::IsNullOrWhiteSpace($current)) { break }
            if ($current -match '^(#{1,6})\s+') { break }
            if ($current -match '^- ') { break }
            if ($current -match '^\d+\.\s+') { break }
            $paragraph.Add((Clean-InlineText $current))
            $i++
        }

        $blocks.Add([pscustomobject]@{
            Type = "p"
            Text = ($paragraph -join ' ')
        })
    }

    return $blocks
}

function Add-Paragraph {
    param(
        $Selection,
        [string]$Text,
        [int]$Alignment = 3,
        [double]$FontSize = 10,
        [bool]$Bold = $false,
        [bool]$Italic = $false,
        [double]$Before = 0,
        [double]$After = 6,
        [double]$FirstLineIndent = 0
    )

    $Selection.Style = "Normal"
    $Selection.Font.Name = "Times New Roman"
    $Selection.Font.Size = $FontSize
    $Selection.Font.Bold = if ($Bold) { 1 } else { 0 }
    $Selection.Font.Italic = if ($Italic) { 1 } else { 0 }
    $Selection.ParagraphFormat.Alignment = $Alignment
    $Selection.ParagraphFormat.SpaceBefore = $Before
    $Selection.ParagraphFormat.SpaceAfter = $After
    $Selection.ParagraphFormat.LineSpacingRule = 0
    $Selection.ParagraphFormat.FirstLineIndent = $FirstLineIndent
    $Selection.TypeText($Text)
    $Selection.TypeParagraph()
}

function Add-SectionHeading {
    param($Selection, [string]$Text)
    Add-Paragraph -Selection $Selection -Text $Text.ToUpper() -Alignment 1 -FontSize 10 -Bold $true -Italic $false -Before 6 -After 6 -FirstLineIndent 0
}

function Add-SubHeading {
    param($Selection, [string]$Text)
    Add-Paragraph -Selection $Selection -Text $Text -Alignment 0 -FontSize 10 -Bold $true -Italic $false -Before 3 -After 3 -FirstLineIndent 0
}

function Add-BodyParagraph {
    param($Selection, [string]$Text)
    Add-Paragraph -Selection $Selection -Text $Text -Alignment 3 -FontSize 10 -Bold $false -Italic $false -Before 0 -After 4 -FirstLineIndent 18
}

function Add-ReferenceParagraph {
    param($Selection, [string]$Text)
    $Selection.Style = "Normal"
    $Selection.Font.Name = "Times New Roman"
    $Selection.Font.Size = 9
    $Selection.Font.Bold = 0
    $Selection.Font.Italic = 0
    $Selection.ParagraphFormat.Alignment = 3
    $Selection.ParagraphFormat.SpaceBefore = 0
    $Selection.ParagraphFormat.SpaceAfter = 2
    $Selection.ParagraphFormat.LeftIndent = 18
    $Selection.ParagraphFormat.FirstLineIndent = -18
    $Selection.TypeText($Text)
    $Selection.TypeParagraph()
    $Selection.ParagraphFormat.LeftIndent = 0
    $Selection.ParagraphFormat.FirstLineIndent = 0
}

$lines = Get-Content -LiteralPath $MarkdownPath
$blocks = Parse-Blocks -Lines $lines

$titleBlock = $blocks | Where-Object { $_.Type -eq "heading" -and $_.Level -eq 1 } | Select-Object -First 1
if (-not $titleBlock) {
    throw "Could not find paper title in markdown."
}

$abstractHeadingIndex = -1
$indexTermsHeadingIndex = -1
for ($idx = 0; $idx -lt $blocks.Count; $idx++) {
    if ($blocks[$idx].Type -eq "heading" -and $blocks[$idx].Level -eq 2 -and $blocks[$idx].Text -eq "Abstract") {
        $abstractHeadingIndex = $idx
    }
    if ($blocks[$idx].Type -eq "heading" -and $blocks[$idx].Level -eq 2 -and $blocks[$idx].Text -eq "Index Terms") {
        $indexTermsHeadingIndex = $idx
    }
}

if ($abstractHeadingIndex -lt 0 -or $indexTermsHeadingIndex -lt 0) {
    throw "Could not find Abstract or Index Terms heading in markdown."
}

$frontMatter = @()
for ($idx = 1; $idx -lt $abstractHeadingIndex; $idx++) {
    $frontMatter += $blocks[$idx]
}

$authors = New-Object System.Collections.Generic.List[object]
$currentAuthor = New-Object System.Collections.Generic.List[string]
foreach ($block in $frontMatter) {
    if ($block.Type -ne "p") { continue }
    if ($block.Text -match '^Author \d+' -and $currentAuthor.Count -gt 0) {
        $authors.Add(@($currentAuthor.ToArray()))
        $currentAuthor = New-Object System.Collections.Generic.List[string]
    }
    $currentAuthor.Add($block.Text)
}
if ($currentAuthor.Count -gt 0) {
    $authors.Add(@($currentAuthor.ToArray()))
}

$bodyStartIndex = -1
for ($idx = $indexTermsHeadingIndex + 1; $idx -lt $blocks.Count; $idx++) {
    if ($blocks[$idx].Type -eq "heading" -and $blocks[$idx].Level -eq 2) {
        $bodyStartIndex = $idx
        break
    }
}

$abstractText = (($blocks[($abstractHeadingIndex + 1)..($indexTermsHeadingIndex - 1)] | Where-Object { $_.Type -eq "p" }).Text -join " ")
$indexTermsText = ""
if ($bodyStartIndex -gt 0) {
    $indexTermsText = (($blocks[($indexTermsHeadingIndex + 1)..($bodyStartIndex - 1)] | Where-Object { $_.Type -eq "p" }).Text -join " ")
}

$bodyBlocks = @()
if ($bodyStartIndex -gt 0) {
    for ($idx = $bodyStartIndex; $idx -lt $blocks.Count; $idx++) {
        $bodyBlocks += $blocks[$idx]
    }
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$emdash = [char]0x2014
$doc = $null

try {
    $doc = $word.Documents.Add()
    $selection = $word.Selection
    $doc.PageSetup.PageWidth = 612
    $doc.PageSetup.PageHeight = 792
    $doc.PageSetup.TopMargin = 45
    $doc.PageSetup.BottomMargin = 14
    $doc.PageSetup.LeftMargin = 36
    $doc.PageSetup.RightMargin = 36

    $selection.Style = "Title"
    $selection.Font.Name = "Times New Roman"
    $selection.Font.Size = 18
    $selection.Font.Bold = 1
    $selection.Font.Italic = 0
    $selection.ParagraphFormat.Alignment = 1
    $selection.ParagraphFormat.SpaceAfter = 6
    $selection.ParagraphFormat.SpaceBefore = 0
    $selection.TypeText($titleBlock.Text)
    $selection.TypeParagraph()
    $selection.TypeParagraph()

    if ($authors.Count -gt 0) {
        $tableColumns = [Math]::Min([Math]::Max($authors.Count, 1), 3)
        $table = $doc.Tables.Add($selection.Range, 1, $tableColumns)
        $table.Borders.Enable = 0
        $table.Range.Font.Name = "Times New Roman"
        $table.Range.Font.Size = 9
        $table.Range.ParagraphFormat.Alignment = 1
        $table.Rows.Alignment = 1

        for ($col = 1; $col -le $tableColumns; $col++) {
            if ($col -le $authors.Count) {
                $cellText = (($authors[$col - 1] | ForEach-Object { $_.Trim() }) -join "`r")
                $table.Cell(1, $col).Range.Text = $cellText
                $table.Cell(1, $col).Range.Font.Name = "Times New Roman"
                $table.Cell(1, $col).Range.Font.Size = 9
                $table.Cell(1, $col).Range.ParagraphFormat.Alignment = 1
            }
        }

        $selection.MoveDown() | Out-Null
        $selection.EndKey(6) | Out-Null
        $selection.TypeParagraph()
    }

    Add-Paragraph -Selection $selection -Text ("Abstract" + $emdash + $abstractText) -Alignment 3 -FontSize 9 -Bold $false -Italic $false -Before 0 -After 4 -FirstLineIndent 0
    Add-Paragraph -Selection $selection -Text ("Index Terms" + $emdash + $indexTermsText) -Alignment 3 -FontSize 9 -Bold $false -Italic $false -Before 0 -After 6 -FirstLineIndent 0

    $selection.InsertBreak(3)
    $doc.Sections.Item($doc.Sections.Count).PageSetup.TextColumns.SetCount(2)

    foreach ($block in $bodyBlocks) {
        if ($block.Type -eq "heading" -and $block.Level -eq 2) {
            Add-SectionHeading -Selection $selection -Text $block.Text
            continue
        }

        if ($block.Type -eq "heading" -and $block.Level -eq 3) {
            Add-SubHeading -Selection $selection -Text $block.Text
            continue
        }

        if ($block.Type -eq "p") {
            if ($block.Text -match '^\[\d+\]') {
                Add-ReferenceParagraph -Selection $selection -Text $block.Text
            }
            else {
                Add-BodyParagraph -Selection $selection -Text $block.Text
            }
            continue
        }

        if ($block.Type -eq "ul") {
            foreach ($item in $block.Items) {
                Add-BodyParagraph -Selection $selection -Text ("• " + $item)
            }
            continue
        }

        if ($block.Type -eq "ol") {
            $n = 1
            foreach ($item in $block.Items) {
                Add-BodyParagraph -Selection $selection -Text ("$n. " + $item)
                $n++
            }
            continue
        }
    }

    $outputFullPath = Join-Path (Get-Location) $OutputDocxPath
    $doc.SaveAs2($outputFullPath, 16)
    Write-Output $outputFullPath

    $doc.Close()
}
finally {
    if ($doc -ne $null) {
        try { $doc.Close([ref]0) } catch {}
    }
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
