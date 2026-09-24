Describe "PowerShell Syntax Tests" {
    $sourceFiles = Get-ChildItem -Path "$PSScriptRoot\..\src" -Recurse -File |
        Where-Object { $_.Extension -in @(".ps1", ".psm1") }

    foreach ($file in $sourceFiles) {
        It "Parses $($file.Name) without syntax errors" {
            $source = Get-Content $file.FullName -Raw -Encoding UTF8

            # ScriptBlock.Create parses the source without executing it.
            # Any PowerShell syntax error throws and automatically fails this test.
            [scriptblock]::Create($source) | Out-Null
        }
    }
}
