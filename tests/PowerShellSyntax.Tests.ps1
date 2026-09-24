Describe "PowerShell Syntax Tests" {
    $sourceFiles = Get-ChildItem -Path "$PSScriptRoot\..\src" -Recurse -File |
        Where-Object { $_.Extension -in @(".ps1", ".psm1") }

    foreach ($file in $sourceFiles) {
        It "Parses $($file.Name) without syntax errors" {
            $tokens = $null
            $parseErrors = $null

            [System.Management.Automation.Language.Parser]::ParseFile(
                $file.FullName,
                [ref]$tokens,
                [ref]$parseErrors
            ) | Out-Null

            $parseErrors.Count | Should-Be 0
        }
    }
}
