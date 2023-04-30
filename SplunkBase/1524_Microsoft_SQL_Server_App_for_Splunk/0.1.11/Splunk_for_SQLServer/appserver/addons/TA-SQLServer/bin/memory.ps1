$obj = New-Object PSObject

$totalmem = (Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory
$availmem = (Get-Counter -Counter "\Memory\Available Bytes").CounterSamples[0].CookedValue

$obj | Add-Member -MemberType NoteProperty -Name TotalPhysicalMemory -Value $totalmem
$obj | Add-Member -MemberType NoteProperty -Name AvailableMemory -Value $availmem

$obj