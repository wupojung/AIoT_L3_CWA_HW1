$TypeDefinition = @"
using System;
using System.Runtime.InteropServices;

public class WinSqlite {
    [DllImport("winsqlite3.dll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern int sqlite3_open(string filename, out IntPtr db);

    [DllImport("winsqlite3.dll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern int sqlite3_close(IntPtr db);

    [DllImport("winsqlite3.dll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern int sqlite3_exec(IntPtr db, string sql, IntPtr callback, IntPtr arg, out IntPtr errmsg);

    public static void Execute(string dbPath, string sql) {
        IntPtr db;
        int rc = sqlite3_open(dbPath, out db);
        if (rc != 0) throw new Exception("Cannot open database: " + dbPath);
        
        IntPtr errMsg;
        rc = sqlite3_exec(db, sql, IntPtr.Zero, IntPtr.Zero, out errMsg);
        if (rc != 0) {
            string err = Marshal.PtrToStringAnsi(errMsg);
            sqlite3_close(db);
            throw new Exception("SQLite Error: " + err);
        }
        sqlite3_close(db);
    }
}
"@

# Only add type if it doesn't already exist
if (-not ("WinSqlite" -as [type])) {
    Add-Type -TypeDefinition $TypeDefinition
}

function Invoke-SqliteQuery {
    param (
        [Parameter(Mandatory=$true)]
        [string]$DatabasePath,
        
        [Parameter(Mandatory=$true)]
        [string]$Query
    )
    
    [WinSqlite]::Execute($DatabasePath, $Query)
}

Export-ModuleMember -Function Invoke-SqliteQuery
