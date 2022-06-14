#
# PySNMP MIB module PAN-GLOBAL-REG (http://snmplabs.com/pysmi)
# ASN.1 source file:///Users/damien/BaboonBones/splunk_installs/splunk/etc/apps/snmp_ta/bin/mibs/user_plaintext_mibs/PAN-GLOBAL-REG.txt
# Produced by pysmi-0.3.4 at Sat Feb  6 07:01:47 2021
# On host Damiens-MacBook-Pro.local platform Darwin version 18.2.0 by user damien
# Using Python version 3.7.8 (default, Nov 24 2020, 12:36:40) 
#
Integer, ObjectIdentifier, OctetString = mibBuilder.importSymbols("ASN1", "Integer", "ObjectIdentifier", "OctetString")
NamedValues, = mibBuilder.importSymbols("ASN1-ENUMERATION", "NamedValues")
ConstraintsIntersection, ValueSizeConstraint, ValueRangeConstraint, SingleValueConstraint, ConstraintsUnion = mibBuilder.importSymbols("ASN1-REFINEMENT", "ConstraintsIntersection", "ValueSizeConstraint", "ValueRangeConstraint", "SingleValueConstraint", "ConstraintsUnion")
NotificationGroup, ModuleCompliance = mibBuilder.importSymbols("SNMPv2-CONF", "NotificationGroup", "ModuleCompliance")
NotificationType, Unsigned32, MibIdentifier, Integer32, TimeTicks, IpAddress, Bits, iso, Counter32, MibScalar, MibTable, MibTableRow, MibTableColumn, ObjectIdentity, ModuleIdentity, Counter64, Gauge32, enterprises = mibBuilder.importSymbols("SNMPv2-SMI", "NotificationType", "Unsigned32", "MibIdentifier", "Integer32", "TimeTicks", "IpAddress", "Bits", "iso", "Counter32", "MibScalar", "MibTable", "MibTableRow", "MibTableColumn", "ObjectIdentity", "ModuleIdentity", "Counter64", "Gauge32", "enterprises")
DisplayString, TextualConvention = mibBuilder.importSymbols("SNMPv2-TC", "DisplayString", "TextualConvention")
panGlobalRegModule = ModuleIdentity((1, 3, 6, 1, 4, 1, 25461, 1, 1, 1))
panGlobalRegModule.setRevisions(('2011-02-09 16:10',))
if mibBuilder.loadTexts: panGlobalRegModule.setLastUpdated('201106271040Z')
if mibBuilder.loadTexts: panGlobalRegModule.setOrganization('Palo Alto Networks')
panRoot = ObjectIdentity((1, 3, 6, 1, 4, 1, 25461))
if mibBuilder.loadTexts: panRoot.setStatus('current')
panReg = ObjectIdentity((1, 3, 6, 1, 4, 1, 25461, 1))
if mibBuilder.loadTexts: panReg.setStatus('current')
panModules = ObjectIdentity((1, 3, 6, 1, 4, 1, 25461, 1, 1))
if mibBuilder.loadTexts: panModules.setStatus('current')
panMibs = ObjectIdentity((1, 3, 6, 1, 4, 1, 25461, 2))
if mibBuilder.loadTexts: panMibs.setStatus('current')
panCommonMib = ObjectIdentity((1, 3, 6, 1, 4, 1, 25461, 2, 1))
if mibBuilder.loadTexts: panCommonMib.setStatus('current')
panSpecificMib = ObjectIdentity((1, 3, 6, 1, 4, 1, 25461, 2, 2))
if mibBuilder.loadTexts: panSpecificMib.setStatus('current')
panProductsMibs = ObjectIdentity((1, 3, 6, 1, 4, 1, 25461, 2, 3))
if mibBuilder.loadTexts: panProductsMibs.setStatus('current')
mibBuilder.exportSymbols("PAN-GLOBAL-REG", panReg=panReg, panSpecificMib=panSpecificMib, panRoot=panRoot, panProductsMibs=panProductsMibs, panCommonMib=panCommonMib, panGlobalRegModule=panGlobalRegModule, PYSNMP_MODULE_ID=panGlobalRegModule, panModules=panModules, panMibs=panMibs)
