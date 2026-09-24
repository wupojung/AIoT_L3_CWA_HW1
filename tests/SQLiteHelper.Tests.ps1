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
        
        { Invoke-SqliteQuery -DatabasePath "$PSScriptRoot\test_db.sqlite" -Query $createSql } | Should Not Throw
        { Invoke-SqliteQuery -DatabasePath "$PSScriptRoot\test_db.sqlite" -Query $insertSql } | Should Not Throw
        
        Test-Path "$PSScriptRoot\test_db.sqlite" | Should Be $true
    }

    It "Throws exception on invalid SQL" {
        $invalidSql = "INSERT INTO non_existent_table VALUES (1);"
        
        { Invoke-SqliteQuery -DatabasePath "$PSScriptRoot\test_db.sqlite" -Query $invalidSql } | Should Throw "SQLite Error:"
    }

    AfterAll {
        if (Test-Path "$PSScriptRoot\test_db.sqlite") {
            Remove-Item "$PSScriptRoot\test_db.sqlite" -Force
        }
    }
}
