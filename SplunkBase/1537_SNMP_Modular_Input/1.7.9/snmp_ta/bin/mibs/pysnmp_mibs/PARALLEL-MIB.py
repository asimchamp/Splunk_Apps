# PySNMP SMI module. Autogenerated from smidump -f python PARALLEL-MIB
# by libsmi2pysnmp-0.1.3 at Mon Apr  2 20:39:25 2012,
# Python version sys.version_info(major=2, minor=7, micro=2, releaselevel='final', serial=0)

# Imports

( Integer, ObjectIdentifier, OctetString, ) = mibBuilder.importSymbols("ASN1", "Integer", "ObjectIdentifier", "OctetString")
( NamedValues, ) = mibBuilder.importSymbols("ASN1-ENUMERATION", "NamedValues")
( ConstraintsIntersection, ConstraintsUnion, SingleValueConstraint, ValueRangeConstraint, ValueSizeConstraint, ) = mibBuilder.importSymbols("ASN1-REFINEMENT", "ConstraintsIntersection", "ConstraintsUnion", "SingleValueConstraint", "ValueRangeConstraint", "ValueSizeConstraint")
( InterfaceIndex, ) = mibBuilder.importSymbols("IF-MIB", "InterfaceIndex")
( ModuleCompliance, ObjectGroup, ) = mibBuilder.importSymbols("SNMPv2-CONF", "ModuleCompliance", "ObjectGroup")
( Bits, Counter32, Integer32, Integer32, ModuleIdentity, MibIdentifier, NotificationType, MibScalar, MibTable, MibTableRow, MibTableColumn, TimeTicks, transmission, ) = mibBuilder.importSymbols("SNMPv2-SMI", "Bits", "Counter32", "Integer32", "Integer32", "ModuleIdentity", "MibIdentifier", "NotificationType", "MibScalar", "MibTable", "MibTableRow", "MibTableColumn", "TimeTicks", "transmission")

# Objects

para = ModuleIdentity((1, 3, 6, 1, 2, 1, 10, 34)).setRevisions(("1994-05-26 17:00",))
if mibBuilder.loadTexts: para.setOrganization("IETF Character MIB Working Group")
if mibBuilder.loadTexts: para.setContactInfo("        Bob Stewart\nPostal: Xyplex, Inc.\n        295 Foster Street\n        Littleton, MA 01460\n\n   Tel: 508-952-4816\n   Fax: 508-952-4887\nE-mail: rlstewart@eng.xyplex.com")
if mibBuilder.loadTexts: para.setDescription("The MIB module for Parallel-printer-like hardware devices.")
paraNumber = MibScalar((1, 3, 6, 1, 2, 1, 10, 34, 1), Integer32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraNumber.setDescription("The number of ports (regardless of their current\nstate) in the Parallel-printer-like port table.")
paraPortTable = MibTable((1, 3, 6, 1, 2, 1, 10, 34, 2))
if mibBuilder.loadTexts: paraPortTable.setDescription("A list of port entries.  The number of entries is\ngiven by the value of paraNumber.")
paraPortEntry = MibTableRow((1, 3, 6, 1, 2, 1, 10, 34, 2, 1)).setIndexNames((0, "PARALLEL-MIB", "paraPortIndex"))
if mibBuilder.loadTexts: paraPortEntry.setDescription("Status and parameter values for a port.")
paraPortIndex = MibTableColumn((1, 3, 6, 1, 2, 1, 10, 34, 2, 1, 1), InterfaceIndex()).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraPortIndex.setDescription("The value of ifIndex for the port.  By convention\nand if possible, hardware port numbers map directly\nto external connectors.  The value for each port must\nremain constant at least from one re-initialization\nof the network management agent to the next.")
paraPortType = MibTableColumn((1, 3, 6, 1, 2, 1, 10, 34, 2, 1, 2), Integer().subtype(subtypeSpec=SingleValueConstraint(3,1,2,)).subtype(namedValues=NamedValues(("other", 1), ("centronics", 2), ("dataproducts", 3), ))).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraPortType.setDescription("The port's hardware type.")
paraPortInSigNumber = MibTableColumn((1, 3, 6, 1, 2, 1, 10, 34, 2, 1, 3), Integer32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraPortInSigNumber.setDescription("The number of input signals for the port in the\ninput signal table (paraPortInSigTable).  The table\ncontains entries only for those signals the software\ncan detect and that are useful to observe.")
paraPortOutSigNumber = MibTableColumn((1, 3, 6, 1, 2, 1, 10, 34, 2, 1, 4), Integer32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraPortOutSigNumber.setDescription("The number of output signals for the port in the\noutput signal table (paraPortOutSigTable).  The\ntable contains entries only for those signals the\nsoftware can assert and that are useful to observe.")
paraInSigTable = MibTable((1, 3, 6, 1, 2, 1, 10, 34, 3))
if mibBuilder.loadTexts: paraInSigTable.setDescription("A list of port input control signal entries.")
paraInSigEntry = MibTableRow((1, 3, 6, 1, 2, 1, 10, 34, 3, 1)).setIndexNames((0, "PARALLEL-MIB", "paraInSigPortIndex"), (0, "PARALLEL-MIB", "paraInSigName"))
if mibBuilder.loadTexts: paraInSigEntry.setDescription("Input control signal status for a hardware port.")
paraInSigPortIndex = MibTableColumn((1, 3, 6, 1, 2, 1, 10, 34, 3, 1, 1), InterfaceIndex()).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraInSigPortIndex.setDescription("The value of paraPortIndex for the port to which\nthis entry belongs.")
paraInSigName = MibTableColumn((1, 3, 6, 1, 2, 1, 10, 34, 3, 1, 2), Integer().subtype(subtypeSpec=SingleValueConstraint(3,1,5,4,2,)).subtype(namedValues=NamedValues(("power", 1), ("online", 2), ("busy", 3), ("paperout", 4), ("fault", 5), ))).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraInSigName.setDescription("Identification of a hardware signal.")
paraInSigState = MibTableColumn((1, 3, 6, 1, 2, 1, 10, 34, 3, 1, 3), Integer().subtype(subtypeSpec=SingleValueConstraint(2,1,3,)).subtype(namedValues=NamedValues(("none", 1), ("on", 2), ("off", 3), ))).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraInSigState.setDescription("The current signal state.")
paraInSigChanges = MibTableColumn((1, 3, 6, 1, 2, 1, 10, 34, 3, 1, 4), Counter32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraInSigChanges.setDescription("The number of times the signal has changed from\n'on' to 'off' or from 'off' to 'on'.")
paraOutSigTable = MibTable((1, 3, 6, 1, 2, 1, 10, 34, 4))
if mibBuilder.loadTexts: paraOutSigTable.setDescription("A list of port output control signal entries.")
paraOutSigEntry = MibTableRow((1, 3, 6, 1, 2, 1, 10, 34, 4, 1)).setIndexNames((0, "PARALLEL-MIB", "paraOutSigPortIndex"), (0, "PARALLEL-MIB", "paraOutSigName"))
if mibBuilder.loadTexts: paraOutSigEntry.setDescription("Output control signal status for a hardware port.")
paraOutSigPortIndex = MibTableColumn((1, 3, 6, 1, 2, 1, 10, 34, 4, 1, 1), InterfaceIndex()).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraOutSigPortIndex.setDescription("The value of paraPortIndex for the port to which\nthis entry belongs.")
paraOutSigName = MibTableColumn((1, 3, 6, 1, 2, 1, 10, 34, 4, 1, 2), Integer().subtype(subtypeSpec=SingleValueConstraint(3,1,5,4,2,)).subtype(namedValues=NamedValues(("power", 1), ("online", 2), ("busy", 3), ("paperout", 4), ("fault", 5), ))).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraOutSigName.setDescription("Identification of a hardware signal.")
paraOutSigState = MibTableColumn((1, 3, 6, 1, 2, 1, 10, 34, 4, 1, 3), Integer().subtype(subtypeSpec=SingleValueConstraint(2,1,3,)).subtype(namedValues=NamedValues(("none", 1), ("on", 2), ("off", 3), ))).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraOutSigState.setDescription("The current signal state.")
paraOutSigChanges = MibTableColumn((1, 3, 6, 1, 2, 1, 10, 34, 4, 1, 4), Counter32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: paraOutSigChanges.setDescription("The number of times the signal has changed from\n'on' to 'off' or from 'off' to 'on'.")
paraConformance = MibIdentifier((1, 3, 6, 1, 2, 1, 10, 34, 5))
paraGroups = MibIdentifier((1, 3, 6, 1, 2, 1, 10, 34, 5, 1))
paraCompliances = MibIdentifier((1, 3, 6, 1, 2, 1, 10, 34, 5, 2))

# Augmentions

# Groups

paraGroup = ObjectGroup((1, 3, 6, 1, 2, 1, 10, 34, 5, 1, 1)).setObjects(*(("PARALLEL-MIB", "paraNumber"), ("PARALLEL-MIB", "paraOutSigChanges"), ("PARALLEL-MIB", "paraInSigState"), ("PARALLEL-MIB", "paraInSigName"), ("PARALLEL-MIB", "paraPortType"), ("PARALLEL-MIB", "paraPortIndex"), ("PARALLEL-MIB", "paraInSigChanges"), ("PARALLEL-MIB", "paraOutSigState"), ("PARALLEL-MIB", "paraPortInSigNumber"), ("PARALLEL-MIB", "paraInSigPortIndex"), ("PARALLEL-MIB", "paraOutSigName"), ("PARALLEL-MIB", "paraPortOutSigNumber"), ("PARALLEL-MIB", "paraOutSigPortIndex"), ) )
if mibBuilder.loadTexts: paraGroup.setDescription("A collection of objects providing information\napplicable to all Parallel-printer-like interfaces.")

# Compliances

paraCompliance = ModuleCompliance((1, 3, 6, 1, 2, 1, 10, 34, 5, 2, 1)).setObjects(*(("PARALLEL-MIB", "paraGroup"), ) )
if mibBuilder.loadTexts: paraCompliance.setDescription("The compliance statement for SNMPv2 entities\nwhich have Parallel-printer-like hardware\ninterfaces.")

# Exports

# Module identity
mibBuilder.exportSymbols("PARALLEL-MIB", PYSNMP_MODULE_ID=para)

# Objects
mibBuilder.exportSymbols("PARALLEL-MIB", para=para, paraNumber=paraNumber, paraPortTable=paraPortTable, paraPortEntry=paraPortEntry, paraPortIndex=paraPortIndex, paraPortType=paraPortType, paraPortInSigNumber=paraPortInSigNumber, paraPortOutSigNumber=paraPortOutSigNumber, paraInSigTable=paraInSigTable, paraInSigEntry=paraInSigEntry, paraInSigPortIndex=paraInSigPortIndex, paraInSigName=paraInSigName, paraInSigState=paraInSigState, paraInSigChanges=paraInSigChanges, paraOutSigTable=paraOutSigTable, paraOutSigEntry=paraOutSigEntry, paraOutSigPortIndex=paraOutSigPortIndex, paraOutSigName=paraOutSigName, paraOutSigState=paraOutSigState, paraOutSigChanges=paraOutSigChanges, paraConformance=paraConformance, paraGroups=paraGroups, paraCompliances=paraCompliances)

# Groups
mibBuilder.exportSymbols("PARALLEL-MIB", paraGroup=paraGroup)

# Compliances
mibBuilder.exportSymbols("PARALLEL-MIB", paraCompliance=paraCompliance)
