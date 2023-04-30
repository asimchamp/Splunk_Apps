
[System.Reflection.Assembly]::LoadWithPartialName('Microsoft.SQLServer.SQLWMIManagement') | Out-Null
[System.Reflection.Assembly]::LoadWithPartialName('Microsoft.SQLServer.Smo') | Out-Null

<#
    .SYNOPSIS
        Get-NullDefault

    .DESCRIPTION
        If the expression is null, then substitute the script block instead

    .USAGE
        $foo = (gnd -Default $false -Object $bar)
#>
function Get-NullDefault
{
    [CmdletBinding()]
    Param (
        [Parameter(Mandatory=$True)]
        [object]$Default,

        [Parameter()]
        $Object
    )

    PROCESS {
        if ($Object -eq $null) {
            return $Default
        } else {
            return $Object
        }
    }
}
Set-Alias gnd Get-NullDefault

<#
    .SYNOPSIS
        Get-Checksum

    .DESCRIPTION
        Returns the MD5 Checksum for an object, by concatenating all the Properties together in
        alphabetical order and then calculating the MD5 sum

    .NOTES
        Dependencies: None
#>
function Get-Checksum
{
    [CmdletBinding()]
    Param (
        [Parameter(Mandatory=$True)]
        [object]$Object
    )

    PROCESS {
        $MD5 = New-Object -TypeName System.Security.Cryptography.MD5CryptoServiceProvider
        $UTF8 = New-Object -TypeName System.Text.UTF8Encoding

        [string]$str = ""
        $Object.PSObject.Properties | Sort-Object -Property Name | Foreach-Object {
            if ($_.Value -eq $Null) {
                $str = $str + "{$($_.Name)=null}"
            } else {
                $str = $str + "{$($_.Name)=" + $_.Value.ToString() + "}"
            }
       }

        return [System.BitConverter]::ToString($MD5.ComputeHash($UTF8.GetBytes($str)))
    }
}

<#
    .SYNOPSIS
        Get-SQLInstanceInformation
    
    .DESCRIPTION
        Retrieves a bunch of information for each SQL Instance on the server or cluster node, and
        returns it as an array of PSCustomObjects
        
    .NOTES
        Dependencies: None
        
    .LINK
        http://technet.microsoft.com/en-us/magazine/ff458353.aspx
#>
function Get-SQLInstanceInformation
{
    [CmdletBinding()]
    Param (
        [Parameter(Mandatory=$False)]
        [string]$ServerName = $env:ComputerName
    )

    PROCESS {
        $Instances = (New-Object 'Microsoft.SQLServer.Management.Smo.Wmi.ManagedComputer' "$ServerName").Services | Where-Object { $_.type -eq 'SqlServer' }
        $Instances | Foreach-Object {
            $Instance = New-Object PSObject
            Write-Verbose "Processing SQL Instance: $($Instance.Name)"

            $Instance | Add-Member -MemberType NoteProperty -Name DisplayName -Value $_.DisplayName
            $Instance | Add-Member -MemberType NoteProperty -Name Name -Value $_.Name
            $Instance | Add-Member -MemberType NoteProperty -Name Clustered -Value $_.AdvancedProperties['CLUSTERED'].Value
            $Instance | Add-Member -MemberType NoteProperty -Name InstanceID -Value $_.AdvancedProperties['INSTANCEID'].Value
            $Instance | Add-Member -MemberType NoteProperty -Name FileVersion -Value $_.AdvancedProperties['FILEVERSION'].Value
            $Instance | Add-Member -MemberType NoteProperty -Name Version -Value $_.AdvancedProperties['VERSION'].Value
            $Instance | Add-Member -MemberType NoteProperty -Name ServiceAccount -Value $_.ServiceAccount
            $Instance | Add-Member -MemberType NoteProperty -Name ServiceState -Value $_.ServiceState
            $Instance | Add-Member -MemberType NoteProperty -Name State -Value $_.State

            if ($_.AdvancedProperties['VSNAME'].Value -eq '') {
                $Instance | Add-Member -MemberType NoteProperty -Name VirtualName -Value $env:ComputerName
            } else {
                            $Instance | Add-Member -MemberType NoteProperty -Name VirtualName -Value $_.AdvancedProperties['VSNAME'].Value
            }

            if ($_.Name.Split('$')[1] -eq $Null) {
                [string]$InstanceName = 'MSSQLSERVER'
                [string]$ServerInstance = $Instance.VirtualName
            } else {
                [string]$InstanceName = $_.Name.Split('$')[1]
                [string]$ServerInstance = "{0}\{1}" -f $Instance.VirtualName, $InstanceName
            }
            $Instance | Add-Member -MemberType NoteProperty -Name ServerInstance -Value $ServerInstance
            $Instance | Add-Member -MemberType NoteProperty -Name InstanceName -Value $InstanceName
			
			$port = $_.Parent.ServerInstances[$InstanceName].ServerProtocols['Tcp'].IPAddresses['IPAll'].IPAddressProperties['TcpPort'].Value
			if ($port -eq $null -or $port -eq "") {
				$port = $_.Parent.ServerInstances[$InstanceName].ServerProtocols['Tcp'].IPAddresses['IPAll'].IPAddressProperties['TcpDynamicPorts'].Value + " (Dynamic)"
				if ($port -eq $null -or $port -eq "") {
					$port = "Complex"
				}
			} else {
				$port = $port + " (Static)"
			}
            $Instance | Add-Member -MemberType NoteProperty -Name Port -Value $port

            # Add in information about the server
            $SQL = New-Object 'Microsoft.SqlServer.Management.Smo.Server' $ServerInstance
            $Instance | Add-Member -MemberType NoteProperty -Name Edition -Value $SQL.Edition
            $Instance | Add-Member -MemberType NoteProperty -Name AuditLevel -Value $SQL.AuditLevel
            $Instance | Add-Member -MemberType NoteProperty -Name LoginMode -Value $SQL.LoginMode
            $Instance | Add-Member -MemberType NoteProperty -Name Product -Value $SQL.Product
            $Instance | Add-Member -MemberType NoteProperty -Name ProductLevel -Value $SQL.ProductLevel
            $Instance | Add-Member -MemberType NoteProperty -Name MajorVersion -Value $SQL.Version.Major
            $Instance | Add-Member -MemberType NoteProperty -Name MinorVersion -Value $SQL.Version.Minor
            $Instance | Add-Member -MemberType NoteProperty -Name Build -Value  $SQL.Version.Build

            # Adjust for the SQL version differences
            $SQLVersion = "{0}.{1}" -f $SQL.Version.Major, $SQL.Version.Minor
            [string]$Release = "Unknown"
            if ($SQLVersion -eq "10.0") {
                $Release = "2008"
            } elseif ($SQLVersion -eq "10.50") {
                $Release = "2008R2"
            } elseif ($SQLVersion -eq "11.0") {
                $Release = "2012"
            }
            $Instance | Add-Member -MemberType NoteProperty -Name Release -Value $Release

            [string]$Checksum = Get-Checksum -Object $Instance

            # These things don't count against the checksum
            $Instance | Add-Member -MemberType NoteProperty -Name PhysicalMemory -Value $SQL.PhysicalMemory
            $Instance | Add-Member -MemberType NoteProperty -Name Processors -Value $SQL.Processors
            $Instance | Add-Member -MemberType NoteProperty -Name Checksum -Value $Checksum

            # Write out the instance information to the pipeline
            Write-Output $Instance
        }
    }
}

<#
    .SYNOPSIS
        Get-SQLDatabases

    .DESCRIPTION
        Returns objects representing the databases within a specific instance

    .NOTES
        Dependencies: Feed Get-SQLInstanceInformation output into this cmdlet.
#>
function Get-SQLDatabases {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$True,ValueFromPipeline=$True,ValueFromPipelineByPropertyName=$True)]
        $Instance
    )
    
    PROCESS {
        foreach ($i in $Instance) {
            $s = New-Object('Microsoft.SqlServer.Management.Smo.Server') $i.ServerInstance

            $s.Databases | %{
                $DB = New-Object PSObject
                
                $DB | Add-Member -MemberType NoteProperty -Name Name -Value $_.Name
                $DB | Add-Member -MemberType NoteProperty -Name ID -Value $_.ID
                $DB | Add-Member -MemberType NoteProperty -Name DatabaseGuid -Value $_.DatabaseGuid
                $DB | Add-Member -MemberType NoteProperty -Name DatabaseOwnershipChaining -Value $_.DatabaseOwnershipChaining
                $DB | Add-Member -MemberType NoteProperty -Name Parent -Value $_.Parent
                $DB | Add-Member -MemberType NoteProperty -Name CompatibilityLevel -Value $_.CompatibilityLevel
                $DB | Add-Member -MemberType NoteProperty -Name DboLogin -Value $_.DboLogin
                $DB | Add-Member -MemberType NoteProperty -Name DefaultSchema -Value $_.DefaultSchema
                $DB | Add-Member -MemberType NoteProperty -Name EncryptionEnabled -Value $_.EncryptionEnabled
                $DB | Add-Member -MemberType NoteProperty -Name LastBackupDate -Value $_.LastBackupDate
                $DB | Add-Member -MemberType NoteProperty -Name LastDifferentialBackupDate -Value $_.LastDifferentialBackupDate
                $DB | Add-Member -MemberType NoteProperty -Name LastLogBackupDate -Value $_.LastLogBackupDate
                $DB | Add-Member -MemberType NoteProperty -Name Owner -Value $_.Owner
                $DB | Add-Member -MemberType NoteProperty -Name PrimaryFilePath -Value $_.PrimaryFilePath
                $DB | Add-Member -MemberType NoteProperty -Name ReadOnly -Value $_.ReadOnly
                $DB | Add-Member -MemberType NoteProperty -Name Version -Value $_.Version
                $DB | Add-Member -MemberType NoteProperty -Name Urn -Value $_.Urn
				
				# Work out what mount point the PrimaryFilePath is on
				$LVM = [IO.Directory]::GetDirectoryRoot($_.PrimaryFilePath).TrimEnd("\")
				$DB | Add-Member -MemberType NoteProperty -Name LogicalDisk -Value $LVM
        
                # Add in relevant information from the instance
                $DB | Add-Member -MemberType NoteProperty -Name ServerInstance -Value $i.ServerInstance

                # Add in information about AutoShrink / AutoGrow
				if ($_.FileGroups -eq $Null -or $_.FileGroups[0] -eq $Null -or $_.FileGroups[0].Files -eq $Null) {
					$DB | Add-Member -MemberType NoteProperty -Name AutoShrink -Value "!ERROR"
					$DB | Add-Member -MemberType NoteProperty -Name AutoGrow -Value "!ERROR"
					$DB | Add-Member -MemberType NoteProperty -Name AutoGrowSetting -Value "!ERROR"
					$DB | Add-Member -MemberType NoteProperty -Name Warning -Value "SQL Authentication Issues"
				} else {
					$DB | Add-Member -MemberType NoteProperty -Name AutoShrink -Value $_.DatabaseOptions.AutoShrink
					$FileGroup = $_.FileGroups[0].Files[0]
					if ($FileGroup.Growth -ne $Null -and $FileGroup.Growth -gt 0) {
						$DB | Add-Member -MemberType NoteProperty -Name AutoGrow -Value $true
						[string] $g = "{0} {1}" -f $FileGroup.Growth,$FileGroup.GrowthType
						$DB | Add-Member -MemberType NoteProperty -Name AutoGrowSetting -Value $g
					} else {
						$DB | Add-Member -MemberType NoteProperty -Name AutoGrow -Value $false
						$DB | Add-Member -MemberType NoteProperty -Name AutoGrowSetting -Value ""
					}
				}

                # Calculate the checksum at this point
                [string]$Checksum = Get-Checksum -Object $DB

                # Add in the extra fields for non-checksum items 
                $DB | Add-Member -MemberType NoteProperty -Name Size -Value $_.Size
                $DB | Add-Member -MemberType NoteProperty -Name Status -Value $_.Status
                $DB | Add-Member -MemberType NoteProperty -Name State -Value $_.State
                $DB | Add-Member -MemberType NoteProperty -Name SpaceAvailable -Value $_.SpaceAvailable
                $DB | Add-Member -MemberType NoteProperty -Name ActiveConnections -Value $_.ActiveConnections
                $DB | Add-Member -MemberType NoteProperty -Name DataSpaceUsage -Value $_.DataSpaceUsage
                $DB | Add-Member -MemberType NoteProperty -Name IndexSpaceUsage -Value $_.IndexSpaceUsage
                
                # Add in the Checksum
                $DB | Add-Member -MemberType NoteProperty -Name Checksum -Value $Checksum
                
                Write-Output $DB
            }
        }
    }
}

<#
    .SYNOPSIS
        Get-SQLUsers

    .DESCRIPTION
        Returns objects representing the users within a specific instance

    .NOTES
        Dependencies: Feed Get-SQLInstanceInformation output into this cmdlet.
#>
function Get-SQLUsers {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$True,ValueFromPipeline=$True,ValueFromPipelineByPropertyName=$True)]
        $Instance
    )

    PROCESS {
        foreach ($i in $Instance) {
            $s = New-Object('Microsoft.SqlServer.Management.Smo.Server') $i.ServerInstance
			$dblist = $s.Databases
			
			foreach($db in $dblist) {
				foreach ($dbuser in $db.Users) {
					$User = New-Object PSObject

					$User | Add-Member -MemberType NoteProperty -Name ID -Value $dbuser.ID
					$User | Add-Member -MemberType NoteProperty -Name Name -Value $dbuser.Name
					$User | Add-Member -MemberType NoteProperty -Name ServerInstance -Value $i.ServerInstance
					$User | Add-Member -MemberType NoteProperty -Name DatabaseGuid -Value $db.DatabaseGuid
					$User | Add-Member -MemberType NoteProperty -Name DatabaseName -Value $db.Name
					$User | Add-Member -MemberType NoteProperty -Name CreateDate -Value $dbuser.CreateDate
					$User | Add-Member -MemberType NoteProperty -Name DateLastModified -Value $dbuser.DateLastModified
					$User | Add-Member -MemberType NoteProperty -Name HasDBAccess -Value (gnd -Default $false -Object $dbuser.HasDBAccess)
					$User | Add-Member -MemberType NoteProperty -Name IsSystemObject -Value (gnd -Default $false -Object $dbuser.IsSystemObject)
					$User | Add-Member -MemberType NoteProperty -Name LoginType -Value (gnd -Default $false -Object $dbuser.LoginType)

					$sUser = ($s.Logins | Where-Object { $_.Name -eq $dbuser.Name })
					$User | Add-Member -MemberType NoteProperty -Name IsDisabled -Value (gnd -Default $false -Object $sUser.IsDisabled)
					$User | Add-Member -MemberType NoteProperty -Name IsLocked -Value (gnd -Default $false -Object $sUser.IsLocked)
					$User | Add-Member -MemberType NoteProperty -Name IsPasswordExpired -Value (gnd -Default $false -Object $sUser.IsPasswordExpired)
					$User | Add-Member -MemberType NoteProperty -Name Language -Value (gnd -Default $false -Object $sUser.Language)
					$User | Add-Member -MemberType NoteProperty -Name MustChangePassword -Value (gnd -Default $false -Object $sUser.MustChangePassword)
					$User | Add-Member -MemberType NoteProperty -Name PasswordExpirationEnabled -Value (gnd -Default $false -Object $sUser.PasswordExpirationEnabled)
					$User | Add-Member -MemberType NoteProperty -Name PasswordHashAlgorithm -Value $sUser.PasswordHashAlgorithm
					$User | Add-Member -MemberType NoteProperty -Name PasswordPolicyEnforced -Value (gnd -Default $false -Object $sUser.PasswordPolicyEnforced)
					$User | Add-Member -MemberType NoteProperty -Name WindowsLoginAccessType -Value $sUser.WindowsLoginAccessType

					# Calculate the checksum at this point
					[string]$Checksum = Get-Checksum -Object $User

					# Add in the Checksum
					$User | Add-Member -MemberType NoteProperty -Name Checksum -Value $Checksum

					Write-Output $User
				}
			}
        }
    }
}
