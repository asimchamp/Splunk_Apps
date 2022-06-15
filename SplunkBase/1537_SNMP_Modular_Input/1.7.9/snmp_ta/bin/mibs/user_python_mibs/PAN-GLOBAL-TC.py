#
# PySNMP MIB module PAN-GLOBAL-TC (http://snmplabs.com/pysmi)
# ASN.1 source file:///Users/damien/BaboonBones/splunk_installs/splunk/etc/apps/snmp_ta/bin/mibs/user_plaintext_mibs/PAN-GLOBAL-TC.txt
# Produced by pysmi-0.3.4 at Sat Feb  6 07:01:47 2021
# On host Damiens-MacBook-Pro.local platform Darwin version 18.2.0 by user damien
# Using Python version 3.7.8 (default, Nov 24 2020, 12:36:40) 
#
Integer, ObjectIdentifier, OctetString = mibBuilder.importSymbols("ASN1", "Integer", "ObjectIdentifier", "OctetString")
NamedValues, = mibBuilder.importSymbols("ASN1-ENUMERATION", "NamedValues")
ConstraintsIntersection, ValueSizeConstraint, ValueRangeConstraint, SingleValueConstraint, ConstraintsUnion = mibBuilder.importSymbols("ASN1-REFINEMENT", "ConstraintsIntersection", "ValueSizeConstraint", "ValueRangeConstraint", "SingleValueConstraint", "ConstraintsUnion")
panModules, = mibBuilder.importSymbols("PAN-GLOBAL-REG", "panModules")
NotificationGroup, ModuleCompliance = mibBuilder.importSymbols("SNMPv2-CONF", "NotificationGroup", "ModuleCompliance")
NotificationType, Unsigned32, MibIdentifier, Integer32, TimeTicks, IpAddress, Bits, iso, Counter32, MibScalar, MibTable, MibTableRow, MibTableColumn, Gauge32, ModuleIdentity, Counter64, ObjectIdentity = mibBuilder.importSymbols("SNMPv2-SMI", "NotificationType", "Unsigned32", "MibIdentifier", "Integer32", "TimeTicks", "IpAddress", "Bits", "iso", "Counter32", "MibScalar", "MibTable", "MibTableRow", "MibTableColumn", "Gauge32", "ModuleIdentity", "Counter64", "ObjectIdentity")
DisplayString, TextualConvention = mibBuilder.importSymbols("SNMPv2-TC", "DisplayString", "TextualConvention")
panGlobalTcModule = ModuleIdentity((1, 3, 6, 1, 4, 1, 25461, 1, 1, 2))
panGlobalTcModule.setRevisions(('2011-02-09 16:10',))
if mibBuilder.loadTexts: panGlobalTcModule.setLastUpdated('201106271040Z')
if mibBuilder.loadTexts: panGlobalTcModule.setOrganization('Palo Alto Networks')
class TcAppaname(TextualConvention, OctetString):
    status = 'current'
    displayHint = '64a'
    subtypeSpec = OctetString.subtypeSpec + ValueSizeConstraint(0, 64)

class TcChassisType(TextualConvention, OctetString):
    status = 'current'
    subtypeSpec = OctetString.subtypeSpec + ValueSizeConstraint(0, 64)

mibBuilder.exportSymbols("PAN-GLOBAL-TC", TcChassisType=TcChassisType, panGlobalTcModule=panGlobalTcModule, TcAppaname=TcAppaname, PYSNMP_MODULE_ID=panGlobalTcModule)
