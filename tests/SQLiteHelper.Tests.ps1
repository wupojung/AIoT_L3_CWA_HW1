Import-Module "$PSScriptRoot\..\src\SQLiteHelper.psm1" -Force

Describe "SQLiteHelper Tests" {
    BeforeAll {
        if (Test-Path "$PSScriptRoot\test_db.sqlite") {
            Remove-Item "$PSScriptRoot\test_db.sqlite" -Force
        }
    }

    It "Can create a table and insert data" {
        $createSql = "CREATE TABLE test_table (id INT, name TEXT);"
        $insertSql = "INSERT INTO test_table VALUES (1, 'TestName');"

        # Pester 6 has no Should-NotThrow assertion.
        # Execute the commands directly: any unexpected exception automatically fails this test.
        Invoke-SqliteQuery -DatabasePath "$PSScriptRoot\test_db.sqlite" -Query $createSql
        Invoke-SqliteQuery -DatabasePath "$PSScriptRoot\test_db.sqlite" -Query $insertSql

        (Test-Path "$PSScriptRoot\test_db.sqlite") | Should-BeTrue
    }

    It "Can apply the project schema repeatedly" {
        $schemaPath = Join-Path $PSScriptRoot "..\src\schema.sql"
        $schemaSql = Get-Content $schemaPath -Raw -Encoding UTF8

        Invoke-SqliteQuery -DatabasePath "$PSScriptRoot\test_db.sqlite" -Query $schemaSql
        Invoke-SqliteQuery -DatabasePath "$PSScriptRoot\test_db.sqlite" -Query $schemaSql

        (Test-Path "$PSScriptRoot\test_db.sqlite") | Should-BeTrue
    }

    It "Throws exception on invalid SQL" {
        $invalidSql = "INSERT INTO non_existent_table VALUES (1);"

        { Invoke-SqliteQuery -DatabasePath "$PSScriptRoot\test_db.sqlite" -Query $invalidSql } |
            Should-Throw -ExceptionMessage "*SQLite Error:*"
    }

    AfterAll {
        if (Test-Path "$PSScriptRoot\test_db.sqlite") {
            Remove-Item "$PSScriptRoot\test_db.sqlite" -Force
        }
    }
}
