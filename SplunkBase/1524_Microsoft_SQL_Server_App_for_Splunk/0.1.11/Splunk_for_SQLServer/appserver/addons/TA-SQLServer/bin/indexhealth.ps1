Import-Module "$SplunkHome\etc\apps\TA-SQLServer\bin\Common.psm1"
Import-Module "$SplunkHome\etc\apps\TA-SQLServer\bin\SQL.psm1"


<#
    .SYNOPSIS
        Get-MissingIndexStats
    
    .DESCRIPTION
        Retrieves objects that describe columns you could index
        for better performance.
        
    .NOTES
        Dependencies: None
        
    .LINK
        http://technet.microsoft.com/en-us/magazine/jj128029.aspx
#>
function Get-MissingIndexStats {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$True,ValueFromPipeline=$True,ValueFromPipelineByPropertyName=$True)]
        $SqlConnection
    )

    PROCESS {
        $Sql = "SELECT
                    mig.index_handle AS p1,mig.index_group_handle AS p2,
                    DB_NAME(mid.database_id) AS [DatabaseName],mid.[statement] AS [Table],
                    mid.equality_columns,mid.inequality_columns,mid.included_columns,
                    migs.unique_compiles,migs.user_seeks,migs.last_user_seek,
                    migs.avg_total_user_cost,migs.avg_user_impact
                FROM sys.dm_db_missing_index_group_stats AS migs WITH ( NOLOCK )
                INNER JOIN sys.dm_db_missing_index_groups AS mig WITH ( NOLOCK )
                    ON migs.group_handle = mig.index_group_handle
                INNER JOIN sys.dm_db_missing_index_details AS mid WITH ( NOLOCK )
                    ON mig.index_handle = mid.index_handle"

        $State = Import-LocalStorage "MissingIndex.xml" -DefaultValue (New-Object PSObject -Property @{ I = @{} })

        $DataSet = ($SqlConnection | Invoke-SQLQuery -SourceType "MSSQL:Index:MissingStats" -Query $Sql)
        foreach ($obj in $DataSet) {
            $id = "{0}.{1}.{2}" -f $obj.ServerInstance, $obj.p1, $obj.p2
            $user_seeks = [int64]$($obj.user_seeks)
            $emit = $false
            if (-not $State.I.ContainsKey($id)) {
                $emit = $true
            } else {
                $state_seeks = [int64]$($State.I.Get_Item($id))
                if ($state_seeks -lt $user_seeks) {
                    $obj.user_seeks = $($user_seeks - $state_seeks)
                }
                $emit = $true
            }
            if ($emit -eq $true) {
                $State.I.Set_Item($id,$user_seeks)
                $obj | Select SplunkSourceType,ServerInstance,DatabaseName,Table,`
                                equality_columns,inequality_columns,included_columns,`
                                unique_compiles,user_seeks,last_user_seek,avg_total_user_cost,avg_user_impact
            }
        }

        $State | Export-LocalStorage "MissingIndex.xml"
    }
}

<#
    .SYNOPSIS
        Get-IndexUsageStats
    
    .DESCRIPTION
        Retrieves objects that describe index usage
        
    .NOTES
        Dependencies: None
        
    .LINK
        http://technet.microsoft.com/en-us/magazine/jj128029.aspx
#>
function Get-IndexUsageStats {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$True,ValueFromPipeline=$True,ValueFromPipelineByPropertyName=$True)]
        $SqlConnection
    )

    PROCESS {
        $Sql = "SELECT 
                    DB_NAME(s.database_id) AS [DatabaseName],
                    OBJECT_NAME(s.[object_id]) AS [ObjectName], 
                    i.name AS [IndexName],i.index_id, 
                    user_seeks + user_scans + user_lookups AS [Reads],
                    user_updates AS [Writes],
                    i.type_desc AS [IndexType],
                    i.fill_factor AS [FillFactor]
                FROM sys.dm_db_index_usage_stats AS s 
                INNER JOIN sys.indexes AS i ON s.[object_id] = i.[object_id]
                WHERE i.index_id = s.index_id AND i.index_id != 0"
                        
        $State = Import-LocalStorage "IndexUsage.xml" -DefaultValue (New-Object PSObject -Property @{ I = @{} })

        $DataSet = ($SqlConnection | Invoke-SQLQuery -SourceType "MSSQL:Index:Stats" -Query $Sql)
        foreach ($index in $DataSet) {
            
            $index_id = "{0}.{1}.{2}" -f $index.ServerInstance,$index.DatabaseName, $index.index_id
            $reads = $index.Reads
            $writes = $index.Writes
            if (-not $State.I.ContainsKey($index_id)) {
                $S = New-Object PSObject -Property @{ Reads = $reads; Writes = $writes }
                $State.I.Set_Item($index_id, $S)
                Write-Output $index
            } else {
                $S = $State.I.Get_Item($index_id)
                
                if ($reads -lt $S.Reads) {
                    $index.Reads = $reads - $S.Reads
                }
                if ($writes -lt $S.Writes) {
                    $index.Writes = $writes - $S.Writes
                }
                
                $S.Reads = $reads
                $S.Writes = $writes
                $State.I.Set_Item($index_id, $S)
                Write-Output $index
            }
        }
        $State | Export-LocalStorage "IndexUsage.xml"
    }
}

$SqlConnections = (Get-SQLInstanceInformation | Where-Object { $_.ServiceState -eq "Running" } | Open-SQLConnection)
$SqlConnections | Get-MissingIndexStats
$SqlConnections | Get-IndexUsageStats
$SqlConnections | Close-SQLConnection


