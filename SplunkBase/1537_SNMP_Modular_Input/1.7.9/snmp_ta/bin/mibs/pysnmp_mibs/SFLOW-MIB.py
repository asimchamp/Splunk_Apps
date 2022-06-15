# PySNMP SMI module. Autogenerated from smidump -f python SFLOW-MIB
# by libsmi2pysnmp-0.1.3 at Mon Apr  2 20:39:37 2012,
# Python version sys.version_info(major=2, minor=7, micro=2, releaselevel='final', serial=0)

# Imports

( Integer, ObjectIdentifier, OctetString, ) = mibBuilder.importSymbols("ASN1", "Integer", "ObjectIdentifier", "OctetString")
( NamedValues, ) = mibBuilder.importSymbols("ASN1-ENUMERATION", "NamedValues")
( ConstraintsIntersection, ConstraintsUnion, SingleValueConstraint, ValueRangeConstraint, ValueSizeConstraint, ) = mibBuilder.importSymbols("ASN1-REFINEMENT", "ConstraintsIntersection", "ConstraintsUnion", "SingleValueConstraint", "ValueRangeConstraint", "ValueSizeConstraint")
( InetAddress, InetAddressType, ) = mibBuilder.importSymbols("INET-ADDRESS-MIB", "InetAddress", "InetAddressType")
( OwnerString, ) = mibBuilder.importSymbols("RMON-MIB", "OwnerString")
( SnmpAdminString, ) = mibBuilder.importSymbols("SNMP-FRAMEWORK-MIB", "SnmpAdminString")
( ModuleCompliance, ObjectGroup, ) = mibBuilder.importSymbols("SNMPv2-CONF", "ModuleCompliance", "ObjectGroup")
( Bits, Integer32, Integer32, ModuleIdentity, MibIdentifier, MibScalar, MibTable, MibTableRow, MibTableColumn, TimeTicks, enterprises, ) = mibBuilder.importSymbols("SNMPv2-SMI", "Bits", "Integer32", "Integer32", "ModuleIdentity", "MibIdentifier", "MibScalar", "MibTable", "MibTableRow", "MibTableColumn", "TimeTicks", "enterprises")

# Objects

sFlowMIB = ModuleIdentity((1, 3, 6, 1, 4, 1, 4300, 1)).setRevisions(("2001-05-15 00:00","2001-05-01 00:00",))
if mibBuilder.loadTexts: sFlowMIB.setOrganization("InMon Corp.")
if mibBuilder.loadTexts: sFlowMIB.setContactInfo("Peter Phaal\nInMon Corp.\nhttp://www.inmon.com/\n\nTel:  +1-415-661-6343\nEmail: peter_phaal@inmon.com")
if mibBuilder.loadTexts: sFlowMIB.setDescription("The MIB module for managing the generation and transportation\nof sFlow data records.")
sFlowAgent = MibIdentifier((1, 3, 6, 1, 4, 1, 4300, 1, 1))
sFlowVersion = MibScalar((1, 3, 6, 1, 4, 1, 4300, 1, 1, 1), SnmpAdminString().clone('1.2;;')).setMaxAccess("readonly")
if mibBuilder.loadTexts: sFlowVersion.setDescription("Uniquely identifies the version and implementation of this MIB.\nThe version string must have the following structure:\n   <MIB Version>;<Organization>;<Software Revision>\nwhere:\n   <MIB Version>  must be '1.2', the version of this MIB.\n   <Organization> the name of the organization responsible\n                    for the agent implementation.\n   <Revision>     the specific software build of this agent.\n\nAs an example, the string '1.2;InMon Corp.;2.1.1' indicates\nthat this agent implements version '1.2' of the SFLOW MIB, that\nit was developed by 'InMon Corp.' and that the software build\nis '2.1.1'.\n\nThe MIB Version will change with each revision of the SFLOW\n\n\n\nMIB.\n\nManagement entities must check the MIB Version and not attempt\nto manage agents with MIB Versions greater than that for which\nthey were designed.\n\nNote: The sFlow Datagram Format has an independent version\n      number which may change independently from <MIB Version>.\n      <MIB Version> applies to the structure and semantics of\n      the SFLOW MIB only.")
sFlowAgentAddressType = MibScalar((1, 3, 6, 1, 4, 1, 4300, 1, 1, 2), InetAddressType()).setMaxAccess("readonly")
if mibBuilder.loadTexts: sFlowAgentAddressType.setDescription("The address type of the address associated with this agent.\nOnly ipv4 and ipv6 types are supported.")
sFlowAgentAddress = MibScalar((1, 3, 6, 1, 4, 1, 4300, 1, 1, 3), InetAddress()).setMaxAccess("readonly")
if mibBuilder.loadTexts: sFlowAgentAddress.setDescription("The IP address associated with this agent.  In the case of a\nmulti-homed agent, this should be the loopback address of the\nagent.  The sFlowAgent address must provide SNMP connectivity\nto the agent.  The address should be an invariant that does not\nchange as interfaces are reconfigured, enabled, disabled,\nadded or removed.  A manager should be able to use the\nsFlowAgentAddress as a unique key that will identify this\nagent over extended periods of time so that a history can\nbe maintained.")
sFlowTable = MibTable((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4))
if mibBuilder.loadTexts: sFlowTable.setDescription("A table of the sFlow samplers within a device.")
sFlowEntry = MibTableRow((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4, 1)).setIndexNames((0, "SFLOW-MIB", "sFlowDataSource"))
if mibBuilder.loadTexts: sFlowEntry.setDescription("Attributes of an sFlow sampler.")
sFlowDataSource = MibTableColumn((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4, 1, 1), ObjectIdentifier()).setMaxAccess("readonly")
if mibBuilder.loadTexts: sFlowDataSource.setDescription("Identifies the source of the data for the sFlow sampler.\nThe following data source types are currently defined:\n\n- ifIndex.<I>\nDataSources of this traditional form are called 'port-based'.\nIdeally the sampling entity will perform sampling on all flows\noriginating from or destined to the specified interface.\nHowever, if the switch architecture only permits input or\noutput sampling then the sampling agent is permitted to only\nsample input flows input or output flows.  Each packet must\nonly be considered once for sampling, irrespective of the\nnumber of ports it will be forwarded to.\n\nNote: Port 0 is used to indicate that all ports on the device\n      are represented by a single data source.\n      - sFlowPacketSamplingRate applies to all ports on the\n        device capable of packet sampling.\n      - sFlowCounterSamplingInterval applies to all ports.\n\n- smonVlanDataSource.<V>\nA dataSource of this form refers to a 'Packet-based VLAN'\nand is called a 'VLAN-based' dataSource.  <V> is the VLAN\n\n\n\nID as defined by the IEEE 802.1Q standard.  The\nvalue is between 1 and 4094 inclusive, and it represents\nan 802.1Q VLAN-ID with global scope within a given\nbridged domain.\nSampling is performed on all packets received that are part\nof the specified VLAN (no matter which port they arrived on).\nEach packet will only be considered once for sampling,\nirrespective of the number of ports it will be forwarded to.\n\n- entPhysicalEntry.<N>\nA dataSource of this form refers to a physical entity within\nthe agent (e.g., entPhysicalClass = backplane(4)) and is called\nan 'entity-based' dataSource.\nSampling is performed on all packets entering the resource (e.g.\nIf the backplane is being sampled, all packets transmitted onto\nthe backplane will be considered as single candidates for\nsampling irrespective of the number of ports they ultimately\nreach).\n\nNote: Since each DataSource operates independently, a packet\n      that crosses multiple DataSources may generate multiple\n      flow records.")
sFlowOwner = MibTableColumn((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4, 1, 2), OwnerString().clone('')).setMaxAccess("readwrite")
if mibBuilder.loadTexts: sFlowOwner.setDescription("The entity making use of this sFlow sampler.  The empty string\nindicates that the sFlow sampler is currently unclaimed.\nAn entity wishing to claim an sFlow sampler must make sure\nthat the sampler is unclaimed before trying to claim it.\nThe sampler is claimed by setting the owner string to identify\nthe entity claiming the sampler.  The sampler must be claimed\nbefore any changes can be made to other sampler objects.\n\nIn order to avoid a race condition, the entity taking control\nof the sampler must set both the owner and a value for\nsFlowTimeout in the same SNMP set request.\n\nWhen a management entity is finished using the sampler,\nit should set its value back to unclaimed.  The agent\nmust restore all other entities this row to their\ndefault values when the owner is set to unclaimed.\n\nThis mechanism provides no enforcement and relies on the\ncooperation of management entities in order to ensure that\n\n\n\ncompetition for a sampler is fairly resolved.")
sFlowTimeout = MibTableColumn((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4, 1, 3), Integer32().clone(0)).setMaxAccess("readwrite")
if mibBuilder.loadTexts: sFlowTimeout.setDescription("The time (in seconds) remaining before the sampler is released\nand stops sampling.  When set, the owner establishes control\nfor the specified period.  When read, the remaining time in the\ninterval is returned.\n\nA management entity wanting to maintain control of the sampler\nis responsible for setting a new value before the old one\nexpires.\n\nWhen the interval expires, the agent is responsible for\nrestoring all other entities in this row to their default\nvalues.")
sFlowPacketSamplingRate = MibTableColumn((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4, 1, 4), Integer32().clone(0)).setMaxAccess("readwrite")
if mibBuilder.loadTexts: sFlowPacketSamplingRate.setDescription("The statistical sampling rate for packet sampling from this\nsource.\n\nSet to N to sample 1/Nth of the packets in the monitored flows.\nAn agent should choose its own algorithm introduce variance\ninto the sampling so that exactly every Nth packet is not\ncounted.  A sampling rate of 1 counts all packets.  A sampling\nrate of 0 disables sampling.\n\nThe agent is permitted to have minimum and maximum allowable\nvalues for the sampling rate.  A minimum rate lets the agent\ndesigner set an upper bound on the overhead associated with\nsampling, and a maximum rate may be the result of hardware\nrestrictions (such as counter size).  In addition not all values\nbetween the maximum and minimum may be realizable as the\nsampling rate (again because of implementation considerations).\n\nWhen the sampling rate is set the agent is free to adjust the\nvalue so that it lies between the maximum and minimum values\n\n\n\nand has the closest achievable value.\n\nWhen read, the agent must return the actual sampling rate it\nwill be using (after the adjustments previously described).  The\nsampling algorithm must converge so that over time the number\nof packets sampled approaches 1/Nth of the total number of\npackets in the monitored flows.")
sFlowCounterSamplingInterval = MibTableColumn((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4, 1, 5), Integer32().clone(0)).setMaxAccess("readwrite")
if mibBuilder.loadTexts: sFlowCounterSamplingInterval.setDescription("The maximum number of seconds between successive samples of the\ncounters associated with this data source.  A sampling interval\nof 0 disables counter sampling.")
sFlowMaximumHeaderSize = MibTableColumn((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4, 1, 6), Integer32().clone(128)).setMaxAccess("readwrite")
if mibBuilder.loadTexts: sFlowMaximumHeaderSize.setDescription("The maximum number of bytes that should be copied from a\nsampled packet.  The agent may have an internal maximum and\nminimum permissible sizes.  If an attempt is made to set this\nvalue outside the permissible range then the agent should\nadjust the value to the closest permissible value.")
sFlowMaximumDatagramSize = MibTableColumn((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4, 1, 7), Integer32().clone(1400)).setMaxAccess("readwrite")
if mibBuilder.loadTexts: sFlowMaximumDatagramSize.setDescription("The maximum number of data bytes that can be sent in a single\nsample datagram.  The manager should set this value to avoid\nfragmentation of the sFlow datagrams.")
sFlowCollectorAddressType = MibTableColumn((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4, 1, 8), InetAddressType().clone('ipv4')).setMaxAccess("readwrite")
if mibBuilder.loadTexts: sFlowCollectorAddressType.setDescription("The type of sFlowCollectorAddress.")
sFlowCollectorAddress = MibTableColumn((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4, 1, 9), InetAddress().clone('0.0.0.0')).setMaxAccess("readwrite")
if mibBuilder.loadTexts: sFlowCollectorAddress.setDescription("The IP address of the sFlow collector.\nIf set to 0.0.0.0 all sampling is disabled.")
sFlowCollectorPort = MibTableColumn((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4, 1, 10), Integer32().clone(6343)).setMaxAccess("readwrite")
if mibBuilder.loadTexts: sFlowCollectorPort.setDescription("The destination port for sFlow datagrams.")
sFlowDatagramVersion = MibTableColumn((1, 3, 6, 1, 4, 1, 4300, 1, 1, 4, 1, 11), Integer32().clone(4)).setMaxAccess("readwrite")
if mibBuilder.loadTexts: sFlowDatagramVersion.setDescription("The version of sFlow datagrams that should be sent.\n\nWhen set to a value not support by the agent, the agent should\nadjust the value to the highest supported value less than the\nrequested value, or return an error if no such values exist.")
sFlowMIBConformance = MibIdentifier((1, 3, 6, 1, 4, 1, 4300, 1, 2))
sFlowMIBGroups = MibIdentifier((1, 3, 6, 1, 4, 1, 4300, 1, 2, 1))
sFlowMIBCompliances = MibIdentifier((1, 3, 6, 1, 4, 1, 4300, 1, 2, 2))

# Augmentions

# Groups

sFlowAgentGroup = ObjectGroup((1, 3, 6, 1, 4, 1, 4300, 1, 2, 1, 1)).setObjects(*(("SFLOW-MIB", "sFlowOwner"), ("SFLOW-MIB", "sFlowCollectorAddressType"), ("SFLOW-MIB", "sFlowDatagramVersion"), ("SFLOW-MIB", "sFlowMaximumHeaderSize"), ("SFLOW-MIB", "sFlowDataSource"), ("SFLOW-MIB", "sFlowMaximumDatagramSize"), ("SFLOW-MIB", "sFlowCollectorPort"), ("SFLOW-MIB", "sFlowCollectorAddress"), ("SFLOW-MIB", "sFlowTimeout"), ("SFLOW-MIB", "sFlowPacketSamplingRate"), ("SFLOW-MIB", "sFlowCounterSamplingInterval"), ("SFLOW-MIB", "sFlowAgentAddressType"), ("SFLOW-MIB", "sFlowVersion"), ("SFLOW-MIB", "sFlowAgentAddress"), ) )
if mibBuilder.loadTexts: sFlowAgentGroup.setDescription("A collection of objects for managing the generation and\ntransportation of sFlow data records.")

# Compliances

sFlowCompliance = ModuleCompliance((1, 3, 6, 1, 4, 1, 4300, 1, 2, 2, 1)).setObjects(*(("SFLOW-MIB", "sFlowAgentGroup"), ) )
if mibBuilder.loadTexts: sFlowCompliance.setDescription("Compliance statements for the sFlow Agent.")

# Exports

# Module identity
mibBuilder.exportSymbols("SFLOW-MIB", PYSNMP_MODULE_ID=sFlowMIB)

# Objects
mibBuilder.exportSymbols("SFLOW-MIB", sFlowMIB=sFlowMIB, sFlowAgent=sFlowAgent, sFlowVersion=sFlowVersion, sFlowAgentAddressType=sFlowAgentAddressType, sFlowAgentAddress=sFlowAgentAddress, sFlowTable=sFlowTable, sFlowEntry=sFlowEntry, sFlowDataSource=sFlowDataSource, sFlowOwner=sFlowOwner, sFlowTimeout=sFlowTimeout, sFlowPacketSamplingRate=sFlowPacketSamplingRate, sFlowCounterSamplingInterval=sFlowCounterSamplingInterval, sFlowMaximumHeaderSize=sFlowMaximumHeaderSize, sFlowMaximumDatagramSize=sFlowMaximumDatagramSize, sFlowCollectorAddressType=sFlowCollectorAddressType, sFlowCollectorAddress=sFlowCollectorAddress, sFlowCollectorPort=sFlowCollectorPort, sFlowDatagramVersion=sFlowDatagramVersion, sFlowMIBConformance=sFlowMIBConformance, sFlowMIBGroups=sFlowMIBGroups, sFlowMIBCompliances=sFlowMIBCompliances)

# Groups
mibBuilder.exportSymbols("SFLOW-MIB", sFlowAgentGroup=sFlowAgentGroup)

# Compliances
mibBuilder.exportSymbols("SFLOW-MIB", sFlowCompliance=sFlowCompliance)
