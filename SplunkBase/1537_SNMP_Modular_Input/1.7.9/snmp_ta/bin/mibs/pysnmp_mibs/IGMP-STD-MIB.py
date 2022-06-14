# PySNMP SMI module. Autogenerated from smidump -f python IGMP-STD-MIB
# by libsmi2pysnmp-0.1.3 at Mon Apr  2 20:39:09 2012,
# Python version sys.version_info(major=2, minor=7, micro=2, releaselevel='final', serial=0)

# Imports

( Integer, ObjectIdentifier, OctetString, ) = mibBuilder.importSymbols("ASN1", "Integer", "ObjectIdentifier", "OctetString")
( NamedValues, ) = mibBuilder.importSymbols("ASN1-ENUMERATION", "NamedValues")
( ConstraintsIntersection, ConstraintsUnion, SingleValueConstraint, ValueRangeConstraint, ValueSizeConstraint, ) = mibBuilder.importSymbols("ASN1-REFINEMENT", "ConstraintsIntersection", "ConstraintsUnion", "SingleValueConstraint", "ValueRangeConstraint", "ValueSizeConstraint")
( InterfaceIndex, InterfaceIndexOrZero, ) = mibBuilder.importSymbols("IF-MIB", "InterfaceIndex", "InterfaceIndexOrZero")
( ModuleCompliance, ObjectGroup, ) = mibBuilder.importSymbols("SNMPv2-CONF", "ModuleCompliance", "ObjectGroup")
( Bits, Counter32, Gauge32, Integer32, IpAddress, ModuleIdentity, MibIdentifier, MibScalar, MibTable, MibTableRow, MibTableColumn, TimeTicks, TimeTicks, Unsigned32, mib_2, ) = mibBuilder.importSymbols("SNMPv2-SMI", "Bits", "Counter32", "Gauge32", "Integer32", "IpAddress", "ModuleIdentity", "MibIdentifier", "MibScalar", "MibTable", "MibTableRow", "MibTableColumn", "TimeTicks", "TimeTicks", "Unsigned32", "mib-2")
( RowStatus, TruthValue, ) = mibBuilder.importSymbols("SNMPv2-TC", "RowStatus", "TruthValue")

# Objects

igmpStdMIB = ModuleIdentity((1, 3, 6, 1, 2, 1, 85)).setRevisions(("2000-09-28 00:00",))
if mibBuilder.loadTexts: igmpStdMIB.setOrganization("IETF IDMR Working Group.")
if mibBuilder.loadTexts: igmpStdMIB.setContactInfo(" Dave Thaler\nMicrosoft Corporation\nOne Microsoft Way\nRedmond, WA  98052-6399\nUS\n\nPhone: +1 425 703 8835\nEMail: dthaler@microsoft.com")
if mibBuilder.loadTexts: igmpStdMIB.setDescription("The MIB module for IGMP Management.")
igmpMIBObjects = MibIdentifier((1, 3, 6, 1, 2, 1, 85, 1))
igmpInterfaceTable = MibTable((1, 3, 6, 1, 2, 1, 85, 1, 1))
if mibBuilder.loadTexts: igmpInterfaceTable.setDescription("The (conceptual) table listing the interfaces on which IGMP\nis enabled.")
igmpInterfaceEntry = MibTableRow((1, 3, 6, 1, 2, 1, 85, 1, 1, 1)).setIndexNames((0, "IGMP-STD-MIB", "igmpInterfaceIfIndex"))
if mibBuilder.loadTexts: igmpInterfaceEntry.setDescription("An entry (conceptual row) representing an interface on\nwhich IGMP is enabled.")
igmpInterfaceIfIndex = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 1), InterfaceIndex()).setMaxAccess("noaccess")
if mibBuilder.loadTexts: igmpInterfaceIfIndex.setDescription("The ifIndex value of the interface for which IGMP is\nenabled.")
igmpInterfaceQueryInterval = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 2), Unsigned32().clone(125)).setMaxAccess("readcreate")
if mibBuilder.loadTexts: igmpInterfaceQueryInterval.setDescription("The frequency at which IGMP Host-Query packets are\ntransmitted on this interface.")
igmpInterfaceStatus = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 3), RowStatus()).setMaxAccess("readcreate")
if mibBuilder.loadTexts: igmpInterfaceStatus.setDescription("The activation of a row enables IGMP on the interface.  The\ndestruction of a row disables IGMP on the interface.")
igmpInterfaceVersion = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 4), Unsigned32().clone(2)).setMaxAccess("readcreate")
if mibBuilder.loadTexts: igmpInterfaceVersion.setDescription("The version of IGMP which is running on this interface.\nThis object can be used to configure a router capable of\nrunning either value.  For IGMP to function correctly, all\nrouters on a LAN must be configured to run the same version\nof IGMP on that LAN.")
igmpInterfaceQuerier = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 5), IpAddress()).setMaxAccess("readonly")
if mibBuilder.loadTexts: igmpInterfaceQuerier.setDescription("The address of the IGMP Querier on the IP subnet to which\n\n\nthis interface is attached.")
igmpInterfaceQueryMaxResponseTime = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 6), Unsigned32().subtype(subtypeSpec=ValueRangeConstraint(0, 255)).clone(100)).setMaxAccess("readcreate")
if mibBuilder.loadTexts: igmpInterfaceQueryMaxResponseTime.setDescription("The maximum query response time advertised in IGMPv2\nqueries on this interface.")
igmpInterfaceQuerierUpTime = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 7), TimeTicks()).setMaxAccess("readonly")
if mibBuilder.loadTexts: igmpInterfaceQuerierUpTime.setDescription("The time since igmpInterfaceQuerier was last changed.")
igmpInterfaceQuerierExpiryTime = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 8), TimeTicks()).setMaxAccess("readonly")
if mibBuilder.loadTexts: igmpInterfaceQuerierExpiryTime.setDescription("The amount of time remaining before the Other Querier\nPresent Timer expires.  If the local system is the querier,\nthe value of this object is zero.")
igmpInterfaceVersion1QuerierTimer = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 9), TimeTicks()).setMaxAccess("readonly")
if mibBuilder.loadTexts: igmpInterfaceVersion1QuerierTimer.setDescription("The time remaining until the host assumes that there are no\nIGMPv1 routers present on the interface.  While this is non-\nzero, the host will reply to all queries with version 1\nmembership reports.")
igmpInterfaceWrongVersionQueries = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 10), Counter32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: igmpInterfaceWrongVersionQueries.setDescription("The number of queries received whose IGMP version does not\nmatch igmpInterfaceVersion, over the lifetime of the row\nentry.  IGMP requires that all routers on a LAN be\nconfigured to run the same version of IGMP.  Thus, if any\nqueries are received with the wrong version, this indicates\na configuration error.")
igmpInterfaceJoins = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 11), Counter32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: igmpInterfaceJoins.setDescription("The number of times a group membership has been added on\nthis interface; that is, the number of times an entry for\nthis interface has been added to the Cache Table.  This\nobject gives an indication of the amount of IGMP activity\nover the lifetime of the row entry.")
igmpInterfaceProxyIfIndex = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 12), InterfaceIndexOrZero().clone('0')).setMaxAccess("readcreate")
if mibBuilder.loadTexts: igmpInterfaceProxyIfIndex.setDescription("Some devices implement a form of IGMP proxying whereby\nmemberships learned on the interface represented by this\nrow, cause IGMP Host Membership Reports to be sent on the\ninterface whose ifIndex value is given by this object.  Such\na device would implement the igmpV2RouterMIBGroup only on\nits router interfaces (those interfaces with non-zero\nigmpInterfaceProxyIfIndex).  Typically, the value of this\nobject is 0, indicating that no proxying is being done.")
igmpInterfaceGroups = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 13), Gauge32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: igmpInterfaceGroups.setDescription("The current number of entries for this interface in the\nCache Table.")
igmpInterfaceRobustness = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 14), Unsigned32().subtype(subtypeSpec=ValueRangeConstraint(1, 255)).clone(2)).setMaxAccess("readcreate")
if mibBuilder.loadTexts: igmpInterfaceRobustness.setDescription("The Robustness Variable allows tuning for the expected\npacket loss on a subnet.  If a subnet is expected to be\nlossy, the Robustness Variable may be increased.  IGMP is\nrobust to (Robustness Variable-1) packet losses.")
igmpInterfaceLastMembQueryIntvl = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 1, 1, 15), Unsigned32().subtype(subtypeSpec=ValueRangeConstraint(0, 255)).clone(10)).setMaxAccess("readcreate")
if mibBuilder.loadTexts: igmpInterfaceLastMembQueryIntvl.setDescription("The Last Member Query Interval is the Max Response Time\ninserted into Group-Specific Queries sent in response to\nLeave Group messages, and is also the amount of time between\nGroup-Specific Query messages.  This value may be tuned to\nmodify the leave latency of the network.  A reduced value\nresults in reduced time to detect the loss of the last\nmember of a group.  The value of this object is irrelevant\nif igmpInterfaceVersion is 1.")
igmpCacheTable = MibTable((1, 3, 6, 1, 2, 1, 85, 1, 2))
if mibBuilder.loadTexts: igmpCacheTable.setDescription("The (conceptual) table listing the IP multicast groups for\nwhich there are members on a particular interface.")
igmpCacheEntry = MibTableRow((1, 3, 6, 1, 2, 1, 85, 1, 2, 1)).setIndexNames((0, "IGMP-STD-MIB", "igmpCacheAddress"), (0, "IGMP-STD-MIB", "igmpCacheIfIndex"))
if mibBuilder.loadTexts: igmpCacheEntry.setDescription("An entry (conceptual row) in the igmpCacheTable.")
igmpCacheAddress = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 2, 1, 1), IpAddress()).setMaxAccess("noaccess")
if mibBuilder.loadTexts: igmpCacheAddress.setDescription("The IP multicast group address for which this entry\ncontains information.")
igmpCacheIfIndex = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 2, 1, 2), InterfaceIndex()).setMaxAccess("noaccess")
if mibBuilder.loadTexts: igmpCacheIfIndex.setDescription("The interface for which this entry contains information for\nan IP multicast group address.")
igmpCacheSelf = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 2, 1, 3), TruthValue().clone('true')).setMaxAccess("readcreate")
if mibBuilder.loadTexts: igmpCacheSelf.setDescription("An indication of whether the local system is a member of\nthis group address on this interface.")
igmpCacheLastReporter = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 2, 1, 4), IpAddress()).setMaxAccess("readonly")
if mibBuilder.loadTexts: igmpCacheLastReporter.setDescription("The IP address of the source of the last membership report\nreceived for this IP Multicast group address on this\ninterface.  If no membership report has been received, this\nobject has the value 0.0.0.0.")
igmpCacheUpTime = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 2, 1, 5), TimeTicks()).setMaxAccess("readonly")
if mibBuilder.loadTexts: igmpCacheUpTime.setDescription("The time elapsed since this entry was created.")
igmpCacheExpiryTime = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 2, 1, 6), TimeTicks()).setMaxAccess("readonly")
if mibBuilder.loadTexts: igmpCacheExpiryTime.setDescription("The minimum amount of time remaining before this entry will\nbe aged out.  A value of 0 indicates that the entry is only\npresent because igmpCacheSelf is true and that if the router\nleft the group, this entry would be aged out immediately.\nNote that some implementations may process membership\nreports from the local system in the same way as reports\nfrom other hosts, so a value of 0 is not required.")
igmpCacheStatus = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 2, 1, 7), RowStatus()).setMaxAccess("readcreate")
if mibBuilder.loadTexts: igmpCacheStatus.setDescription("The status of this entry.")
igmpCacheVersion1HostTimer = MibTableColumn((1, 3, 6, 1, 2, 1, 85, 1, 2, 1, 8), TimeTicks()).setMaxAccess("readonly")
if mibBuilder.loadTexts: igmpCacheVersion1HostTimer.setDescription("The time remaining until the local router will assume that\nthere are no longer any IGMP version 1 members on the IP\nsubnet attached to this interface.  Upon hearing any IGMPv1\nMembership Report, this value is reset to the group\nmembership timer.  While this time remaining is non-zero,\nthe local router ignores any IGMPv2 Leave messages for this\ngroup that it receives on this interface.")
igmpMIBConformance = MibIdentifier((1, 3, 6, 1, 2, 1, 85, 2))
igmpMIBCompliances = MibIdentifier((1, 3, 6, 1, 2, 1, 85, 2, 1))
igmpMIBGroups = MibIdentifier((1, 3, 6, 1, 2, 1, 85, 2, 2))

# Augmentions

# Groups

igmpBaseMIBGroup = ObjectGroup((1, 3, 6, 1, 2, 1, 85, 2, 2, 1)).setObjects(*(("IGMP-STD-MIB", "igmpInterfaceStatus"), ("IGMP-STD-MIB", "igmpCacheSelf"), ("IGMP-STD-MIB", "igmpCacheStatus"), ) )
if mibBuilder.loadTexts: igmpBaseMIBGroup.setDescription("The basic collection of objects providing management of\nIGMP version 1 or 2.")
igmpRouterMIBGroup = ObjectGroup((1, 3, 6, 1, 2, 1, 85, 2, 2, 2)).setObjects(*(("IGMP-STD-MIB", "igmpInterfaceQuerierExpiryTime"), ("IGMP-STD-MIB", "igmpCacheExpiryTime"), ("IGMP-STD-MIB", "igmpInterfaceQuerierUpTime"), ("IGMP-STD-MIB", "igmpCacheLastReporter"), ("IGMP-STD-MIB", "igmpInterfaceQueryInterval"), ("IGMP-STD-MIB", "igmpCacheUpTime"), ("IGMP-STD-MIB", "igmpInterfaceJoins"), ("IGMP-STD-MIB", "igmpInterfaceGroups"), ) )
if mibBuilder.loadTexts: igmpRouterMIBGroup.setDescription("A collection of additional objects for management of IGMP\nversion 1 or 2 in routers.")
igmpV2HostMIBGroup = ObjectGroup((1, 3, 6, 1, 2, 1, 85, 2, 2, 3)).setObjects(*(("IGMP-STD-MIB", "igmpInterfaceVersion1QuerierTimer"), ) )
if mibBuilder.loadTexts: igmpV2HostMIBGroup.setDescription("A collection of additional objects for management of IGMP\nversion 2 in hosts.")
igmpHostOptMIBGroup = ObjectGroup((1, 3, 6, 1, 2, 1, 85, 2, 2, 4)).setObjects(*(("IGMP-STD-MIB", "igmpInterfaceQuerier"), ("IGMP-STD-MIB", "igmpCacheLastReporter"), ) )
if mibBuilder.loadTexts: igmpHostOptMIBGroup.setDescription("A collection of optional objects for IGMP hosts.\nSupporting this group can be especially useful in an\nenvironment with a router which does not support the IGMP\nMIB.")
igmpV2RouterMIBGroup = ObjectGroup((1, 3, 6, 1, 2, 1, 85, 2, 2, 5)).setObjects(*(("IGMP-STD-MIB", "igmpInterfaceLastMembQueryIntvl"), ("IGMP-STD-MIB", "igmpInterfaceQueryMaxResponseTime"), ("IGMP-STD-MIB", "igmpCacheVersion1HostTimer"), ("IGMP-STD-MIB", "igmpInterfaceWrongVersionQueries"), ("IGMP-STD-MIB", "igmpInterfaceQuerier"), ("IGMP-STD-MIB", "igmpInterfaceVersion"), ("IGMP-STD-MIB", "igmpInterfaceRobustness"), ) )
if mibBuilder.loadTexts: igmpV2RouterMIBGroup.setDescription("A collection of additional objects for management of IGMP\nversion 2 in routers.")
igmpV2ProxyMIBGroup = ObjectGroup((1, 3, 6, 1, 2, 1, 85, 2, 2, 6)).setObjects(*(("IGMP-STD-MIB", "igmpInterfaceProxyIfIndex"), ) )
if mibBuilder.loadTexts: igmpV2ProxyMIBGroup.setDescription("A collection of additional objects for management of IGMP\nproxy devices.")

# Compliances

igmpV1HostMIBCompliance = ModuleCompliance((1, 3, 6, 1, 2, 1, 85, 2, 1, 1)).setObjects(*(("IGMP-STD-MIB", "igmpBaseMIBGroup"), ) )
if mibBuilder.loadTexts: igmpV1HostMIBCompliance.setDescription("The compliance statement for hosts running IGMPv1 and\nimplementing the IGMP MIB.")
igmpV1RouterMIBCompliance = ModuleCompliance((1, 3, 6, 1, 2, 1, 85, 2, 1, 2)).setObjects(*(("IGMP-STD-MIB", "igmpRouterMIBGroup"), ("IGMP-STD-MIB", "igmpBaseMIBGroup"), ) )
if mibBuilder.loadTexts: igmpV1RouterMIBCompliance.setDescription("The compliance statement for routers running IGMPv1 and\nimplementing the IGMP MIB.")
igmpV2HostMIBCompliance = ModuleCompliance((1, 3, 6, 1, 2, 1, 85, 2, 1, 3)).setObjects(*(("IGMP-STD-MIB", "igmpBaseMIBGroup"), ("IGMP-STD-MIB", "igmpV2HostMIBGroup"), ) )
if mibBuilder.loadTexts: igmpV2HostMIBCompliance.setDescription("The compliance statement for hosts running IGMPv2 and\nimplementing the IGMP MIB.")
igmpV2RouterMIBCompliance = ModuleCompliance((1, 3, 6, 1, 2, 1, 85, 2, 1, 4)).setObjects(*(("IGMP-STD-MIB", "igmpV2RouterMIBGroup"), ("IGMP-STD-MIB", "igmpRouterMIBGroup"), ("IGMP-STD-MIB", "igmpBaseMIBGroup"), ) )
if mibBuilder.loadTexts: igmpV2RouterMIBCompliance.setDescription("The compliance statement for routers running IGMPv2 and\nimplementing the IGMP MIB.")

# Exports

# Module identity
mibBuilder.exportSymbols("IGMP-STD-MIB", PYSNMP_MODULE_ID=igmpStdMIB)

# Objects
mibBuilder.exportSymbols("IGMP-STD-MIB", igmpStdMIB=igmpStdMIB, igmpMIBObjects=igmpMIBObjects, igmpInterfaceTable=igmpInterfaceTable, igmpInterfaceEntry=igmpInterfaceEntry, igmpInterfaceIfIndex=igmpInterfaceIfIndex, igmpInterfaceQueryInterval=igmpInterfaceQueryInterval, igmpInterfaceStatus=igmpInterfaceStatus, igmpInterfaceVersion=igmpInterfaceVersion, igmpInterfaceQuerier=igmpInterfaceQuerier, igmpInterfaceQueryMaxResponseTime=igmpInterfaceQueryMaxResponseTime, igmpInterfaceQuerierUpTime=igmpInterfaceQuerierUpTime, igmpInterfaceQuerierExpiryTime=igmpInterfaceQuerierExpiryTime, igmpInterfaceVersion1QuerierTimer=igmpInterfaceVersion1QuerierTimer, igmpInterfaceWrongVersionQueries=igmpInterfaceWrongVersionQueries, igmpInterfaceJoins=igmpInterfaceJoins, igmpInterfaceProxyIfIndex=igmpInterfaceProxyIfIndex, igmpInterfaceGroups=igmpInterfaceGroups, igmpInterfaceRobustness=igmpInterfaceRobustness, igmpInterfaceLastMembQueryIntvl=igmpInterfaceLastMembQueryIntvl, igmpCacheTable=igmpCacheTable, igmpCacheEntry=igmpCacheEntry, igmpCacheAddress=igmpCacheAddress, igmpCacheIfIndex=igmpCacheIfIndex, igmpCacheSelf=igmpCacheSelf, igmpCacheLastReporter=igmpCacheLastReporter, igmpCacheUpTime=igmpCacheUpTime, igmpCacheExpiryTime=igmpCacheExpiryTime, igmpCacheStatus=igmpCacheStatus, igmpCacheVersion1HostTimer=igmpCacheVersion1HostTimer, igmpMIBConformance=igmpMIBConformance, igmpMIBCompliances=igmpMIBCompliances, igmpMIBGroups=igmpMIBGroups)

# Groups
mibBuilder.exportSymbols("IGMP-STD-MIB", igmpBaseMIBGroup=igmpBaseMIBGroup, igmpRouterMIBGroup=igmpRouterMIBGroup, igmpV2HostMIBGroup=igmpV2HostMIBGroup, igmpHostOptMIBGroup=igmpHostOptMIBGroup, igmpV2RouterMIBGroup=igmpV2RouterMIBGroup, igmpV2ProxyMIBGroup=igmpV2ProxyMIBGroup)

# Compliances
mibBuilder.exportSymbols("IGMP-STD-MIB", igmpV1HostMIBCompliance=igmpV1HostMIBCompliance, igmpV1RouterMIBCompliance=igmpV1RouterMIBCompliance, igmpV2HostMIBCompliance=igmpV2HostMIBCompliance, igmpV2RouterMIBCompliance=igmpV2RouterMIBCompliance)
