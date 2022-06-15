# PySNMP SMI module. Autogenerated from smidump -f python ENTITY-STATE-TC-MIB
# by libsmi2pysnmp-0.1.3 at Mon Apr  2 20:38:57 2012,
# Python version sys.version_info(major=2, minor=7, micro=2, releaselevel='final', serial=0)

# Imports

( Integer, ObjectIdentifier, OctetString, ) = mibBuilder.importSymbols("ASN1", "Integer", "ObjectIdentifier", "OctetString")
( NamedValues, ) = mibBuilder.importSymbols("ASN1-ENUMERATION", "NamedValues")
( ConstraintsIntersection, ConstraintsUnion, SingleValueConstraint, ValueRangeConstraint, ValueSizeConstraint, ) = mibBuilder.importSymbols("ASN1-REFINEMENT", "ConstraintsIntersection", "ConstraintsUnion", "SingleValueConstraint", "ValueRangeConstraint", "ValueSizeConstraint")
( Bits, Integer32, ModuleIdentity, MibIdentifier, TimeTicks, mib_2, ) = mibBuilder.importSymbols("SNMPv2-SMI", "Bits", "Integer32", "ModuleIdentity", "MibIdentifier", "TimeTicks", "mib-2")
( TextualConvention, ) = mibBuilder.importSymbols("SNMPv2-TC", "TextualConvention")

# Types

class EntityAdminState(Integer):
    subtypeSpec = Integer.subtypeSpec+SingleValueConstraint(2,4,1,3,)
    namedValues = NamedValues(("unknown", 1), ("locked", 2), ("shuttingDown", 3), ("unlocked", 4), )
    
class EntityAlarmStatus(Bits):
    namedValues = NamedValues(("unknown", 0), ("underRepair", 1), ("critical", 2), ("major", 3), ("minor", 4), ("warning", 5), ("indeterminate", 6), )
    
class EntityOperState(Integer):
    subtypeSpec = Integer.subtypeSpec+SingleValueConstraint(1,4,3,2,)
    namedValues = NamedValues(("unknown", 1), ("disabled", 2), ("enabled", 3), ("testing", 4), )
    
class EntityStandbyStatus(Integer):
    subtypeSpec = Integer.subtypeSpec+SingleValueConstraint(1,4,3,2,)
    namedValues = NamedValues(("unknown", 1), ("hotStandby", 2), ("coldStandby", 3), ("providingService", 4), )
    
class EntityUsageState(Integer):
    subtypeSpec = Integer.subtypeSpec+SingleValueConstraint(4,1,2,3,)
    namedValues = NamedValues(("unknown", 1), ("idle", 2), ("active", 3), ("busy", 4), )
    

# Objects

entityStateTc = ModuleIdentity((1, 3, 6, 1, 2, 1, 130)).setRevisions(("2005-11-22 00:00",))
if mibBuilder.loadTexts: entityStateTc.setOrganization("IETF Entity MIB Working Group")
if mibBuilder.loadTexts: entityStateTc.setContactInfo("General Discussion: entmib@ietf.org\nTo Subscribe:\nhttp://www.ietf.org/mailman/listinfo/entmib\n\nhttp://www.ietf.org/html.charters/entmib-charter.html\n\nSharon Chisholm\nNortel Networks\nPO Box 3511 Station C\nOttawa, Ont.  K1Y 4H7\nCanada\nschishol@nortel.com\n\nDavid T. Perkins\n548 Qualbrook Ct\nSan Jose, CA 95110\nUSA\nPhone: 408 394-8702\ndperkins@snmpinfo.com")
if mibBuilder.loadTexts: entityStateTc.setDescription("This MIB defines state textual conventions.\n\nCopyright (C) The Internet Society 2005.  This version\nof this MIB module is part of RFC 4268;  see the RFC\nitself for full legal notices.")

# Augmentions

# Exports

# Module identity
mibBuilder.exportSymbols("ENTITY-STATE-TC-MIB", PYSNMP_MODULE_ID=entityStateTc)

# Types
mibBuilder.exportSymbols("ENTITY-STATE-TC-MIB", EntityAdminState=EntityAdminState, EntityAlarmStatus=EntityAlarmStatus, EntityOperState=EntityOperState, EntityStandbyStatus=EntityStandbyStatus, EntityUsageState=EntityUsageState)

# Objects
mibBuilder.exportSymbols("ENTITY-STATE-TC-MIB", entityStateTc=entityStateTc)

