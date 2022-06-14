[System.Reflection.Assembly]::LoadWithPartialName('Microsoft.Data') | Out-Null

<#
    .SYNOPSIS
        Get-SQLInstanceInformation | Open-SQLConnection

    .DESCRIPTION
        Opens an SQL Connection to the specified (list of) SQL instances
#>
function Open-SQLConnection {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$True,ValueFromPipeline=$True,ValueFromPipelineByPropertyName=$True)]
        $Instance
    )

    PROCESS {
        foreach ($i in $Instance) {
            $SqlServerSpec = "Server={0};Database=master;Integrated Security=sspi" -f $i.ServerInstance
            $SqlConnection = New-Object("System.Data.SqlClient.SqlConnection") $SqlServerSpec
            $SqlConnection.Open()
            Write-Output $SqlConnection
        }
    }
}

<#
    .SYNOPSIS
        $sqlconns = (Get-SQLInstanceInformation | Open-SQLConnection)
        $sqlconns | Close-SQLConnection

    .DESCRIPTION
        Closes a (list of) SQL Connections
#>
function Close-SQLConnection {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$True,ValueFromPipeline=$True,ValueFromPipelineByPropertyName=$True)]
        $SqlConnection
    )

    PROCESS {
        foreach ($sql in $SqlConnection) {
            $sql.Close();
        }
    }
}

<#
    .SYNOPSIS
        $sqlconns = (Get-SQLInstanceInformation | Open-SQLConnection)
        $results = ($sqlconns | Invoke-SQLQuery -Query $sql)
        $sqlconns | Close-SQLConnection

    .DESCRIPTION
        Executes the same SQL query on a bunch of instances, returning 
        the results, tagged with the Server Instance that it was executed
        on.
#>
function Invoke-SQLQuery
{
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$True,ValueFromPipeline=$True,ValueFromPipelineByPropertyName=$True)]
        $SqlConnection,

        [Parameter(Mandatory=$True)]
        $Query,

        [Parameter()]
        $SourceType = "SQL:Query"
    )

    PROCESS {
        foreach ($sql in $SqlConnection) {
            $SqlQuery = $SqlConnection.CreateCommand()
            $SqlQuery.CommandText = $Query
            $Adapter = New-Object("System.Data.SqlClient.SqlDataAdapter") $SqlQuery
            $DataSet = New-Object("System.Data.DataSet")
            $Adapter.Fill($DataSet) | Out-Null
            $DataTable = $DataSet.Tables[0]

            foreach ($DataRow in $DataTable) {
                $Object = New-Object PSObject -Property @{ ServerInstance=$sql.DataSource; SplunkSourceType=$SourceType }
                foreach ($Element in $($DataRow | Get-Member | Where-Object { $_.MemberType -eq "Property" })) {
                    $Object | Add-Member -MemberType NoteProperty -Name $Element.Name -Value $($DataRow[$Element.Name])
                }
                Write-Output $Object
            }
        }
    }
}