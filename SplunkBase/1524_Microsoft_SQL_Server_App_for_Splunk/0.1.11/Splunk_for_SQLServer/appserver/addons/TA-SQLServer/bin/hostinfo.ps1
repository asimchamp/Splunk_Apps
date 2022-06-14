function Get-LocalIPAddress
{
    $AdapterSet = Get-WmiObject -Class Win32_NetworkAdapterConfiguration
    $IPAddressSet = @()
    foreach ($adapter in $AdapterSet) {
	    if ($adapter.IPAddress -ne $null) {
			foreach ($ipaddress in $adapter.IPAddress) {
				$IPAddressSet = $IPAddressSet + $ipaddress
			}
		}
    }
    $IPAddressSet
} 
 
function Get-HostInformation {
    [CmdletBinding()]
    Param (
        [Parameter(Mandatory=$False)]
        [string]$ServerName = $env:ComputerName
    )

	PROCESS {
		$HostInfo = New-Object PSObject

		$osinfo = Get-WmiObject -Class Win32_OperatingSystem -Namespace 'root/cimv2' -Computer $ServerName
		$HostInfo | Add-Member -MemberType NoteProperty -Name OSBuildNumber -Value $osinfo.BuildNumber
		$HostInfo | Add-Member -MemberType NoteProperty -Name OSVersion -Value $osinfo.Version
		$HostInfo | Add-Member -MemberType NoteProperty -Name OSSerialNumber -Value $osinfo.SerialNumber

		$sysinfo = Get-WmiObject -Class Win32_ComputerSystem -Namespace 'root/cimv2' -Computer $ServerName
		$HostInfo | Add-Member -MemberType NoteProperty -Name ComputerName -Value $sysinfo.Name
		$HostInfo | Add-Member -MemberType NoteProperty -Name ComputerDomain -Value $sysinfo.Domain
		$HostInfo | Add-Member -MemberType NoteProperty -Name TotalPhysicalMemory -Value $sysinfo.TotalPhysicalMemory
		
		$ipaddres = (Get-LocalIPAddress) -join ","
		$HostInfo | Add-Member -MemberType NoteProperty -Name IPAddressList -Value $ipaddres 
		
		$HostInfo
	}
}

Get-HostInformation