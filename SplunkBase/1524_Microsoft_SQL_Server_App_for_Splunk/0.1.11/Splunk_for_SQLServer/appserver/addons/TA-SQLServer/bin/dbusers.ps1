Import-Module "$SplunkHome\etc\apps\TA-SQLServer\bin\Common.psm1"

$State = Import-LocalStorage "DBUsers.xml" -DefaultValue (New-Object PSObject -Property @{ Users = @{} })


$UserList = Get-SQLInstanceInformation | Where-Object { $_.ServiceState -eq "Running" } | Get-SQLUsers
foreach ($User in $UserList) {
    $DoEmit = $false

	$Key = $User.ServerInstance + "#" + $User.ID
	if (-not $State.Users.ContainsKey($Key)) {
		$DoEmit = $true
	} else {
		$RecState = $State.Users.Get_Item($Key)
		if ($RecState.EmitTime.AddHours(24) -le [DateTime]::Now) {
			$DoEmit = $true
		} elseif ($RecState.Checksum -ne $User.Checksum) {
			$DoEmit = $true
		}
	}

    if ($DoEmit -eq $true) {
        $User | Write-Output

		$RecState = New-Object PSObject
		$RecState | Add-Member -MemberType NoteProperty -Name Checksum -Value $User.Checksum
		$RecState | Add-Member -MemberType NoteProperty -Name EmitTime -Value ([DateTime]::Now)
		$State.Users.Set_Item($Key, $RecState)
    }
}

$State | Export-LocalStorage "DBUsers.xml"
