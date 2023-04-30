# PySNMP SMI module. Autogenerated from smidump -f python DIFFSERV-DSCP-TC
# by libsmi2pysnmp-0.1.3 at Mon Apr  2 20:38:47 2012,
# Python version sys.version_info(major=2, minor=7, micro=2, releaselevel='final', serial=0)

# Imports

( Integer, ObjectIdentifier, OctetString, ) = mibBuilder.importSymbols("ASN1", "Integer", "ObjectIdentifier", "OctetString")
( NamedValues, ) = mibBuilder.importSymbols("ASN1-ENUMERATION", "NamedValues")
( ConstraintsIntersection, ConstraintsUnion, SingleValueConstraint, ValueRangeConstraint, ValueSizeConstraint, ) = mibBuilder.importSymbols("ASN1-REFINEMENT", "ConstraintsIntersection", "ConstraintsUnion", "SingleValueConstraint", "ValueRangeConstraint", "ValueSizeConstraint")
( Bits, Integer32, Integer32, ModuleIdentity, MibIdentifier, TimeTicks, mib_2, ) = mibBuilder.importSymbols("SNMPv2-SMI", "Bits", "Integer32", "Integer32", "ModuleIdentity", "MibIdentifier", "TimeTicks", "mib-2")
( TextualConvention, ) = mibBuilder.importSymbols("SNMPv2-TC", "TextualConvention")

# Types

class Dscp(TextualConvention, Integer32):
    displayHint = "d"
    subtypeSpec = Integer32.subtypeSpec+ValueRangeConstraint(0,63)
    
class DscpOrAny(TextualConvention, Integer32):
    displayHint = "d"
    subtypeSpec = Integer32.subtypeSpec+ValueRangeConstraint(-1,63)
    

# Objects

diffServDSCPTC = ModuleIdentity((1, 3, 6, 1, 2, 1, 96)).setRevisions(("2002-05-09 00:00",))
if mibBuilder.loadTexts: diffServDSCPTC.setOrganization("IETF Differentiated Services WG")
if mibBuilder.loadTexts: diffServDSCPTC.setContactInfo("       Fred Baker\nCisco Systems\n1121 Via Del Rey\nSanta Barbara, CA 93117, USA\nE-mail: fred@cisco.com\n\nKwok Ho Chan\nNortel Networks\n600 Technology Park Drive\nBillerica, MA 01821, USA\nE-mail: khchan@nortelnetworks.com\n\nAndrew Smith\nHarbour Networks\nJiuling Building\n21 North Xisanhuan Ave.\nBeijing, 100089, PRC\nE-mail: ah_smith@acm.org\n\n  Differentiated Services Working Group:\n  diffserv@ietf.org")
if mibBuilder.loadTexts: diffServDSCPTC.setDescription("The Textual Conventions defined in this module should be used\nwhenever a Differentiated Services Code Point is used in a MIB.")

# Augmentions

# Exports

# Module identity
mibBuilder.exportSymbols("DIFFSERV-DSCP-TC", PYSNMP_MODULE_ID=diffServDSCPTC)

# Types
mibBuilder.exportSymbols("DIFFSERV-DSCP-TC", Dscp=Dscp, DscpOrAny=DscpOrAny)

# Objects
mibBuilder.exportSymbols("DIFFSERV-DSCP-TC", diffServDSCPTC=diffServDSCPTC)

