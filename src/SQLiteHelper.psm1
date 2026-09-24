$TypeDefinition = @"
using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class WinSqlite {
    [DllImport("winsqlite3.dll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern int sqlite3_open(string filename, out IntPtr db);

    [DllImport("winsqlite3.dll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern int sqlite3_close(IntPtr db);

    [DllImport("winsqlite3.dll", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern int sqlite3_exec(IntPtr db, IntPtr sql, IntPtr callback, IntPtr arg, out IntPtr errmsg);

    public delegate int SQLiteCallback(IntPtr data, int argc, IntPtr argv, IntPtr azColName);

    [DllImport("winsqlite3.dll", EntryPoint = "sqlite3_exec", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.Cdecl)]
    public static extern int sqlite3_exec_cb(IntPtr db, IntPtr sql, SQLiteCallback callback, IntPtr arg, out IntPtr errmsg);

    public static void Execute(string dbPath, string sql) {
        IntPtr db;
        int rc = sqlite3_open(dbPath, out db);
        if (rc != 0) throw new Exception("Cannot open database: " + dbPath);
        
        IntPtr pSql = IntPtr.Zero;
        try {
            byte[] utf8Bytes = System.Text.Encoding.UTF8.GetBytes(sql);
            pSql = Marshal.AllocHGlobal(utf8Bytes.Length + 1);
            Marshal.Copy(utf8Bytes, 0, pSql, utf8Bytes.Length);
            Marshal.WriteByte(pSql, utf8Bytes.Length, 0);

            IntPtr errMsg;
            rc = sqlite3_exec(db, pSql, IntPtr.Zero, IntPtr.Zero, out errMsg);
            if (rc != 0) {
                string err = Marshal.PtrToStringAnsi(errMsg);
                sqlite3_close(db);
                throw new Exception("SQLite Error: " + err);
            }
        } finally {
            if (pSql != IntPtr.Zero) Marshal.FreeHGlobal(pSql);
            sqlite3_close(db);
        }
    }

    public static string PtrToStringUTF8(IntPtr ptr) {
        if (ptr == IntPtr.Zero) return null;
        int len = 0;
        while (Marshal.ReadByte(ptr, len) != 0) len++;
        if (len == 0) return string.Empty;
        byte[] buffer = new byte[len];
        Marshal.Copy(ptr, buffer, 0, len);
        return System.Text.Encoding.UTF8.GetString(buffer);
    }

    public static object[] Select(string dbPath, string sql) {
        IntPtr db;
        int rc = sqlite3_open(dbPath, out db);
        if (rc != 0) throw new Exception("Cannot open database: " + dbPath);
        
        List<object> results = new List<object>();

        SQLiteCallback callback = (IntPtr data, int argc, IntPtr argv, IntPtr azColName) => {
            var row = new System.Collections.Hashtable();
            for (int i = 0; i < argc; i++) {
                IntPtr pCol = Marshal.ReadIntPtr(azColName, i * IntPtr.Size);
                IntPtr pVal = Marshal.ReadIntPtr(argv, i * IntPtr.Size);
                string colName = PtrToStringUTF8(pCol);
                string val = PtrToStringUTF8(pVal);
                row[colName] = val;
            }
            results.Add(row);
            return 0;
        };

        IntPtr pSql = IntPtr.Zero;
        try {
            byte[] utf8Bytes = System.Text.Encoding.UTF8.GetBytes(sql);
            pSql = Marshal.AllocHGlobal(utf8Bytes.Length + 1);
            Marshal.Copy(utf8Bytes, 0, pSql, utf8Bytes.Length);
            Marshal.WriteByte(pSql, utf8Bytes.Length, 0);

            IntPtr errMsg;
            rc = sqlite3_exec_cb(db, pSql, callback, IntPtr.Zero, out errMsg);
            if (rc != 0) {
                string err = Marshal.PtrToStringAnsi(errMsg);
                sqlite3_close(db);
                throw new Exception("SQLite Error: " + err);
            }
        } finally {
            if (pSql != IntPtr.Zero) Marshal.FreeHGlobal(pSql);
            sqlite3_close(db);
        }
        
        return results.ToArray();
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

function Invoke-SqliteSelect {
    param (
        [Parameter(Mandatory=$true)]
        [string]$DatabasePath,
        
        [Parameter(Mandatory=$true)]
        [string]$Query
    )
    
    return [WinSqlite]::Select($DatabasePath, $Query)
}

Export-ModuleMember -Function Invoke-SqliteQuery, Invoke-SqliteSelect
