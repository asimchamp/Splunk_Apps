Import-Module "$SplunkHome\etc\apps\TA-SQLServer\bin\Common.psm1"
Import-Module "$SplunkHome\etc\apps\TA-SQLServer\bin\SQL.psm1"

$InstanceList = Get-SQLInstanceInformation | Where-Object { $_.ServiceState -eq "Running" }
foreach ($ServerInstance in $InstanceList) {
	#
	# Retrieve the Log File Data for this instance
	#
	$SQLConnection = $ServerInstance | Open-SQLConnection
	$LogData = $SQLConnection | Invoke-SQLQuery -Query "DBCC SQLPERF(logspace)"
	$SQLConnection | Close-SQLConnection
	
	# 
	# Process each database
	#
	$DatabaseList = $ServerInstance | Get-SQLDatabases
	foreach ($Database in $DatabaseList) {
		$LogRecord = ($LogData | Where-Object { $_.'Database Name' -eq $Database.Name })
		$Database | Add-Member -MemberType NoteProperty -Name LogSize -Value $LogRecord.'Log Size (MB)'
		$Database | Add-Member -MemberType NoteProperty -Name LogSpaceUsage -Value $LogRecord.'Log Space Used (%)'

		$Database | Select DatabaseGuid, `
							ActiveConnections, `
							DataSpaceUsage, `
							IndexSpaceUsage, `
							LogSpaceUsage, `
							Size, `
							LogSize, `
							SpaceAvailable, `
							Status, State
	}
}
