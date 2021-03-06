#
# PySNMP MIB module SAFENET-HSM-MIB (http://snmplabs.com/pysmi)
# ASN.1 source file://./SAFENET-HSM-MIB.txt
# Produced by pysmi-0.3.4 at Sat May 29 02:31:25 2021
# On host localhost.localdomain platform Linux version 4.18.0-240.15.1.el8_3.x86_64 by user root
# Using Python version 3.8.3 (default, Aug 31 2020, 16:03:14) 
#
Integer, OctetString, ObjectIdentifier = mibBuilder.importSymbols("ASN1", "Integer", "OctetString", "ObjectIdentifier")
NamedValues, = mibBuilder.importSymbols("ASN1-ENUMERATION", "NamedValues")
ConstraintsIntersection, ValueSizeConstraint, ValueRangeConstraint, ConstraintsUnion, SingleValueConstraint = mibBuilder.importSymbols("ASN1-REFINEMENT", "ConstraintsIntersection", "ValueSizeConstraint", "ValueRangeConstraint", "ConstraintsUnion", "SingleValueConstraint")
luna, = mibBuilder.importSymbols("SAFENET-GLOBAL-MIB", "luna")
NotificationGroup, ModuleCompliance = mibBuilder.importSymbols("SNMPv2-CONF", "NotificationGroup", "ModuleCompliance")
ModuleIdentity, enterprises, Counter64, Gauge32, Unsigned32, iso, MibIdentifier, Bits, ObjectIdentity, TimeTicks, MibScalar, MibTable, MibTableRow, MibTableColumn, IpAddress, Counter32, NotificationType, Integer32 = mibBuilder.importSymbols("SNMPv2-SMI", "ModuleIdentity", "enterprises", "Counter64", "Gauge32", "Unsigned32", "iso", "MibIdentifier", "Bits", "ObjectIdentity", "TimeTicks", "MibScalar", "MibTable", "MibTableRow", "MibTableColumn", "IpAddress", "Counter32", "NotificationType", "Integer32")
TruthValue, DisplayString, TextualConvention = mibBuilder.importSymbols("SNMPv2-TC", "TruthValue", "DisplayString", "TextualConvention")
hardwareSecurityModules = ModuleIdentity((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1))
hardwareSecurityModules.setRevisions(('2014-07-17 12:00',))
if mibBuilder.loadTexts: hardwareSecurityModules.setLastUpdated('201407171200Z')
if mibBuilder.loadTexts: hardwareSecurityModules.setOrganization('www.safenet-inc.com')
hsmTable = MibTable((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2), )
if mibBuilder.loadTexts: hsmTable.setStatus('current')
hsmTableEntry = MibTableRow((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1), ).setIndexNames((0, "SAFENET-HSM-MIB", "hsmSerialNumber"))
if mibBuilder.loadTexts: hsmTableEntry.setStatus('current')
hsmSerialNumber = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 1), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmSerialNumber.setStatus('current')
hsmFirmwareVersion = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 2), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmFirmwareVersion.setStatus('current')
hsmLabel = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 3), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmLabel.setStatus('current')
hsmModel = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 4), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmModel.setStatus('current')
hsmAuthenticationMethod = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 5), Integer32().subtype(subtypeSpec=ConstraintsUnion(SingleValueConstraint(1, 2, 3))).clone(namedValues=NamedValues(("unknown", 1), ("password", 2), ("pedKeys", 3)))).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmAuthenticationMethod.setStatus('current')
hsmRpvInitialized = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 6), Integer32().subtype(subtypeSpec=ConstraintsUnion(SingleValueConstraint(1, 2, 3))).clone(namedValues=NamedValues(("notSupported", 1), ("uninitialized", 2), ("initialized", 3)))).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmRpvInitialized.setStatus('current')
hsmFipsMode = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 7), TruthValue()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmFipsMode.setStatus('current')
hsmPerformance = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 8), Integer32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPerformance.setStatus('current')
hsmStorageTotalBytes = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 9), Unsigned32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmStorageTotalBytes.setStatus('current')
hsmStorageAllocatedBytes = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 10), Unsigned32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmStorageAllocatedBytes.setStatus('current')
hsmStorageAvailableBytes = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 11), Unsigned32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmStorageAvailableBytes.setStatus('current')
hsmMaximumPartitions = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 12), Unsigned32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmMaximumPartitions.setStatus('current')
hsmPartitionsCreated = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 13), Unsigned32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionsCreated.setStatus('current')
hsmPartitionsFree = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 14), Unsigned32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionsFree.setStatus('current')
hsmBackupProtocol = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 15), Integer32().subtype(subtypeSpec=ConstraintsUnion(SingleValueConstraint(1, 2, 3, 4))).clone(namedValues=NamedValues(("unknown", 1), ("none", 2), ("cloning", 3), ("keyExport", 4)))).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmBackupProtocol.setStatus('current')
hsmAdminLoginAttempts = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 16), Counter32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmAdminLoginAttempts.setStatus('current')
hsmAuditRoleInitialized = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 17), Integer32().subtype(subtypeSpec=ConstraintsUnion(SingleValueConstraint(0, 1, 2))).clone(namedValues=NamedValues(("notSupported", 0), ("yes", 1), ("no", 2)))).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmAuditRoleInitialized.setStatus('current')
hsmManuallyZeroized = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 18), TruthValue()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmManuallyZeroized.setStatus('current')
hsmUpTime = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 19), Counter64()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmUpTime.setStatus('current')
hsmBusyTime = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 20), Counter64()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmBusyTime.setStatus('current')
hsmCommandCount = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 2, 1, 21), Counter64()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmCommandCount.setStatus('current')
hsmLicenseTable = MibTable((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 3), )
if mibBuilder.loadTexts: hsmLicenseTable.setStatus('current')
hsmLicenseTableEntry = MibTableRow((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 3, 1), ).setIndexNames((0, "SAFENET-HSM-MIB", "hsmSerialNumber"), (0, "SAFENET-HSM-MIB", "hsmLicenseID"))
if mibBuilder.loadTexts: hsmLicenseTableEntry.setStatus('current')
hsmLicenseID = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 3, 1, 1), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmLicenseID.setStatus('current')
hsmLicenseDescription = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 3, 1, 2), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmLicenseDescription.setStatus('current')
hsmPartitionTable = MibTable((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 4), )
if mibBuilder.loadTexts: hsmPartitionTable.setStatus('current')
hsmPartitionTableEntry = MibTableRow((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 4, 1), ).setIndexNames((0, "SAFENET-HSM-MIB", "hsmSerialNumber"), (0, "SAFENET-HSM-MIB", "hsmPartitionSerialNumber"))
if mibBuilder.loadTexts: hsmPartitionTableEntry.setStatus('current')
hsmPartitionSerialNumber = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 4, 1, 1), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionSerialNumber.setStatus('current')
hsmPartitionLabel = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 4, 1, 2), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionLabel.setStatus('current')
hsmPartitionActivated = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 4, 1, 3), TruthValue()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionActivated.setStatus('current')
hsmPartitionStorageTotalBytes = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 4, 1, 4), Unsigned32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionStorageTotalBytes.setStatus('current')
hsmPartitionStorageAllocatedBytes = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 4, 1, 5), Unsigned32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionStorageAllocatedBytes.setStatus('current')
hsmPartitionStorageAvailableBytes = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 4, 1, 6), Unsigned32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionStorageAvailableBytes.setStatus('current')
hsmPartitionObjectCount = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 4, 1, 7), Unsigned32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionObjectCount.setStatus('current')
hsmPolicyTable = MibTable((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 5), )
if mibBuilder.loadTexts: hsmPolicyTable.setStatus('current')
hsmPolicyTableEntry = MibTableRow((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 5, 1), ).setIndexNames((0, "SAFENET-HSM-MIB", "hsmSerialNumber"), (0, "SAFENET-HSM-MIB", "hsmPolicyType"), (0, "SAFENET-HSM-MIB", "hsmPolicyID"))
if mibBuilder.loadTexts: hsmPolicyTableEntry.setStatus('current')
hsmPolicyType = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 5, 1, 1), Integer32().subtype(subtypeSpec=ConstraintsUnion(SingleValueConstraint(1, 2))).clone(namedValues=NamedValues(("capability", 1), ("policy", 2)))).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPolicyType.setStatus('current')
hsmPolicyID = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 5, 1, 2), Unsigned32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPolicyID.setStatus('current')
hsmPolicyDescription = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 5, 1, 3), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPolicyDescription.setStatus('current')
hsmPolicyValue = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 5, 1, 4), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPolicyValue.setStatus('current')
hsmPartitionPolicyTable = MibTable((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 6), )
if mibBuilder.loadTexts: hsmPartitionPolicyTable.setStatus('current')
hsmPartitionPolicyTableEntry = MibTableRow((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 6, 1), ).setIndexNames((0, "SAFENET-HSM-MIB", "hsmSerialNumber"), (0, "SAFENET-HSM-MIB", "hsmPartitionSerialNumber"), (0, "SAFENET-HSM-MIB", "hsmPartitionPolicyType"), (0, "SAFENET-HSM-MIB", "hsmPartitionPolicyID"))
if mibBuilder.loadTexts: hsmPartitionPolicyTableEntry.setStatus('current')
hsmPartitionPolicyType = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 6, 1, 1), Integer32().subtype(subtypeSpec=ConstraintsUnion(SingleValueConstraint(1, 2))).clone(namedValues=NamedValues(("capability", 1), ("policy", 2)))).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionPolicyType.setStatus('current')
hsmPartitionPolicyID = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 6, 1, 2), Unsigned32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionPolicyID.setStatus('current')
hsmPartitionPolicyDescription = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 6, 1, 3), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionPolicyDescription.setStatus('current')
hsmPartitionPolicyValue = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 6, 1, 4), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmPartitionPolicyValue.setStatus('current')
hsmClientRegistrationTable = MibTable((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 7), )
if mibBuilder.loadTexts: hsmClientRegistrationTable.setStatus('current')
hsmClientRegistrationTableEntry = MibTableRow((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 7, 1), ).setIndexNames((0, "SAFENET-HSM-MIB", "hsmClientName"))
if mibBuilder.loadTexts: hsmClientRegistrationTableEntry.setStatus('current')
hsmClientName = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 7, 1, 1), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmClientName.setStatus('current')
hsmClientAddress = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 7, 1, 2), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmClientAddress.setStatus('current')
hsmClientRequiresHTL = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 7, 1, 3), TruthValue()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmClientRequiresHTL.setStatus('current')
hsmClientOTTExpiry = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 7, 1, 4), Integer32()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmClientOTTExpiry.setStatus('current')
hsmClientPartitionAssignmentTable = MibTable((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 8), )
if mibBuilder.loadTexts: hsmClientPartitionAssignmentTable.setStatus('current')
hsmClientPartitionAssignmentTableEntry = MibTableRow((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 8, 1), ).setIndexNames((0, "SAFENET-HSM-MIB", "hsmClientName"), (0, "SAFENET-HSM-MIB", "hsmSerialNumber"), (0, "SAFENET-HSM-MIB", "hsmPartitionSerialNumber"))
if mibBuilder.loadTexts: hsmClientPartitionAssignmentTableEntry.setStatus('current')
hsmClientHsmSerialNumber = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 8, 1, 1), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmClientHsmSerialNumber.setStatus('current')
hsmClientPartitionSerialNumber = MibTableColumn((1, 3, 6, 1, 4, 1, 23629, 1, 5, 1, 8, 1, 2), DisplayString()).setMaxAccess("readonly")
if mibBuilder.loadTexts: hsmClientPartitionSerialNumber.setStatus('current')
mibBuilder.exportSymbols("SAFENET-HSM-MIB", hsmPartitionLabel=hsmPartitionLabel, hsmRpvInitialized=hsmRpvInitialized, hsmPartitionStorageAvailableBytes=hsmPartitionStorageAvailableBytes, hsmPartitionObjectCount=hsmPartitionObjectCount, hsmPolicyDescription=hsmPolicyDescription, hsmPartitionPolicyTable=hsmPartitionPolicyTable, hsmMaximumPartitions=hsmMaximumPartitions, hsmPolicyID=hsmPolicyID, hsmClientPartitionAssignmentTable=hsmClientPartitionAssignmentTable, hsmAuditRoleInitialized=hsmAuditRoleInitialized, hsmFipsMode=hsmFipsMode, hsmStorageAllocatedBytes=hsmStorageAllocatedBytes, hsmUpTime=hsmUpTime, hsmPartitionPolicyTableEntry=hsmPartitionPolicyTableEntry, hsmPartitionTable=hsmPartitionTable, hsmLicenseDescription=hsmLicenseDescription, hsmBusyTime=hsmBusyTime, hsmPartitionPolicyDescription=hsmPartitionPolicyDescription, hsmClientAddress=hsmClientAddress, hsmPolicyTableEntry=hsmPolicyTableEntry, hardwareSecurityModules=hardwareSecurityModules, hsmBackupProtocol=hsmBackupProtocol, hsmModel=hsmModel, PYSNMP_MODULE_ID=hardwareSecurityModules, hsmPartitionActivated=hsmPartitionActivated, hsmClientHsmSerialNumber=hsmClientHsmSerialNumber, hsmLicenseTable=hsmLicenseTable, hsmPartitionTableEntry=hsmPartitionTableEntry, hsmFirmwareVersion=hsmFirmwareVersion, hsmClientName=hsmClientName, hsmClientOTTExpiry=hsmClientOTTExpiry, hsmStorageAvailableBytes=hsmStorageAvailableBytes, hsmPartitionsCreated=hsmPartitionsCreated, hsmPartitionStorageAllocatedBytes=hsmPartitionStorageAllocatedBytes, hsmAuthenticationMethod=hsmAuthenticationMethod, hsmPerformance=hsmPerformance, hsmTable=hsmTable, hsmPartitionStorageTotalBytes=hsmPartitionStorageTotalBytes, hsmLabel=hsmLabel, hsmPolicyType=hsmPolicyType, hsmClientRegistrationTableEntry=hsmClientRegistrationTableEntry, hsmPartitionSerialNumber=hsmPartitionSerialNumber, hsmClientPartitionAssignmentTableEntry=hsmClientPartitionAssignmentTableEntry, hsmClientRequiresHTL=hsmClientRequiresHTL, hsmStorageTotalBytes=hsmStorageTotalBytes, hsmClientPartitionSerialNumber=hsmClientPartitionSerialNumber, hsmManuallyZeroized=hsmManuallyZeroized, hsmPolicyTable=hsmPolicyTable, hsmPartitionsFree=hsmPartitionsFree, hsmCommandCount=hsmCommandCount, hsmPolicyValue=hsmPolicyValue, hsmPartitionPolicyID=hsmPartitionPolicyID, hsmClientRegistrationTable=hsmClientRegistrationTable, hsmLicenseID=hsmLicenseID, hsmPartitionPolicyType=hsmPartitionPolicyType, hsmAdminLoginAttempts=hsmAdminLoginAttempts, hsmLicenseTableEntry=hsmLicenseTableEntry, hsmPartitionPolicyValue=hsmPartitionPolicyValue, hsmSerialNumber=hsmSerialNumber, hsmTableEntry=hsmTableEntry)
