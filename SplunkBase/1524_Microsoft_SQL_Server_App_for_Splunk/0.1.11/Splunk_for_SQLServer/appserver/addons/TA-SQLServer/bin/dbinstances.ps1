Import-Module "$SplunkHome\etc\apps\TA-SQLServer\bin\Common.psm1"

$State = Import-LocalStorage "DBInstances.xml" -DefaultValue (New-Object PSObject -Property @{ DBInstances = @{} })

$Instances = Get-SQLInstanceInformation
foreach ($Instance in $Instances) {
    $DoEmit = $false

	if (-not $State.DBInstances.ContainsKey($Instance.ServerInstance)) {
		$DoEmit = $true
	} else {
		$DBState = $State.DBInstances.Get_Item($Instance.ServerInstance)
		if ($DBState.EmitTime.AddHours(24) -le [DateTime]::Now) {
			$DoEmit = $true
		} elseif ($DBState.Checksum -ne $Instance.Checksum) {
			$DoEmit = $true
		}
	}
    
    if ($DoEmit -eq $true) {
        $Instance | Write-Output

		$DBState = New-Object PSObject
		$DBState | Add-Member -MemberType NoteProperty -Name Checksum -Value $Instance.Checksum
		$DBState | Add-Member -MemberType NoteProperty -Name EmitTime -Value ([DateTime]::Now)
		$State.DBInstances.Set_Item($Instance.ServerInstance, $DBState)
    }
}

$State | Export-LocalStorage "DBInstances.xml"
