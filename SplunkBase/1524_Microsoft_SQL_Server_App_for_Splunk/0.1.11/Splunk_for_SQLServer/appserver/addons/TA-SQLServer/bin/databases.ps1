Import-Module "$SplunkHome\etc\apps\TA-SQLServer\bin\Common.psm1"

$State = Import-LocalStorage "Databases.xml" -DefaultValue (New-Object PSObject -Property @{ Databases = @{} })


$DBList = Get-SQLInstanceInformation | Where-Object { $_.ServiceState -eq "Running" } | Get-SQLDatabases
foreach ($DB in $DBList) {
    $DoEmit = $false

    if (-not $State.Databases.ContainsKey($DB.DatabaseGuid)) {
        $DoEmit = $true
    } else {
        $DBState = $State.Databases.Get_Item($DB.DatabaseGuid)
        if ($DBState.EmitTime.AddHours(24) -le [DateTime]::Now) {
            $DoEmit = $true
        } elseif ($DBState.Checksum -ne $DB.Checksum) {
            $DoEmit = $true
        }
    }
    
    if ($DoEmit -eq $true) {
        $DB | Write-Output

	$DBState = New-Object PSObject
	$DBState | Add-Member -MemberType NoteProperty -Name Checksum -Value $DB.Checksum
	$DBState | Add-Member -MemberType NoteProperty -Name EmitTime -Value ([DateTime]::Now)
	$State.Databases.Set_Item($DB.DatabaseGuid, $DBState)
    }
}

$State | Export-LocalStorage "Databases.xml"
