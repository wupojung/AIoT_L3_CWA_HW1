Describe "PowerShell Syntax Tests" {
    It "Parses all source PowerShell files without syntax errors" {
        $sourceFiles = Get-ChildItem -Path "$PSScriptRoot\..\src" -Recurse -File |
            Where-Object { $_.Extension -in @(".ps1", ".psm1") }

        if ($sourceFiles.Count -eq 0) {
            throw "No PowerShell source files were found under src/."
        }

        foreach ($file in $sourceFiles) {
            $source = Get-Content $file.FullName -Raw -Encoding UTF8

            try {
                [scriptblock]::Create($source) | Out-Null
            }
            catch {
                throw "PowerShell syntax error in '$($file.FullName)': $($_.Exception.Message)"
            }
        }
    }
}
