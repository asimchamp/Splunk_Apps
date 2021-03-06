package SFStreamer;

#########################################################################################
# Jason Brvenik - 09/12/2003 - Version 1.0
#
# A perl Module to facilitate interaction with
# the Sourcefire EStreamer integration capabilities
# Provided by Version 2.7 and above
#
# JRB - 09/19/2003 - Added handling for protocol version and error messages - v1.01
# JRB - 10/01/2003 - Updated to final based on documentation changes. - V1.02
# JRB - 06/11/2004 - Updated to include RNA datatypes - V2.11
# JRB - 06/22/2004 - Made record parser more generic, finished roughing in the
#                    RNA blocks and added a data_left parameter - V2.12
# JRB - 08/18/2004 - Updated to handle 3.2 record types
# JRB - 04/11/2005 - Updated to parse impact out of 3.2+ ids event record and added
#                    mac address handling for rna mac address records
#
#
#########################################################################################
#
# Copyright (c) 2007 Sourcefire, INC
#
# THE PRODUCT AND DOCUMENTATION ARE PROVIDED AS IS WITHOUT WARRANTY
# OF ANY KIND, AND SOURCEFIRE DISCLAIMS ALL WARRANTIES AND REPRESENTATIONS,
# EXPRESS OR IMPLIED, WITH RESPECT TO THE PRODUCT, DOCUMENTATION AND
# RELATED MATERIALS INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
# OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE; WARRANTIES
# ARISING FROM A COURSE OF DEALING, USAGE OR TRADE PRACTICE; AND WARRANTIES
# CONCERNING THE NON-INFRINGEMENT OF THIRD PARTY RIGHTS.
#
# IN NO EVENT SHALL SOURCEFIRE BE LIABLE FOR ANY DAMAGES RESULTING FROM
# LOSS OF DATA, LOST PROFITS, LOSS OF USE OF EQUIPMENT OR LOST CONTRACTS
# OR FOR ANY SPECIAL, INDIRECT, INCIDENTAL, PUNITIVE, EXEMPLARY OR
# CONSEQUENTIAL DAMAGES IN ANY WAY ARISING OUT OF OR IN CONNECTION WITH
# THE USE OR PERFORMANCE OF THE PRODUCT OR DOCUMENTATION OR RELATING TO
# THIS AGREEMENT, HOWEVER CAUSED, EVEN IF IT HAS BEEN MADE AWARE OF THE
# POSSIBILITY OF SUCH DAMAGES.  SOURCEFIRE'S ENTIRE LIABILITY TO LICENSEE,
# REGARDLESS OF THE FORM OF ANY CLAIM OR ACTION OR THEORY OF LIABILITY
# (INCLUDING CONTRACT, TORT, OR WARRANTY), SHALL BE LIMITED TO THE
# LICENSE FEES PAID BY LICENSEE TO USE THE PRODUCT.
#
#########################################################################################
# TODO: Also search for TODO or XXX for these
#
# 1) Clean it up and document it more
# 2) Change what is exported - this pollutes the main namespace at the moment
# 3) Make it more self documenting
#
#########################################################################################


#########################################################################################
# Notes
#########################################################################################
#
# HEADER_VERSION_ONE is all for now. If a new protocol version is added later
# then get_feed will have to be expanded to handle it
#
# TYPE_XXX defines record types
# Currently NULL,ERROR,REQUEST are sent and NULL, ERROR, DATA are fetched
#
# RECORD_XXX are record TYPES of DATA fetched from the server
# Currently there are IDS and RNA records
#
# TODO:
# FLAG_XXX are defined as 4 bytes with the upper 3 bytes encroaching
# on reserved space. If this reserved space is ever used then
# that needs to be accounted for and bit shifting will have to be
# done on the decode. If time permits I'll add this in
# to be 100% compliant
#
# The xxx_record and xxx_order are for specific record_types
# if you prototype the hash and then specify the order in the hash as the order element
# and call parse_record with this hash it will return with the appropriate fields filled in
#
# For variable length fields ( text ) you can also pass a hash element named map
# that is a hash which maps the variable length element to the element containing the size
# of this variable length field. If the value in map is numeric then that value will
# be taken as a size specifier
# This is implemented as a check against the value of the element in the hash
# map, if the result is a non 0 determined by int() then we assume that it is
# specifying a size to be used when fetching data for that record, if it is a 0
# then we assume the contents are text and thus point to the field that will provide
# the size of data to grab.
# There are also two special values - BLOCK and LIST.
# BLOCK causes the parser to recursively parse the field as if it were an RNA
# block record.
# LIST swallows all data until the end of the current structure and treats it
# as a number of RNA blocks end-to-end.  This should only be used inside of
# list-only blocks  (11 and 31).  Most structures merely contain a list block
# and as such would use BLOCK.
#
# You can modify the data before it is returned to the calling program in any
# way you want by defining an 'eval' key in the reference record which is a hash
# of the fields by name with an eval block to eval().
# the $value variable is defined with the data for that field before calling eval()
#
# This is promarily used to handle data fetched that needs some form of conversion.
#
# EG: $event_eval = {
#         'src_addr' => 'inet_ntoa(pack("N",$value))',  # return dotted quad
#         'dst_addr' => 'inet_ntoa(pack("N",$value))',  # return dotted quad
#         'event_sec' => 'gmtime($value)'  # return readable date string
#     };
#
# I decided to make things more complicated by defining a byte_order hash that will
# determine what order to consider the data as being since some of the inner RNA structures
# use host byte order ( VAX or as some prefer "reverse network" order )
#
# If this is defined then the byte order specified is used
# Eg:
# 'N' = 4 byte network order data
# 'n' = 2 byte network order data
# 'V' = 4 byte VAX order data
# 'v' = 2 byte VAX order data
# 'C' = 1 byte unsigned char
# 'c' = 1 byte signed char
#
# This has the side effect of not having to prototype the record as a final result
# since I made the record_parser aware of the byte_order map and it will
# calculate and fetch the appropriate amount of data. We do not even have to fill out
# the final prototype unless there are extra things we want in the record because
# the parser will walk the order array and fetch data based on map or byte_order
#
#########################################################################################
# To add additional records you need to define xxx_order, xxx_record and if required
# xxx_map and xxx_eval.
#
# Then you need to define the record_type and add an if block to get_feed
#########################################################################################


use strict;
use Socket;
use Data::Dumper;
use Storable qw(dclone);
use SFRNABlocks;
use SFRecords;
require Exporter;
use NetAddr::IP;
use Math::BigInt;
use vars qw(@ISA @EXPORT);

# Pollute the global namespace ;-)

@ISA = qw(Exporter);
@EXPORT = qw(
    $FLAG_PKTS
    $FLAG_METADATA
    $FLAG_IDS
    $FLAG_RNA
    $FLAG_POLICY_EVENTS
    $FLAG_IMPACT_ALERTS
    $FLAG_IDS_IMPACT_FLAG
    $FLAG_RNA_EVENTS_2
    $FLAG_RNA_FLOW
    $FLAG_POLICY_EVENTS_2
    $FLAG_RNA_EVENTS_3
    $FLAG_HOST_ONLY
    $FLAG_RNA_FLOW_3
    $FLAG_POLICY_EVENTS_3
    $FLAG_METADATA_2
    $FLAG_METADATA_3
    $FLAG_WAIT_FOR_CONFIG
    $FLAG_RNA_EVENTS_4
    $FLAG_RNA_FLOW_4
    $FLAG_POLICY_EVENTS_4
    $FLAG_METADATA_4
    $FLAG_RUA
    $FLAG_HOST_SINGLE
    $FLAG_HOST_MULTI
    $FLAG_HOST_SINGLE_V2
    $FLAG_HOST_MULTI_V2
    $FLAG_HOST_SINGLE_V3
    $FLAG_HOST_MULTI_V3
    $FLAG_HOST_SINGLE_V4
    $FLAG_HOST_MULTI_V4
    $FLAG_HOST_SINGLE_V5
    $FLAG_HOST_MULTI_V5
    $FLAG_IPS_RULE_DOC
    $FLAG_HOST_SINGLE_V6
    $FLAG_HOST_MULTI_V6
    $FLAG_HOST_SINGLE_V7
    $FLAG_HOST_MULTI_V7
    $FLAG_POLICY_EVENTS_5
    $FLAG_SEND_ARCHIVE_TIMESTAMP
    $FLAG_RNA_EVENTS_5
    $FLAG_RNA_EVENTS_6
    $FLAG_RNA_FLOW_5
    $FLAG_EXTRA_DATA
    $FLAG_RNA_EVENTS_7
    $FLAG_POLICY_EVENTS_6
    $FLAG_DETAIL_REQUEST
);

my $VERSION = 2.13;

#####################################################
# Debugging stuff
#####################################################

#####################################################
# Set to 1 to enable debugging 0 to disable
#####################################################
our $debug = 0;

#####################################################
# Where to write raw data out for debugging
#####################################################
our $debug_log = "/tmp/streamer_data";

#####################################################
# Clobber the log or die
#####################################################
if ( $debug ) {
    debug("Debugging is on for $0");
    debug("Disable by setting \$debug = 0");
    open(FH, ">$debug_log.out") || die("Failed to open $debug_log.out\n");
    close FH;
    open(FH, ">$debug_log.in") || die("Failed to open $debug_log.in\n");
    close FH;
} else {
    $debug_log = undef;
}

#####################################################
# Constants
#####################################################

#####################################################
# Protocol Version
#####################################################
our $HEADER_VERSION_ONE         = 1;

#####################################################
# Message Type
#####################################################
our $TYPE_NULL                  = 0;
our $TYPE_ERROR                 = 1;
our $TYPE_REQUEST               = 2;
our $TYPE_DATA                  = 4;
our $TYPE_HOST_REQUEST          = 5;
our $TYPE_HOST_DATA             = 6;
our $TYPE_MULTI_HOST_DATA       = 7;
our $TYPE_UEC_STREAM_INFO       = 2051;
our $TYPE_UEC_STREAM_REQUEST    = 2049;
our $TYPE_UNIFIED2_UEC_BUNDLE   = 4002;
our $TYPE_RULE_DOC_DATA         = 17;

our $MESSAGE_TYPES = {
    $TYPE_NULL                  => "Null",
    $TYPE_ERROR                 => "Error",
    $TYPE_REQUEST               => "Request",
    $TYPE_DATA                  => "Data",
    $TYPE_HOST_REQUEST          => "Host Request",
    $TYPE_HOST_DATA             => "Host Data",
    $TYPE_MULTI_HOST_DATA       => "Host Data",
    $TYPE_RULE_DOC_DATA         => "Rule Doc Data",
};

#####################################################
# Record Type
#####################################################
our $RECORD_EVENT                               = 1;
our $RECORD_PACKET                              = 2;
our $RECORD_CLASSIFICATION                      = 3;
our $RECORD_PRIORITY                            = 4;
our $RECORD_RULE                                = 5;        #SIGNATURE_MESSAGE
our $RECORD_RNA                                 = 6;
our $RECORD_EVENT2                              = 7;        #IDS_EVENT
our $RECORD_POLICY_EVENT                        = 8;
our $RECORD_IMPACT_EVENT                        = 9;
our $RECORD_NEW_HOST                            = 10;
our $RNA_EVENT_NEW_TCP_SERVICE                  = 11;
our $RNA_EVENT_NEW_UDP_SERVICE                  = 12;
our $RNA_EVENT_NEW_NET_PROTOCOL                 = 13;
our $RNA_EVENT_NEW_XPORT_PROTOCOL               = 14;
our $RNA_EVENT_NEW_CLIENT_APP                   = 15;
our $RNA_EVENT_CHANGE_TCP_SERVICE_INFO          = 16;
our $RNA_EVENT_CHANGE_UDP_SERVICE_INFO          = 17;
our $RNA_EVENT_CHANGE_OS                        = 18;
our $RNA_EVENT_CHANGE_HT_TIMEOUT                = 19;
our $RNA_EVENT_CHANGE_HT_REMOVE                 = 20;
our $RNA_EVENT_CHANGE_HT_ANR_DELETE             = 21;
our $RNA_EVENT_CHANGE_HOPS                      = 22;
our $RNA_EVENT_CHANGE_TCP_PORT_CLOSED           = 23;
our $RNA_EVENT_CHANGE_UDP_PORT_CLOSED           = 24;
our $RNA_EVENT_CHANGE_TCP_PORT_TIMEOUT          = 25;
our $RNA_EVENT_CHANGE_UDP_PORT_TIMEOUT          = 26;
our $RNA_EVENT_CHANGE_MAC_INFO                  = 27;
our $RNA_EVENT_CHANGE_MAC_ADD                   = 28;
our $RNA_EVENT_CHANGE_HOST_IP                   = 29;
our $RNA_EVENT_CHANGE_HOST_UPDATE               = 30;
our $RNA_EVENT_CHANGE_HOST_TYPE                 = 31;
our $RNA_EVENT_CHANGE_VULN_MAP                  = 32;
our $RNA_EVENT_CHANGE_FLOW_STATS                = 33;
our $RNA_EVENT_CHANGE_VLAN_TAG                  = 34;
our $RNA_EVENT_CHANGE_CLIENT_APP_TIMEOUT        = 35;
our $POLICY_EVENT_V2                            = 36;
our $RNA_EVENT_USER_VULN_VALID                  = 37;
our $RNA_EVENT_USER_VULN_INVALID                = 38;
our $RNA_EVENT_USER_DELETE_ADDR                 = 39;
our $RNA_EVENT_USER_DELETE_SERVICE              = 40;
our $RNA_EVENT_USER_SET_CRIICALITY              = 41;
our $RNA_EVENT_CHANGE_NETBIOS_NAME              = 42;
our $RNA_EVENT_CHANGE_HT_DROPPED                = 44;
our $RNA_EVENT_CHANGE_BANNER_UPDATE             = 45;
our $RNA_EVENT_USER_ADD_ATTRIBUTE               = 46;
our $RNA_EVENT_USER_UPDATE_ATTRIBUTE            = 47;
our $RNA_EVENT_USER_DELETE_ATTRIBUTE            = 48;
our $RNA_EVENT_USER_SET_ATTRIBUTE_VALUE         = 49;
our $RNA_EVENT_USER_DELETE_ATTRIBUTE_VALUE      = 50;
our $RNA_EVENT_CHANGE_TCP_SERVICE_CONFIDENCE    = 51;
our $RNA_EVENT_CHANGE_UDP_SERVICE_CONFIDENCE    = 52;
our $RNA_EVENT_CHANGE_OS_CONFIDENCE             = 53;
our $RNA_FINGERPRINT                            = 54;
our $RNA_CLIENT_APPLICATION                     = 55;
our $RNA_CLIENT_APPLICATION_TYPE                = 56;
our $RNA_VULNERABILITY                          = 57;
our $RNA_CRITICALITY                            = 58;
our $RNA_NETWORK_PROTOCOL                       = 59;
our $RNA_ATTRIBUTE                              = 60;
our $RNA_SCAN_TYPE                              = 61;
our $USERS                                      = 62;
our $RNA_SERVICE                                = 63;
our $DETECTION_ENGINE                           = 64;
our $POLICY_EVENT_V3                            = 65;
our $SIGNATURE_MESSAGE_V2                       = 66;
our $CLASSIFICATION_V2                          = 67;
our $DETECTION_ENGINE_V2                        = 68;
our $COMPLIANCE_POLICY                          = 69;
our $COMPLIANCE_RULE                            = 70;
our $RNA_EVENT_FLOW_FLOW_STATS                  = 71;
our $IDS_EVENT_IPV6                             = 72;
our $RNA_EVENT_FLOW_FLOW_CHUNK                  = 73;
our $RNA_EVENT_USER_SET_OS                      = 74;
our $RNA_EVENT_USER_SET_SERVICE                 = 75;
our $RNA_EVENT_USER_DELETE_PROTOCOL             = 76;
our $RNA_EVENT_USER_DELETE_CLIENT_APP           = 77;
our $RNA_EVENT_USER_DELETE_ADDR_V2              = 78;
our $RNA_EVENT_USER_DELETE_SERVICE_V2           = 79;
our $RNA_EVENT_USER_VULN_VALID_V2               = 80;
our $RNA_EVENT_USER_VULN_INVALID_V2             = 81;
our $RNA_EVENT_USER_SET_CRITICALITY_V2          = 82;
our $RNA_EVENT_USER_SET_ATTRIBUTE_VALUE_V2      = 83;
our $RNA_EVENT_USER_DELETE_ATTRIBUTE_VALUE_V2   = 84;
our $RNA_EVENT_USER_ADD_HOST                    = 85;
our $RNA_EVENT_USER_ADD_SERVICE                 = 86;
our $RNA_EVENT_USER_ADD_CLIENT_APP              = 87;
our $RNA_EVENT_USER_ADD_PROTOCOL                = 88;
our $RNA_EVENT_USER_ADD_SCAN_RESULT             = 89;
our $RNA_SOURCE_TYPE                            = 90;
our $RNA_SOURCE_APP                             = 91;
our $RUA_EVENT_CHANGE_USER_DROPPED              = 92;
our $RUA_EVENT_CHANGE_USER_REMOVE               = 93;
our $RUA_EVENT_NEW_USER_ID                      = 94;
our $RUA_EVENT_CHANGE_USER_LOGIN                = 95;
our $RNA_SOURCE_DETECTOR                        = 96;
our $POLICY_EVENT_V5                            = 97;
our $RUA_USER_ID                                = 98;
our $IDS_EVENT_MPLS                             = 99;
our $IDS_EVENT_IPV6_MPLS                        = 100;
our $RNA_EVENT_NEW_OS                           = 101;
our $RNA_EVENT_CHANGE_IDENTITY_CONFLICT         = 102;
our $RNA_EVENT_CHANGE_IDENTITY_TIMEOUT          = 103;
our $IDS_EVENT_VLAN                             = 104;
our $IDS_EVENT_IPV6_VLAN                        = 105;
our $SCAN_VULNERABILITY                         = 106;
our $RNA_EVENT_CHANGE_CLIENT_APP_UPDATE         = 107;
our $RNA_PAYLOAD_TYPE                           = 108;
our $RNA_PAYLOAD                                = 109;
our $EXTRA_DATA                                 = 110;
our $EXTRA_DATA_TYPE                            = 111;
our $POLICY_EVENT_V6                            = 112;
our $RUA_EVENT_FAILED_USER_LOGIN                = 114;
our $ZONE_NAME                                  = 115;
our $INTERFACE_NAME                             = 116;
our $FW_POLICY_NAME                             = 117;
our $IDS_POLICY_NAME                            = 118;
our $FW_RULE_ID                                 = 119;
our $FW_RULE_ACTION                             = 120;
our $FW_URL_CATEGORY                            = 121;
our $FW_URL_REPUTATION                          = 122;
our $SENSOR                                     = 123;
our $FW_RULE_REASON                             = 124;
our $FIREAMP_EVENT                              = 125;
our $FIREAMP_CLOUD_NAME                         = 127;
our $FIREAMP_EVENT_TYPE                         = 128;
our $FIREAMP_EVENT_SUBTYPE                      = 129;
our $FIREAMP_DETECTOR_TYPE                      = 130;
our $FIREAMP_FILE_TYPE                          = 131;
our $IPS_RULE_DOC                               = 140;
our $RNA_EVENT_IOC_SET                          = 160;
our $IOC_NAME                                   = 161;
our $RNA_EVENT_USER_IOC_DELETE                  = 162;
our $RNA_EVENT_USER_IOC_ENABLE                  = 163;
our $RNA_EVENT_USER_IOC_DISABLE                 = 164;
our $IDS_EVENT_NG                               = 207;
our $IDS_EVENT_IPV6_NG                          = 208;
our $ICMP_TYPE                                  = 260;
our $ICMP_CODE                                  = 270;
our $IPREP_CATEGORY                             = 280;
our $IPREP_SRCDEST                              = 281;
our $IPS_EVENT                                  = 400;
our $FILELOG_EVENT                              = 500;
our $FILELOG_MALWARE_EVENT                      = 502;
our $FILELOG_FILE_TYPE                          = 510;
our $FILELOG_SHA                                = 511;
our $FILELOG_STORAGE                            = 515;
our $FILELOG_SANDBOX                            = 516;
our $FILELOG_SPERO                              = 517;
our $GEOLOCATION                                = 520;
our $FILE_POLICY_NAME                           = 530;

our $RECORD_TYPES = {
    $RECORD_EVENT                               => 'EVENT',
    $RECORD_PACKET                              => 'PACKET',
    $RECORD_CLASSIFICATION                      => 'CLASSIFICATION',
    $RECORD_PRIORITY                            => 'PRIORITY',
    $RECORD_RULE                                => 'RULE',
    $RECORD_RNA                                 => 'RNA',
    $RECORD_EVENT2                              => 'EVENT',
    $RECORD_POLICY_EVENT                        => 'POLICY',
    $RECORD_IMPACT_EVENT                        => 'IMPACT',
    $RECORD_NEW_HOST                            => 'RNA',
    $RNA_EVENT_NEW_TCP_SERVICE                  => 'RNA',
    $RNA_EVENT_NEW_UDP_SERVICE                  => 'RNA',
    $RNA_EVENT_NEW_NET_PROTOCOL                 => 'RNA',
    $RNA_EVENT_NEW_XPORT_PROTOCOL               => 'RNA',
    $RNA_EVENT_NEW_CLIENT_APP                   => 'RNA',
    $RNA_EVENT_CHANGE_TCP_SERVICE_INFO          => 'RNA',
    $RNA_EVENT_CHANGE_UDP_SERVICE_INFO          => 'RNA',
    $RNA_EVENT_CHANGE_OS                        => 'RNA',
    $RNA_EVENT_CHANGE_HT_TIMEOUT                => 'RNA',
    $RNA_EVENT_CHANGE_HT_REMOVE                 => 'RNA',
    $RNA_EVENT_CHANGE_HT_ANR_DELETE             => 'RNA',
    $RNA_EVENT_CHANGE_HOPS                      => 'RNA',
    $RNA_EVENT_CHANGE_TCP_PORT_CLOSED           => 'RNA',
    $RNA_EVENT_CHANGE_UDP_PORT_CLOSED           => 'RNA',
    $RNA_EVENT_CHANGE_TCP_PORT_TIMEOUT          => 'RNA',
    $RNA_EVENT_CHANGE_UDP_PORT_TIMEOUT          => 'RNA',
    $RNA_EVENT_CHANGE_MAC_INFO                  => 'RNA',
    $RNA_EVENT_CHANGE_MAC_ADD                   => 'RNA',
    $RNA_EVENT_CHANGE_HOST_IP                   => 'RNA',
    $RNA_EVENT_CHANGE_HOST_UPDATE               => 'RNA',
    $RNA_EVENT_CHANGE_HOST_TYPE                 => 'RNA',
    $RNA_EVENT_CHANGE_VULN_MAP                  => 'RNA',
    $RNA_EVENT_CHANGE_FLOW_STATS                => 'RNA',
    $RNA_EVENT_CHANGE_VLAN_TAG                  => 'RNA',
    $RNA_EVENT_CHANGE_CLIENT_APP_TIMEOUT        => 'RNA',
    $POLICY_EVENT_V2                            => 'POLICY',
    $RNA_EVENT_USER_VULN_VALID                  => 'RNA',
    $RNA_EVENT_USER_VULN_INVALID                => 'RNA',
    $RNA_EVENT_USER_DELETE_ADDR                 => 'RNA',
    $RNA_EVENT_USER_DELETE_SERVICE              => 'RNA',
    $RNA_EVENT_USER_SET_CRIICALITY              => 'RNA',
    $RNA_EVENT_CHANGE_NETBIOS_NAME              => 'RNA',
    $RNA_EVENT_CHANGE_HT_DROPPED                => 'RNA',
    $RNA_EVENT_CHANGE_BANNER_UPDATE             => 'RNA',
    $RNA_EVENT_USER_ADD_ATTRIBUTE               => 'RNA',
    $RNA_EVENT_USER_UPDATE_ATTRIBUTE            => 'RNA',
    $RNA_EVENT_USER_DELETE_ATTRIBUTE            => 'RNA',
    $RNA_EVENT_USER_SET_ATTRIBUTE_VALUE         => 'RNA',
    $RNA_EVENT_USER_DELETE_ATTRIBUTE_VALUE      => 'RNA',
    $RNA_EVENT_CHANGE_TCP_SERVICE_CONFIDENCE    => 'RNA',
    $RNA_EVENT_CHANGE_UDP_SERVICE_CONFIDENCE    => 'RNA',
    $RNA_EVENT_CHANGE_OS_CONFIDENCE             => 'RNA',
    $RNA_FINGERPRINT                            => 'FINGERPRINT',
    $RNA_CLIENT_APPLICATION                     => 'CLIENT APP',
    $RNA_CLIENT_APPLICATION_TYPE                => 'CLIENT APP TYPE',
    $RNA_VULNERABILITY                          => 'VULNERABILITY',
    $RNA_CRITICALITY                            => 'CRITICALITY',
    $RNA_NETWORK_PROTOCOL                       => 'NET PROTO',
    $RNA_ATTRIBUTE                              => 'ATTRIBUTE',
    $RNA_SCAN_TYPE                              => 'SCAN TYPE',
    $USERS                                      => 'SYSTEM USER',
    $RNA_SERVICE                                => 'SERVICE',
    $DETECTION_ENGINE                           => 'DETECTION ENGINE',
    $POLICY_EVENT_V3                            => 'POLICY',
    $SIGNATURE_MESSAGE_V2                       => 'RULE',
    $CLASSIFICATION_V2                          => 'CLASSIFICATION',
    $DETECTION_ENGINE_V2                        => 'DETECTION ENGINE',
    $COMPLIANCE_POLICY                          => 'POLICY',
    $COMPLIANCE_RULE                            => 'RULE',
    $RNA_EVENT_FLOW_FLOW_STATS                  => 'RNA',
    $IDS_EVENT_IPV6                             => 'EVENT',
    $RNA_EVENT_FLOW_FLOW_CHUNK                  => 'RNA',
    $RNA_EVENT_USER_SET_OS                      => 'RNA',
    $RNA_EVENT_USER_SET_SERVICE                 => 'RNA',
    $RNA_EVENT_USER_DELETE_PROTOCOL             => 'RNA',
    $RNA_EVENT_USER_DELETE_CLIENT_APP           => 'RNA',
    $RNA_EVENT_USER_DELETE_ADDR_V2              => 'RNA',
    $RNA_EVENT_USER_DELETE_SERVICE_V2           => 'RNA',
    $RNA_EVENT_USER_VULN_VALID_V2               => 'RNA',
    $RNA_EVENT_USER_VULN_INVALID_V2             => 'RNA',
    $RNA_EVENT_USER_SET_CRITICALITY_V2          => 'RNA',
    $RNA_EVENT_USER_SET_ATTRIBUTE_VALUE_V2      => 'RNA',
    $RNA_EVENT_USER_DELETE_ATTRIBUTE_VALUE_V2   => 'RNA',
    $RNA_EVENT_USER_ADD_HOST                    => 'RNA',
    $RNA_EVENT_USER_ADD_SERVICE                 => 'RNA',
    $RNA_EVENT_USER_ADD_CLIENT_APP              => 'RNA',
    $RNA_EVENT_USER_ADD_PROTOCOL                => 'RNA',
    $RNA_EVENT_USER_ADD_SCAN_RESULT             => 'RNA',
    $RNA_SOURCE_TYPE                            => 'SOURCE TYPE',
    $RNA_SOURCE_APP                             => 'SOURCE APP',
    $RUA_EVENT_CHANGE_USER_DROPPED              => 'RUA',
    $RUA_EVENT_CHANGE_USER_REMOVE               => 'RUA',
    $RUA_EVENT_NEW_USER_ID                      => 'RUA',
    $RUA_EVENT_CHANGE_USER_LOGIN                => 'RUA',
    $RNA_SOURCE_DETECTOR                        => 'SOURCE DETECTOR',
    $POLICY_EVENT_V5                            => 'POLICY',
    $RUA_USER_ID                                => 'RUA USER',
    $IDS_EVENT_MPLS                             => 'EVENT',
    $IDS_EVENT_IPV6_MPLS                        => 'EVENT',
    $RNA_EVENT_NEW_OS                           => 'RNA',
    $RNA_EVENT_CHANGE_IDENTITY_CONFLICT         => 'RNA',
    $RNA_EVENT_CHANGE_IDENTITY_TIMEOUT          => 'RNA',
    $IDS_EVENT_VLAN                             => 'EVENT',
    $IDS_EVENT_IPV6_VLAN                        => 'EVENT',
    $SCAN_VULNERABILITY                         => 'VULNERABILITY',
    $RNA_EVENT_CHANGE_CLIENT_APP_UPDATE         => 'RNA',
    $RNA_PAYLOAD_TYPE                           => 'PAYLOAD TYPE',
    $RNA_PAYLOAD                                => 'PAYLOAD',
    $EXTRA_DATA                                 => 'EXTRA DATA',
    $EXTRA_DATA_TYPE                            => 'EXTRA DATA TYPE',
    $POLICY_EVENT_V6                            => 'POLICY',
    $RUA_EVENT_FAILED_USER_LOGIN                => 'RUA',
    $ZONE_NAME                                  => 'ZONE',
    $INTERFACE_NAME                             => 'INTERFACE',
    $FW_POLICY_NAME                             => 'FIREWALL POLICY',
    $IDS_POLICY_NAME                            => 'INTRUSION POLICY',
    $FW_RULE_ID                                 => 'FIREWALL RULE',
    $FW_RULE_ACTION                             => 'FIREWALL RULE ACTION',
    $FW_URL_CATEGORY                            => 'FIREWALL URL CATEGORY',
    $FW_URL_REPUTATION                          => 'FIREWALL URL REPUTATION',
    $SENSOR                                     => 'SENSOR',
    $IDS_EVENT_NG                               => 'EVENT',
    $IDS_EVENT_IPV6_NG                          => 'EVENT',
    $IPS_EVENT                                  => 'IPS EVENT',
    $FW_RULE_REASON                             => 'FIREWALL RULE REASON',
    $FIREAMP_EVENT                              => 'MALWARE EVENT',
    $FIREAMP_CLOUD_NAME                         => 'FIREAMP CLOUD',
    $FIREAMP_EVENT_TYPE                         => 'MALWARE EVENT TYPE',
    $FIREAMP_EVENT_SUBTYPE                      => 'MALWARE EVENT SUBTYPE',
    $FIREAMP_DETECTOR_TYPE                      => 'MALWARE DETECTOR TYPE',
    $FIREAMP_FILE_TYPE                          => 'MALWARE FILE TYPE',
    $IPS_RULE_DOC                               => 'IPS RULE DOC',
    $ICMP_TYPE                                  => 'ICMP TYPE',
    $ICMP_CODE                                  => 'ICMP CODE',
    $IPREP_CATEGORY                             => 'SECURITY INTELLIGENCE CATEGORY',
    $IPREP_SRCDEST                              => 'SECURITY INTELLIGENCE SOURCE/DEST',
    $FILELOG_EVENT                              => 'FILELOG EVENT',
    $FILELOG_MALWARE_EVENT                      => 'FILELOG MALWARE EVENT',
    $FILELOG_FILE_TYPE                          => 'FILELOG FILE TYPE',
    $FILELOG_STORAGE                            => 'FILELOG STORAGE STATUS',
    $FILELOG_SANDBOX                            => 'FILELOG SANDBOX STATUS',
    $FILELOG_SPERO                              => 'FILELOG SPERO DETECTION',
    $FILELOG_SHA                                => 'FILELOG SHA',
    $GEOLOCATION                                => 'GEOLOCATION',
    $RNA_EVENT_IOC_SET                          => 'RNA',
    $IOC_NAME                                   => 'IOC',
    $RNA_EVENT_USER_IOC_DELETE                  => 'RNA',
    $RNA_EVENT_USER_IOC_ENABLE                  => 'RNA',
    $RNA_EVENT_USER_IOC_DISABLE                 => 'RNA',
    $FILE_POLICY_NAME                           => 'FILE POLICY',
};

#####################################################
# Message Flag Type
#####################################################
our $FLAG_PKTS                  = 1;
our $FLAG_METADATA              = 1 << 1;
our $FLAG_IDS                   = 1 << 2;
our $FLAG_RNA                   = 1 << 3;
our $FLAG_POLICY_EVENTS         = 1 << 4;
our $FLAG_IMPACT_ALERTS         = 1 << 5;
our $FLAG_IDS_IMPACT_FLAG       = 1 << 6;
our $FLAG_RNA_EVENTS_2          = 1 << 7;
our $FLAG_RNA_FLOW              = 1 << 8;
our $FLAG_POLICY_EVENTS_2       = 1 << 9;
our $FLAG_RNA_EVENTS_3          = 1 << 10;
our $FLAG_HOST_ONLY             = 1 << 11;
our $FLAG_RNA_FLOW_3            = 1 << 12;
our $FLAG_POLICY_EVENTS_3       = 1 << 13;
our $FLAG_METADATA_2            = 1 << 14;
our $FLAG_METADATA_3            = 1 << 15;
our $FLAG_WAIT_FOR_CONFIG       = 1 << 16;
our $FLAG_RNA_EVENTS_4          = 1 << 17;
our $FLAG_RNA_FLOW_4            = 1 << 18;
our $FLAG_POLICY_EVENTS_4       = 1 << 19;
our $FLAG_METADATA_4            = 1 << 20;
our $FLAG_RUA                   = 1 << 21;
our $FLAG_POLICY_EVENTS_5       = 1 << 22;
our $FLAG_SEND_ARCHIVE_TIMESTAMP= 1 << 23;
our $FLAG_RNA_EVENTS_5          = 1 << 24;
our $FLAG_RNA_EVENTS_6          = 1 << 25;
our $FLAG_RNA_FLOW_5            = 1 << 26;
our $FLAG_EXTRA_DATA            = 1 << 27;
our $FLAG_RNA_EVENTS_7          = 1 << 28;
our $FLAG_POLICY_EVENTS_6       = 1 << 29;
our $FLAG_DETAIL_REQUEST        = 1 << 30;

our $FLAG_HOST_SINGLE    = 0; # version 3.5 - 4.6
our $FLAG_HOST_MULTI     = 1; # version 3.5 - 4.6
our $FLAG_HOST_SINGLE_V2 = 2; # version 4.7 - 4.8
our $FLAG_HOST_MULTI_V2  = 3; # version 4.7 - 4.8
our $FLAG_HOST_SINGLE_V3 = 4; # version 4.9
our $FLAG_HOST_MULTI_V3  = 5; # version 4.9
our $FLAG_HOST_SINGLE_V4 = 6; # version 5.0
our $FLAG_HOST_MULTI_V4  = 7; # version 5.0
our $FLAG_HOST_SINGLE_V5 = 8; # version 5.1
our $FLAG_HOST_MULTI_V5  = 9; # version 5.1
our $FLAG_IPS_RULE_DOC   = 10;
our $FLAG_HOST_SINGLE_V6 = 11; # version 5.2
our $FLAG_HOST_MULTI_V6  = 12; # version 5.2
our $FLAG_HOST_SINGLE_V7 = 13; # version 5.3
our $FLAG_HOST_MULTI_V7  = 14; # version 5.3

#####################################################
# RNA event types.
#####################################################
our $RNA_TYPE_NEW        = 1000;
our $RNA_TYPE_CHANGE     = 1001;
our $RNA_TYPE_USER_INPUT = 1002;
our $RNA_TYPE_FLOW       = 1003;
our $RUA_TYPE            = 1004;
our $IOC_TYPE            = 1008;

#####################################################
# New subtypes (1000)
#####################################################
our $RNA_NEW_HOST               = 1;
our $RNA_NEW_TCP_SERVICE        = 2;
our $RNA_NEW_NET_PROTO          = 3;
our $RNA_NEW_TRANSPORT_PROTO    = 4;
our $RNA_NEW_IP_TRAFFIC         = 5;
our $RNA_NEW_UDP_SERVICE        = 6;
our $RNA_NEW_CLIENT_APP         = 7;
our $RNA_NEW_OS_FINGERPRINT     = 8;

#####################################################
# Change subtypes (1001)
#####################################################
our $RNA_IP_CHANGED             = 1;
our $RNA_OS_UPDATE              = 2;
our $RNA_IP_REUSED              = 3;
our $RNA_VULN_CHANGED           = 4;
our $RNA_HOPS_CHANGED           = 5;
our $RNA_TCP_SERVICE_UPDATE     = 6;
our $RNA_HOST_TIMEOUT           = 7;
our $RNA_TCP_PORT_CLOSE         = 8;
our $RNA_UDP_PORT_CLOSE         = 9;
our $RNA_UDP_SERVICE_UPDATE     = 10;
our $RNA_TCP_PORT_TIMEOUT       = 11;
our $RNA_UDP_PORT_TIMEOUT       = 12;
our $RNA_MAC_CHANGE             = 13;
our $RNA_ADDITIONAL_MAC         = 14;
our $RNA_HOST_LAST_SEEN         = 15;
our $RNA_HOST_ROUTER_BRIDGE     = 16;
our $RNA_FLOW_STATISTICS        = 17;
our $RNA_VLAN_TAG_UPDATE        = 18;
our $RNA_HOST_DELETED_LIMIT     = 19;
our $RNA_CLIENT_APP_TIMEOUT     = 20;
our $RNA_NETBIOS_NAME           = 21;
our $RNA_NETBIOS_DOMAIN         = 22;
our $RNA_HT_DROPPED             = 23;
our $RNA_BANNER_UPDATE          = 24;
our $RNA_TCP_SERVICE_CONFIDENCE = 25;
our $RNA_UDP_SERVICE_CONFIDENCE = 26;
our $RNA_OS_CONFIDENCE          = 27;
our $RNA_DHCP_INFO              = 28;
our $RNA_IDENTITY_CONFLICT      = 29;
our $RNA_IDENTITY_TIMEOUT       = 30;
our $RNA_SECONDARY_UPDATE       = 31;
our $RNA_CLIENT_APP_UPDATE      = 32;

#####################################################
# User Input subtypes (1002)
#####################################################
our $RNA_SET_VALID_VULN         = 1;
our $RNA_SET_INVALID_VULN       = 2;
our $RNA_DELETE_ADDRESS         = 3;
our $RNA_DELETE_SERVICE         = 4;
our $RNA_SET_HOST_CRITICALITY   = 5;
our $RNA_ADD_HOST_ATTRIBUTE     = 6;
our $RNA_UPDATE_HOST_ATTRIBUTE  = 7;
our $RNA_DELETE_HOST_ATTRIBUTE  = 8;
our $RNA_SET_HOST_ATTRIBUTE     = 9;
our $RNA_CLEAR_HOST_ATTRIBUTE   = 10;
our $RNA_ADD_SCAN_RESULTS       = 11;
our $RNA_USER_VULN_QUALIFY      = 12;
our $RNA_USER_POLICY_CONTROL    = 13;
our $RNA_DELETE_PROTOCOL        = 14;
our $RNA_DELETE_CLIENT_APP      = 15;
our $RNA_SET_OS                 = 16;
our $RNA_ACCOUNT_SEEN           = 17;
our $RNA_ACCOUNT_UPDATE         = 18;
our $RNA_SET_SERVICE            = 19;
our $RNA_DELETE_ADDR_V2         = 20;
our $RNA_DELETE_SERVICE_V2      = 21;
our $RNA_VULN_VALID_V2          = 22;
our $RNA_VULN_INVALID_V2        = 23;
our $RNA_CRITICALITY_V2         = 24;
our $RNA_SET_ATTRIBUTE_VALUE_V2 = 25;
our $RNA_DELETE_ATTRIBUTE_VALUE_V2 = 26;
our $RNA_ADD_HOST               = 27;
our $RNA_ADD_SERVICE            = 28;
our $RNA_ADD_CLIENT_APP         = 29;
our $RNA_ADD_PROTOCOL           = 30;
our $RNA_RELOAD_APP_FPS         = 31;
our $RNA_ACCOUNT_DELETE         = 32;
our $RNA_IOC_DELETE             = 45;
our $RNA_IOC_INVALUD            = 46;

#####################################################
# Flow subtypes (1003)
#####################################################
our $RNA_FLOW_STATS     = 1;
our $RNA_FLOW_CHUNK     = 2;

#####################################################
# RUA subtypes (1004)
#####################################################
our $RUA_USER_INFO      = 1;
our $RUA_LOGIN_INFO     = 2;
our $RUA_REMOVE_USER    = 3;
our $RUA_DROP_USER      = 4;

#####################################################
# IOC subtypes (1008)
#####################################################
our $IOC_SET            = 1;


#####################################################
# Make them all human readable
#####################################################
our $RNA_TYPE_NAMES = {
    $RNA_TYPE_NEW => {
        $RNA_NEW_HOST                   => 'New Host',
        $RNA_NEW_TCP_SERVICE            => 'New TCP Service',
        $RNA_NEW_NET_PROTO              => 'New Network Protocol',
        $RNA_NEW_TRANSPORT_PROTO        => 'New Transport Protocol',
        $RNA_NEW_IP_TRAFFIC             => 'New IP to IP traffic',
        $RNA_NEW_UDP_SERVICE            => 'New UDP Service',
        $RNA_NEW_CLIENT_APP             => 'New Client Applicastion',
        $RNA_NEW_OS_FINGERPRINT         => 'New OS Fingerprint',
    },
    $RNA_TYPE_CHANGE => {
        $RNA_IP_CHANGED                 => 'Host IP Address Changed',
        $RNA_OS_UPDATE                  => 'OS Information Update',
        $RNA_IP_REUSED                  => 'Host IP Address Reused',
        $RNA_VULN_CHANGED               => 'Vulnerability Changed',
        $RNA_HOPS_CHANGED               => 'Hops Change',
        $RNA_TCP_SERVICE_UPDATE         => 'TCP Service Information Update',
        $RNA_HOST_TIMEOUT               => 'Host Timeout',
        $RNA_TCP_PORT_CLOSE             => 'TCP Port Closed',
        $RNA_UDP_PORT_CLOSE             => 'UDP Port Closed',
        $RNA_UDP_SERVICE_UPDATE         => 'UDP Service Information Update',
        $RNA_TCP_PORT_TIMEOUT           => 'TCP Port Timeout',
        $RNA_UDP_PORT_TIMEOUT           => 'UDP Port Timeout',
        $RNA_MAC_CHANGE                 => 'MAC Information Change',
        $RNA_ADDITIONAL_MAC             => 'Additional MAC Detected',
        $RNA_HOST_LAST_SEEN             => 'Host Last Seen',
        $RNA_HOST_ROUTER_BRIDGE         => 'Host Identified as Router or Bridge',
        $RNA_FLOW_STATISTICS            => 'Flow Statistics',
        $RNA_VLAN_TAG_UPDATE            => 'VLAN Tag Information Update',
        $RNA_HOST_DELETED_LIMIT         => 'Host Deleted: Limit Reached',
        $RNA_CLIENT_APP_TIMEOUT         => 'Client Application Timeout',
        $RNA_NETBIOS_NAME               => 'NetBIOS Name Change',
        $RNA_NETBIOS_DOMAIN             => 'NetBIOS Domain Change',
        $RNA_HT_DROPPED                 => 'Host Dropped: Host Limit Reached',
        $RNA_BANNER_UPDATE              => 'Banner Update',
        $RNA_TCP_SERVICE_CONFIDENCE     => 'TCP Service Confidence Update',
        $RNA_UDP_SERVICE_CONFIDENCE     => 'UDP Service Confidence Update',
        $RNA_OS_CONFIDENCE              => 'OS Confidence Update',
        $RNA_DHCP_INFO                  => 'DHCP Information',
        $RNA_IDENTITY_CONFLICT          => 'Identity Conflict',
        $RNA_IDENTITY_TIMEOUT           => 'Identity Timeout',
        $RNA_SECONDARY_UPDATE           => 'Secondary Host Update',
        $RNA_CLIENT_APP_UPDATE          => 'Client Application Update',
    },
    $RNA_TYPE_USER_INPUT => {
        $RNA_SET_VALID_VULN             => 'Valid Vulnerabilities',
        $RNA_SET_INVALID_VULN           => 'Invalid Vulnerabilities',
        $RNA_DELETE_ADDRESS             => 'Delete Address',
        $RNA_DELETE_SERVICE             => 'Delete Service',
        $RNA_SET_HOST_CRITICALITY       => 'Set Host Criticality',
        $RNA_ADD_HOST_ATTRIBUTE         => 'Host Attribute Add',
        $RNA_UPDATE_HOST_ATTRIBUTE      => 'Host Attribute Update',
        $RNA_DELETE_HOST_ATTRIBUTE      => 'Host Attribute Delete',
        $RNA_SET_HOST_ATTRIBUTE         => 'Host Attribute Set Value',
        $RNA_CLEAR_HOST_ATTRIBUTE       => 'Host Attribute Delete Value',
        $RNA_ADD_SCAN_RESULTS           => 'Add Scan Result',
        $RNA_USER_VULN_QUALIFY          => 'Set Vulnerability Impact Qualification',
        $RNA_USER_POLICY_CONTROL        => 'User Policy Control',
        $RNA_DELETE_PROTOCOL            => 'Delete Protocol',
        $RNA_DELETE_CLIENT_APP          => 'Delete Client Application',
        $RNA_SET_OS                     => 'Set Operating System Definition',
        $RNA_ACCOUNT_SEEN               => 'Account Seen',
        $RNA_ACCOUNT_UPDATE             => 'Account Update',
        $RNA_SET_SERVICE                => 'Set Service Definition',
        $RNA_DELETE_ADDR_V2             => 'Delete Host/Network',
        $RNA_DELETE_SERVICE_V2          => 'Delete Service',
        $RNA_VULN_VALID_V2              => 'Vulnerability Set Valid',
        $RNA_VULN_INVALID_V2            => 'Vulnerability Set Invalid',
        $RNA_CRITICALITY_V2             => 'Set Host Criticality',
        $RNA_SET_ATTRIBUTE_VALUE_V2     => 'Host Attribute Set Value',
        $RNA_DELETE_ATTRIBUTE_VALUE_V2  => 'Host Attribute Delete Value',
        $RNA_ADD_HOST                   => 'Add Host',
        $RNA_ADD_SERVICE                => 'Add Service',
        $RNA_ADD_CLIENT_APP             => 'Add Client Application',
        $RNA_ADD_PROTOCOL               => 'Add Protocol',
        $RNA_RELOAD_APP_FPS             => 'Reload App',
        $RNA_ACCOUNT_DELETE             => 'Account Delete',
        $RNA_IOC_DELETE                 => 'IOC Delete',
        $RNA_IOC_INVALUD                => 'IOC Invalid',
    },
    $RNA_TYPE_FLOW => {
        $RNA_FLOW_STATS                 => 'Flow Statistics',
        $RNA_FLOW_CHUNK                 => 'Flow Chunk',
    },
    $RUA_TYPE => {
        $RUA_USER_INFO                  => 'User Information',
        $RUA_LOGIN_INFO                 => 'User Login Information',
        $RUA_REMOVE_USER                => 'Delete User Identity',
        $RUA_DROP_USER                  => 'User Identity Dropped: User Limit Reached',
    },
    $IOC_TYPE => {
        $IOC_SET                        => 'IOC Set',
    },
};
#####################################################
# Initial timestamp and flag
our $init_timestamp = 0;
our $init_flags     = 0;
#####################################################
# Event type for service request
our $REQ_SEND_SNORT_EVENTS  =   12;
our $REQ_SEND_METADATA      =   21;
our $REQ_SEND_POLICY_EVENTS =   31;
our $REQ_SEND_RNA_EVENTS    =   61;
our $REQ_SEND_RNA_FLOW      =   71;
our $REQ_SEND_RUA_EVENTS    =   91;
our $REQ_SEND_FIREAMP_EVENTS=   101;
our $REQ_SEND_FILELOG_EVENTS=   111;
our $REQ_SEND_IMPACT_ALERTS =   131;

# for use in record decodes, a uuid pretty-printer.
sub uuid_to_str($){
    my $data = shift;

    if(length($data) != 16){
        return "Invalid UUID length";
    }

    my @bytes = unpack("C16", $data);
    my $str = sprintf("%02x%02x%02x%02x-%02x%02x-%02x%02x-%02x%02x-%02x%02x%02x%02x%02x%02x", @bytes);
    return $str;
}

# for use in record decodes, a mac pretty-printer.
sub mac_to_str($){
    my $data = shift;

    if(length($data) != 6){
        return "Invalid MAC length";
    }

    my @bytes = unpack("C6", $data);
    my $str = sprintf("%02X:%02X:%02X:%02X:%02X:%02X", @bytes);
    return $str;
}

# for use in record decodes, an ipv6 pretty-printer.
sub ipv6_to_str{
    my $data = shift;

    my $length = length($data);
    if($length == 0){
        return "";
    }
    if($length != 16){
        return "Invalid IPv6 length $length";
    }

    my @bytes = unpack("C16", $data);
    # Check for IPv4 compatibility address
    my $str;
    if($bytes[0] == 0 && $bytes[1] == 0 && $bytes[2] == 0 && $bytes[3] == 0 && $bytes[4] == 0 && $bytes[5] == 0 && $bytes[6] == 0 && $bytes[7] == 0 && $bytes[8] == 0 && $bytes[9] == 0 && $bytes[10] == 255 && $bytes[11] == 255){
        $str = sprintf("%d.%d.%d.%d", @bytes[12..15]);
    }else{
        $str = sprintf("%02X%02X:%02X%02X:%02X%02X:%02X%02X:%02X%02X:%02X%02X:%02X%02X:%02X%02X", @bytes);
        my $ip = NetAddr::IP->new($str);
        $str = $ip->short();
    }

    return $str;
}

# for use in record decodes, a generic de-hexer
sub hex_to_str{
    my $data = shift;

    my $str = unpack("H*", $data);

    return $str;
}

# for handling 64 bit ints on perls that don't have 64 bit support
sub int64_to_bigint{
    my $data = shift;

    my ($hi, $lo) = unpack("NN", $data);

    my $h = Math::BigInt->new($hi);
    $h->blsft(32);
    my $l = Math::BigInt->new($lo);
    my $i = $l->badd($h);

    return $i;
}

# Parsing of Extra Data is more complex
our $extra_data_type_info = {};

sub learn_extra_data_metadata{
    my $rec_proto_ref = shift;
    my $encoding = $rec_proto_ref->{encoding}{data};
    chop $encoding; # $encoding is a NULL-terminated C string
    $extra_data_type_info->{$rec_proto_ref->{type}} = $encoding;
}

sub extra_data_to_str{
    my $rec_proto_ref = shift;

    my $encoding = $extra_data_type_info->{$rec_proto_ref->{type}};
    if(defined $encoding){
        if($encoding eq 'IPv4'){
            $rec_proto_ref->{data}{data} = inet_ntoa($rec_proto_ref->{data}{data});
        }elsif($encoding eq 'IPv6'){
            $rec_proto_ref->{data}{data} = ipv6_to_str($rec_proto_ref->{data}{data});
        }elsif($encoding eq 'Int'){
            $rec_proto_ref->{data}{data} = unpack("N", $rec_proto_ref->{data}{data});
        }elsif($encoding eq 'UUID'){
            $rec_proto_ref->{data}{data} = uuid_to_str($rec_proto_ref->{data}{data});
        }elsif($encoding eq 'MAC'){
            $rec_proto_ref->{data}{data} = mac_to_str($rec_proto_ref->{data}{data});
        }
    }
}

#####################################################
# Data record type -> template mapping.
# Used to parse $TYPE_DATA records into hashes
#####################################################
our $data_record_map = {
    $RECORD_EVENT                       => undef, #special case
    $RECORD_EVENT2                      => undef, #special case
    $RECORD_PACKET                      => $SFRecords::packet_record,
    $RECORD_CLASSIFICATION              => $SFRecords::classification_record,
    $CLASSIFICATION_V2                  => $SFRecords::id_uuid_record,
    $RECORD_PRIORITY                    => $SFRecords::priority_record,
    $RECORD_RULE                        => $SFRecords::rule_record,
    $SIGNATURE_MESSAGE_V2               => $SFRecords::rule_2_record,
    $RECORD_RNA                         => $SFRecords::rna_event_record,
    $RECORD_POLICY_EVENT                => $$SFRNABlocks::rna_blocks[19],
    $RECORD_IMPACT_EVENT                => undef,
    $POLICY_EVENT_V2                    => $$SFRNABlocks::rna_blocks[33],
    $POLICY_EVENT_V3                    => undef, #special case
    $POLICY_EVENT_V5                    => $$SFRNABlocks::rna_blocks[84],
    $POLICY_EVENT_V6                    => undef, #special case
    $RNA_FINGERPRINT                    => $SFRecords::rna_fingerprint_record,
    $RNA_CLIENT_APPLICATION             => $SFRecords::metadata_record,
    $RNA_CLIENT_APPLICATION_TYPE        => $SFRecords::metadata_record,
    $RNA_VULNERABILITY                  => $SFRecords::vuln_record,
    $RNA_CRITICALITY                    => $SFRecords::metadata_record,
    $RNA_NETWORK_PROTOCOL               => $SFRecords::metadata_record,
    $RNA_ATTRIBUTE                      => $SFRecords::metadata_record,
    $RNA_SCAN_TYPE                      => $SFRecords::metadata_record,
    $USERS                              => $SFRecords::metadata_record,
    $RNA_SERVICE                        => $SFRecords::metadata_record,
    $DETECTION_ENGINE                   => $SFRecords::metadata_record,
    $DETECTION_ENGINE_V2                => $SFRecords::de_metadata_2_record,
    $COMPLIANCE_POLICY                  => $SFRecords::id_uuid_record,
    $COMPLIANCE_RULE                    => $SFRecords::compliance_rule_record,
    $RECORD_NEW_HOST                    => $SFRecords::rna_event_record,
    $RNA_EVENT_NEW_TCP_SERVICE          => $SFRecords::rna_event_record,
    $RNA_EVENT_NEW_UDP_SERVICE          => $SFRecords::rna_event_record,
    $RNA_EVENT_NEW_NET_PROTOCOL         => $SFRecords::rna_event_record,
    $RNA_EVENT_NEW_XPORT_PROTOCOL       => $SFRecords::rna_event_record,
    $RNA_EVENT_NEW_CLIENT_APP           => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_TCP_SERVICE_INFO  => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_UDP_SERVICE_INFO  => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_OS                => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_HT_TIMEOUT        => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_HT_REMOVE         => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_HT_ANR_DELETE     => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_HOPS              => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_TCP_PORT_CLOSED   => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_UDP_PORT_CLOSED   => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_TCP_PORT_TIMEOUT  => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_UDP_PORT_TIMEOUT  => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_MAC_INFO          => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_MAC_ADD           => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_HOST_IP           => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_HOST_UPDATE       => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_HOST_TYPE         => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_VULN_MAP          => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_FLOW_STATS        => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_VLAN_TAG          => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_CLIENT_APP_TIMEOUT=> $SFRecords::rna_event_record,
    $RNA_EVENT_USER_VULN_VALID          => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_VULN_INVALID        => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_DELETE_ADDR         => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_DELETE_SERVICE      => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_SET_CRIICALITY      => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_NETBIOS_NAME      => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_HT_DROPPED        => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_BANNER_UPDATE     => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_ADD_ATTRIBUTE       => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_UPDATE_ATTRIBUTE    => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_DELETE_ATTRIBUTE    => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_SET_ATTRIBUTE_VALUE => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_DELETE_ATTRIBUTE_VALUE      => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_TCP_SERVICE_CONFIDENCE    => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_UDP_SERVICE_CONFIDENCE    => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_OS_CONFIDENCE     => $SFRecords::rna_event_record,
    $RNA_EVENT_FLOW_FLOW_STATS          => $SFRecords::rna_event_record,
    $RNA_EVENT_FLOW_FLOW_CHUNK          => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_SET_OS              => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_SET_SERVICE         => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_DELETE_PROTOCOL     => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_DELETE_CLIENT_APP   => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_DELETE_ADDR_V2      => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_DELETE_SERVICE_V2   => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_VULN_VALID_V2       => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_VULN_INVALID_V2     => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_SET_CRITICALITY_V2  => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_SET_ATTRIBUTE_VALUE_V2      => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_DELETE_ATTRIBUTE_VALUE_V2   => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_ADD_HOST            => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_ADD_SERVICE         => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_ADD_CLIENT_APP      => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_ADD_PROTOCOL        => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_ADD_SCAN_RESULT     => $SFRecords::rna_event_record,
    $RNA_SOURCE_TYPE                    => $SFRecords::metadata_record,
    $RNA_SOURCE_APP                     => $SFRecords::metadata_record,
    $RUA_EVENT_CHANGE_USER_DROPPED      => $SFRecords::rna_event_record,
    $RUA_EVENT_CHANGE_USER_REMOVE       => $SFRecords::rna_event_record,
    $RUA_EVENT_NEW_USER_ID              => $SFRecords::rna_event_record,
    $RUA_EVENT_CHANGE_USER_LOGIN        => $SFRecords::rna_event_record,
    $RNA_SOURCE_DETECTOR                => $SFRecords::metadata_record,
    $RUA_USER_ID                        => $SFRecords::rua_user_record,
    $IDS_EVENT_MPLS                     => $SFRecords::event_record,
    $IDS_EVENT_IPV6_MPLS                => $SFRecords::event_record,
    $RNA_EVENT_NEW_OS                   => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_IDENTITY_CONFLICT => $SFRecords::rna_event_record,
    $RNA_EVENT_CHANGE_IDENTITY_TIMEOUT  => $SFRecords::rna_event_record,
    $IDS_EVENT_VLAN                     => $SFRecords::event_record,
    $IDS_EVENT_IPV6_VLAN                => $SFRecords::event_record,
    $SCAN_VULNERABILITY                 => $SFRecords::scan_vuln_record,
    $RNA_EVENT_CHANGE_CLIENT_APP_UPDATE => $SFRecords::rna_event_record,
    $RNA_PAYLOAD_TYPE                   => $SFRecords::metadata_record,
    $RNA_PAYLOAD                        => $SFRecords::metadata_record,
    $EXTRA_DATA                         => $$SFRNABlocks::other_blocks[4],
    $EXTRA_DATA_TYPE                    => $$SFRNABlocks::other_blocks[5],
    $RUA_EVENT_FAILED_USER_LOGIN        => $SFRecords::rna_event_record,
    $ZONE_NAME                          => $$SFRNABlocks::other_blocks[14],
    $INTERFACE_NAME                     => $$SFRNABlocks::other_blocks[14],
    $FW_POLICY_NAME                     => $$SFRNABlocks::other_blocks[14],
    $IDS_POLICY_NAME                    => $$SFRNABlocks::other_blocks[14],
    $FILE_POLICY_NAME                   => $$SFRNABlocks::other_blocks[14],
    $FW_RULE_ID                         => $$SFRNABlocks::other_blocks[15],
    $FW_RULE_ACTION                     => $SFRecords::metadata_record,
    $FW_URL_CATEGORY                    => $SFRecords::metadata_record,
    $FW_URL_REPUTATION                  => $SFRecords::metadata_record,
    $SENSOR                             => $SFRecords::metadata_record,
    $IDS_EVENT_NG                       => $SFRecords::event_ng_record,
    $IDS_EVENT_IPV6_NG                  => $SFRecords::event_ipv6_ng_record,
    $FW_RULE_REASON                     => $$SFRNABlocks::other_blocks[21],
    $FIREAMP_EVENT                      => undef, # special case
    $FIREAMP_CLOUD_NAME                 => $$SFRNABlocks::other_blocks[14],
    $FIREAMP_EVENT_TYPE                 => $SFRecords::metadata_record,
    $FIREAMP_EVENT_SUBTYPE              => $SFRecords::metadata_record,
    $FIREAMP_DETECTOR_TYPE              => $SFRecords::metadata_record,
    $FIREAMP_FILE_TYPE                  => $SFRecords::metadata_record,
    $ICMP_TYPE                          => $$SFRNABlocks::other_blocks[19],
    $ICMP_CODE                          => $$SFRNABlocks::other_blocks[20],
    $IPREP_CATEGORY                     => $$SFRNABlocks::other_blocks[22],
    $IPREP_SRCDEST                      => $SFRecords::metadata_record,
    $FILELOG_EVENT                      => undef,
    $FILELOG_MALWARE_EVENT              => undef,
    $FILELOG_FILE_TYPE                  => $SFRecords::metadata_record,
    $IPS_EVENT                          => undef,
    $FILELOG_SHA                        => undef,
    $GEOLOCATION                        => $$SFRNABlocks::other_blocks[28],
    $RNA_EVENT_IOC_SET                  => $SFRecords::rna_event_record,
    $IOC_NAME                           => $$SFRNABlocks::other_blocks[39],
    $RNA_EVENT_USER_IOC_DELETE          => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_IOC_ENABLE          => $SFRecords::rna_event_record,
    $RNA_EVENT_USER_IOC_DISABLE         => $SFRecords::rna_event_record,
    $FILELOG_STORAGE                    => $SFRecords::metadata_record,
    $FILELOG_SANDBOX                    => $SFRecords::metadata_record,
    $FILELOG_SPERO                      => $SFRecords::metadata_record,
};

# lookup hash of rec_types that use rna-style blocks but should be looked up in the
# other_blocks list in RNABlocks.pm because they are not rna blocks
# for a given record type, if the record type value exists as a key, then use
# the value of that key-value pair as the list to look up block definitions in
our $other_data_rec_types = {
    $EXTRA_DATA                         => $SFRNABlocks::other_blocks,
    $EXTRA_DATA_TYPE                    => $SFRNABlocks::other_blocks,
    $ZONE_NAME                          => $SFRNABlocks::other_blocks,
    $INTERFACE_NAME                     => $SFRNABlocks::other_blocks,
    $FW_POLICY_NAME                     => $SFRNABlocks::other_blocks,
    $IDS_POLICY_NAME                    => $SFRNABlocks::other_blocks,
    $FILE_POLICY_NAME                   => $SFRNABlocks::other_blocks,
    $FW_RULE_ID                         => $SFRNABlocks::other_blocks,
    $FW_RULE_REASON                     => $SFRNABlocks::other_blocks,
    $FIREAMP_EVENT                      => $SFRNABlocks::other_blocks,
    $FIREAMP_CLOUD_NAME                 => $SFRNABlocks::other_blocks,
    $IPS_RULE_DOC                       => $SFRNABlocks::other_blocks,
    $ICMP_TYPE                          => $SFRNABlocks::other_blocks,
    $ICMP_CODE                          => $SFRNABlocks::other_blocks,
    $IPREP_CATEGORY                     => $SFRNABlocks::other_blocks,
    $FILELOG_EVENT                      => $SFRNABlocks::other_blocks,
    $FILELOG_MALWARE_EVENT              => $SFRNABlocks::other_blocks,
    $FILELOG_SHA                        => $SFRNABlocks::other_blocks,
    $IPS_EVENT                          => $SFRNABlocks::other_blocks,
    $FILELOG_SHA                        => $SFRNABlocks::other_blocks,
    $GEOLOCATION                        => $SFRNABlocks::other_blocks,
    $IOC_NAME                           => $SFRNABlocks::other_blocks,
};

#####################################################
# Subs
#####################################################

#####################################################
# sub is_rna_rec_type($):
# Determines if a given feed is an rna record
#
# Parameters:
# $rec is a record ref
#
# Returns:
# true if it is an RNA record, false otherwise
#####################################################

sub is_rna_rec_type($){
    my $rec = shift;
    return $rec->{header}{msg_type} == $TYPE_DATA && defined $data_record_map->{$rec->{rec_type}} && $data_record_map->{$rec->{rec_type}} == $SFRecords::rna_event_record;
}

###############################################################
# sub get_feed($):
# handles the cooridnation of identifying a record and converting it
# to a data record that is useful to us humans
#
# Parameters:
# $fh is a handle to the socket supplying the data
#
# Returns:
# An appropriate record hash, reference $hash->{rec_type} to see
# what kind of record and $hash->{order} to know what useful
# fields are there
#
# JRB - any data left after parsing the block is placed
# into the element data_left of the hash
# This element is not used for anything unless you are working
# with RNA data and it will be some type of data block
# containing additional information
###############################################################

sub get_feed($) {
    my $fh = $_[0];
    my $ret = {};
    my $len;
    my $data_left = undef;
    my @rec_list;
    my @ret_list;

    debug("In get_feed");

    # loop until we get a valid list of records
    while($#ret_list < 0){
        my $record = dclone($SFRecords::record);
        get_record($record, $fh);

        if($record->{'version'} eq $HEADER_VERSION_ONE){
            debug("It is a VERSION ONE protocol");
        }else {
            debug("Got an unsupported version of data from the server - $record->{'version'}" );
        }

        ack_data($fh);

        #check if this is a bundled record
        if($record->{'msg_type'} == $TYPE_UNIFIED2_UEC_BUNDLE){
            debug("Got a bundled record");
            # get a list of data records from the bundle
            @rec_list = get_bundled_records($record);
        }else{
            # this is a single record, push it to the list.
            push(@rec_list, $record);
        }

        #loop over all the records in the list
        foreach my $rec (@rec_list) {
            $ret = undef;
            if($rec->{msg_type} == $TYPE_DATA){
                debug("It is a DATA Record");
                my $type = $rec->{rec_type};
                if(!exists $$data_record_map{$type}){
                    debug("Got unknown record type ($type) while attempting to parse.");
                }elsif($type == $POLICY_EVENT_V3 || $type == $POLICY_EVENT_V6){
                    # Use block ids to determine how to decode policy events
                    ($ret, $len) = get_block_record($rec->{rec_data});
                }elsif($type == $FIREAMP_EVENT || $type == $FILELOG_EVENT || $type == $FILELOG_MALWARE_EVENT || $type == $FILELOG_SHA){
                    # Use block to determine how to decode fireamp, filelog and filelog_malware events
                    ($ret, $len) = get_block_record($rec->{rec_data}, $SFRNABlocks::other_blocks);
                }elsif($type == $RECORD_EVENT || $type == $RECORD_EVENT2){
                    # the IDS event structure was changed without changing the id must
                    # use record length to determine which structure to use.
                    if($rec->{rec_length} == 52){
                        $ret = dclone($SFRecords::event_record);
                    }else{
                        $ret = dclone($SFRecords::event_v2_record);
                    }
                }elsif($type == $IPS_EVENT){
                    # Use block to determine how to decode new IPS
                    ($ret, $len) = get_block_record($rec->{rec_data}, $SFRNABlocks::other_blocks);
                }elsif($type == $RECORD_IMPACT_EVENT){
                    ($ret, $len) = get_block_record($rec->{rec_data});
                }else{
                    $ret = dclone($$data_record_map{$type});
                }
            } elsif(($rec->{msg_type} == $TYPE_HOST_DATA) || ($rec->{msg_type} == $TYPE_MULTI_HOST_DATA)){
                # Possible NULL messages for marking end of Multi host request
                if ($rec->{rec_length} > 0){
                    ($ret, $len) = get_block_record($rec->{rec_data});
                } else {
                    $ret->{rec_type}    = $rec->{rec_type};
                    $ret->{rec_length}  = $rec->{rec_length};
                }
            } elsif(($rec->{msg_type} == $TYPE_RULE_DOC_DATA)){
                ($ret, $len) = get_block_record($rec->{rec_data},$SFRNABlocks::other_blocks);
            } elsif($rec->{msg_type} == $TYPE_ERROR){
                debug("Got an error record");
                $ret = dclone($SFRecords::error_record);
            } elsif($rec->{msg_type} == $TYPE_NULL){
                debug("Got a NULL record");
            } elsif($rec->{msg_type} == $TYPE_UEC_STREAM_INFO){
                debug("Got a UEC STREAM INFO record");
                send_req($fh, build_service_req($rec));
            } else{
                debug("Don't know what type of data this is" . $rec->{'msg_type'});
            }

            if(defined $ret){
                $ret->{header}      = $rec;
                $ret->{rec_type}    = $rec->{rec_type};
                $ret->{rec_length}  = $rec->{rec_length};
                if($ret->{rec_length} > 0){
                    if (exists $other_data_rec_types->{$rec->{'rec_type'}}) {
                        $ret->{data_left} = parse_block($rec->{'rec_data'}, $ret, $other_data_rec_types->{$rec->{'rec_type'}});
                    } else {
                        $ret->{data_left} = parse_block($rec->{'rec_data'}, $ret);
                    }
                }
                push(@ret_list, $ret);
            }
        } #end of foreach loop
    }#end of while loop

    return @ret_list;
}

###############################################################
# JRB - 2.01 Support RNA Data Types
###############################################################
# sub parse_rna_record($):
# This thing does foo with bar and actually makes bar usable to humans
# relative to RNA data blocks or simple data types
#
# Parameters:
# $record_ref is a reference to the record that will be modified
# $raw_data is a chunk of data which is to be handled
#
# Returns:
# Populated hashref of subtype data block
# Sets host block data_left to contain any data remaining
#
# TODO: Nothing at the moment
###############################################################

sub parse_rna_record($) {
    my $record_ref = $_[0];
    my $block = {};
    my $data_left = undef;
    my $block_type = undef;
    my $block_len = undef;
    my $list_left = undef;
    my %tcp_svcs = {};

    debug("In parse_rna_record");

    if ( $record_ref->{'event_type'} == $RNA_TYPE_NEW ) {
        if ( $record_ref->{'event_subtype'} == $RNA_NEW_TRANSPORT_PROTO )
        {
            debug("Got a new transport protocol subtype");
            # transport proto is a one byte field at the end of an rna event record
            # Just assign it
            $block->{'order'} = ['transport_proto'];
            $block->{'transport_proto'} = unpack('c',$record_ref->{'data_left'});
            $data_left = '';
        }
        elsif ( $record_ref->{'event_subtype'} == $RNA_NEW_NET_PROTO )
        {
            debug("Got a new transport protocol subtype");
            # net proto is a two byte field at the end of an rna event record
            # Just assign it
            $block->{'order'} = ['network_proto'];
            $block->{'network_proto'} = unpack('n',$record_ref->{'data_left'});
            $data_left = '';
        }
        elsif ( $record_ref->{'event_subtype'} == $RNA_NEW_IP_TRAFFIC )
        {
            debug("Got a new ip traffic subtype");
            # XXX - does this event ever happen? Docs do not have an entry for it in the new section
            warn("Seen new ip traffic");
        }
        else
        {
            ($block, $data_left) = parse_block_auto($record_ref->{'data_left'});
        }
    }
    elsif ( $record_ref->{'event_type'} == $RNA_TYPE_CHANGE )
    {
        if ( $record_ref->{'event_subtype'} == $RNA_IP_CHANGED )
        {
            debug("Got a ip changed subtype");
            # IP Address is a single field at the end of a RNA record
            # Use length to autodetect IPv4 vs IPv6
            $block->{'order'} = ['ip_address'];
            my $len = length($record_ref->{'data_left'});
            if($len == 4){
                $block->{'ip_address'} = inet_ntoa($record_ref->{'data_left'});
            }elsif($len == 16){
                $block->{'ip_address'} = ipv6_to_str($record_ref->{'data_left'});
            }
            $data_left = '';
        }
        elsif ( $record_ref->{'event_subtype'} == $RNA_IP_REUSED )
        {
            debug("Got a ip reused subtype");
            # There is nothing to do with this record
        } elsif ( $record_ref->{'event_subtype'} == $RNA_HOPS_CHANGED ) {
            debug("Got a hops changed subtype");
            # A 1 byte field after an RNA record
            # Just fill it in
            $block->{'order'} = ['hops'];
            $block->{'hops'} = unpack('c',$record_ref->{'data_left'});
            $data_left = '';

        }
        elsif ( $record_ref->{'event_subtype'} == $RNA_HOST_TIMEOUT )
        {
            debug("Got a host timeout subtype");
            # There is nothing to do with this record
        }
        elsif ( ( $record_ref->{'event_subtype'} == $RNA_TCP_PORT_CLOSE   ) ||
                ( $record_ref->{'event_subtype'} == $RNA_UDP_PORT_CLOSE   ) ||
                ( $record_ref->{'event_subtype'} == $RNA_TCP_PORT_TIMEOUT ) ||
                ( $record_ref->{'event_subtype'} == $RNA_UDP_PORT_TIMEOUT ) ) {
            debug("Got a tcp/udp port closed/timeout subtype");
            # a 2 byte field at the end of an RNA record
            $block->{'order'} = ['port'];
            $block->{'port'} = unpack('n',$record_ref->{'data_left'});
            $data_left = '';

        } elsif ( ( $record_ref->{'event_subtype'} == $RNA_MAC_CHANGE ) ||
                ( $record_ref->{'event_subtype'} == $RNA_ADDITIONAL_MAC ) ) {
            debug("Got a mac change subtype");
            # pre-pack type/length fields to let the auto-decoder work
            my $len = length($record_ref->{'data_left'});
            if($len == 8){
                $record_ref->{'data_left'} = pack('N',5) . pack('N',16) . $record_ref->{'data_left'};
            }elsif($len == 12){
                $record_ref->{'data_left'} = pack('N',95) . pack('N',20) . $record_ref->{'data_left'};
            }
            ($block, $data_left) = parse_block_auto($record_ref->{'data_left'});

        }
        elsif ( $record_ref->{'event_subtype'} == $RNA_HOST_ROUTER_BRIDGE )
        {
            debug("Got a host identified as a router bridge subtype");
            # The host type is a single field at the end of an RNA record
            # just fill it in
            $block->{'order'} = ['host_type'];
            $block->{'host_type'} = unpack('N',$record_ref->{'data_left'});
            $data_left = '';
        } elsif ( $record_ref->{'event_subtype'} == $RNA_HOST_DELETED_LIMIT ) {
           debug("Got a host deleted subtype");
           # There is nothing to do with this record
        }
        else
        {
            ($block, $data_left) = parse_block_auto($record_ref->{'data_left'});
        }
    }elsif($record_ref->{'event_type'} == $RNA_TYPE_FLOW){
        ($block, $data_left) = parse_block_auto($record_ref->{'data_left'});
    }elsif($record_ref->{'event_type'} == $RNA_TYPE_USER_INPUT){
        ($block, $data_left) = parse_block_auto($record_ref->{'data_left'});
    }elsif($record_ref->{'event_type'} == $RUA_TYPE){
        ($block, $data_left) = parse_block_auto($record_ref->{'data_left'});
    }elsif($record_ref->{'event_type'} == $IOC_TYPE){
        ($block, $data_left) = parse_block_auto($record_ref->{'data_left'});
    } else {
        debug("Got an unknown RNA record type $record_ref->{'event_type'}, abandoning parse.");
        $data_left = '';
    }
    $record_ref->{'data_left'} = $data_left;

    return $block;
}  # end parse_rna_record

###############################################################
# sub parse_block($$):
# This thing does foo with bar and actually makes bar usable to humans
# See the notes where the record structures are defined to understand
# the foo and bar interaction.
#
# Parameters:
# $data is a string containing the data that will be parsed
# to contain the human readable data
# $rec_proto_ref is a reference to the record prototypes defined
# above that tell this thing what it is going to do.  It will be modified
# in place to contain the data it describes.  (Yes, I know this is weird).
#
# Returns:
# any data remaining in the record,
# modifies a hash by reference
#
# TODO: Move everything over to using this parser since it is now fully
# generic and defined by the hash
#
###############################################################

sub parse_block($$;$) {
    my $data = $_[0];
    my $rec_proto_ref = $_[1];
    my $block_def_list = $_[2];
    my $pos = 0;
    my $size = 0;

    debug("In parse_block");
    debug("data length: ".length($data));
    foreach my $key ( @{$rec_proto_ref->{'order'}} ) {
        debug("Handling key: " . $key );
        debug("Position is: " . $pos);
        if ( defined $rec_proto_ref->{'byte_order'}{$key} ) {
            $size = length(pack($rec_proto_ref->{'byte_order'}{$key},0));
            debug("Data Size is: " . $size);
            my $value = substr($data, $pos, $size);
            $rec_proto_ref->{$key} = unpack($rec_proto_ref->{'byte_order'}{$key},$value);
            debug("Data is: " . $rec_proto_ref->{$key});
        } else {
            debug("Falling Through, Checking for map");
# Things that are not defined in byte_order
# Can be defined in map as a pointer to the field containing a size,
# use eval to transform the data as needed.
            my $map = $rec_proto_ref->{'map'}{$key};
            if (defined $map) {
                debug("map is $map.");
                # This will not work for sizes < 1 but we don't care.
                if (int($map) != 0) {
                    debug("map translates to a non 0 value assuming size");
                    $size = $rec_proto_ref->{'map'}{$key};
                    debug("Data Size is: $size");
                    $rec_proto_ref->{$key} = substr($data, $pos, $size);
                }else{
                    debug("map translates to a 0 value...");
                    if($map eq "BLOCK"){
                        # This element is a single RNA subblock.
                        debug("Treating as RNA block");
                        my $block_data = substr($data, $pos);
                        my ($block, $data_left);
                        ($block, $data_left, $size) = parse_block_auto($block_data, $block_def_list);
                        $rec_proto_ref->{$key} = $block;
                    }elsif($map eq "LIST"){
                        # This element is an array of RNA subblocks.
                        # This is only called from inside a list block (11, 31).
                        # It means that all the rest of the data in this block
                        # is subblocks.
                        debug("Treating as RNA block array");

                        $size = length($data) - $pos;
                        my $sub_list_data = substr($data, $pos, $size);
                        my @sub_list = ();
                        while(length($sub_list_data) > 0){
                            my $block;
                            ($block, $sub_list_data) = parse_block_auto($sub_list_data, $block_def_list);
                            push @sub_list, $block;
                        }
                        $rec_proto_ref->{$key} = \@sub_list;
                    }elsif($map =~ m/(.+)\?(.+)/){
                        # This uses another field as a boolean value to 
                        # decide if the length is 0 or X
                        # Example:
                        # 'has_ipv6?16'
                        # If has_ipv6 is set, the length is 16
                        debug("Treating as a conditional variable");
                        my $condition = $rec_proto_ref->{$1};
                        debug("Field '$1' has value $condition");
                        if($condition){
                            $size = $2;
                        }else{
                            $size = 0;
                        }
                        debug("Data Size is: $size");
                        $rec_proto_ref->{$key} = substr($data, $pos, $size);
                    }else{
                        # This element is string data
                        debug("Treating as string");
                        $size = $rec_proto_ref->{$map};
                        debug("Data Size is: $size");
                        $rec_proto_ref->{$key} = substr($data, $pos, $size);
                    }
                }
            } else {
# We should never actually get here unless the record prototype
# is somehow messed up and a byte_order, or map is not defined
                die "Missing map for key $key? Did you forget to define the byte_order or map?";
            }
        }
        $pos += $size;
# Do any modifications to the value if needed
        if ( defined $rec_proto_ref->{'eval'}{$key} ) {
            my $value = $rec_proto_ref->{$key};
            $rec_proto_ref->{$key} = eval $rec_proto_ref->{'eval'}{$key};
        }
    }

    # The Extra Data type conversions need a little more state than
    # can be accessed in the 'eval' blocks.
    if($rec_proto_ref->{name} eq 'Unified2ExtraDataType'){
        learn_extra_data_metadata($rec_proto_ref);
    }elsif($rec_proto_ref->{name} eq 'Unified2ExtraData'){
        extra_data_to_str($rec_proto_ref);
    }

    return substr($data, $pos, length($data) - $pos);
} # parse_block

# deduce which rna block record this data is
sub get_block_record{
    my ($data, $block_def_list) = @_;
    my $btype = unpack('N',substr($data,0,4));
    my $blen = unpack('N',substr($data,4,4));
    my $block;
    if (defined $block_def_list) {
        $block = $$block_def_list[$btype];
    } else {
        $block = $$SFRNABlocks::rna_blocks[$btype];
    }

    if(defined $block){
        debug("block is of type $block->{name} ($btype) length $blen.");
        $block = dclone($block);
    }else{
        debug("Got unknown block type ($btype) while attempting to parse.");
    }
    return ($block, $blen);
}

# deduce what type a block is and then parse it
sub parse_block_auto{
    my ($data, $block_def_list) = @_;
    my $data_left;

    my ($block, $blen) = get_block_record($data, $block_def_list);
    if(defined($block)){
        my $block_data = substr($data, 0, $blen);
        $data_left = parse_block($block_data, $block, $block_def_list);
        if(length $data_left){
            debug("block type $block->{name} ($block->{index}) did not use all of its data");
        }
        $data_left = substr($data, $blen);
    }else{
        $data_left = '';
    }

    return ($block, $data_left, $blen);
}

###############################################################
# sub get_record($$):
# Reads a complete record from the server
#
# Parameters:
# $record_ref is a reference to a hash containing the record
# prototype.
#
# $fh is a handle to the socket supplying the data
#
# Returns:
# Nothing, modifies the hash passed in record_ref
#
# TODO: Nothing as long as protocol versions continue to
# use first 8 bytes of record data to define type and length
#
# HMM: Null records would just keep going and people would get
# confused since nothing was being returned. This should fix
# That and people should be able to see they got a null record
###############################################################
my $U2R_EXTENDED_HEADER_BIT = 0x80000000;
sub get_record($$) {
    my $record_ref = $_[0];
    my $fh = $_[1];
    my $wire_data = undef;

    debug("In get_record");
    $wire_data = get_wire_data($fh,8);
    $record_ref->{'version'}     = unpack('n', substr($wire_data,0,2));
    $record_ref->{'msg_type'}    = unpack('n', substr($wire_data,2,2));
    $record_ref->{'msg_length'}  = unpack('N', substr($wire_data,4,4));

    debug( "message version: ".$record_ref->{'version'} );
    debug( "message type: ".$record_ref->{'msg_type'} );
    debug( "message length: ".$record_ref->{'msg_length'} );
    # if it is a null record There is nothing to get
    if ( $record_ref->{'msg_length'} > 0 ) {
        $wire_data = get_wire_data($fh, $record_ref->{'msg_length'});
    }

    if ($record_ref->{'msg_length'} > 0 && $record_ref->{'msg_type'} == $TYPE_DATA)
    {
        $record_ref->{'rec_type'}   = unpack('N', substr($wire_data,0,4));
        if($record_ref->{'rec_type'} & $U2R_EXTENDED_HEADER_BIT)
        {
            $record_ref->{'rec_type'} &= ~$U2R_EXTENDED_HEADER_BIT;
            debug( "Extended header bit is set ->type ".$record_ref->{'rec_type'});
        }
        $record_ref->{'rec_length'} = unpack('N', substr($wire_data,4,4));

        #should evaluate if the header is extended and we need another 8 bytes for archive timestamp and checksum
        # Due to a bug, msg and rec may have same length.
        if($record_ref->{'msg_length'} == 8 + $record_ref->{'rec_length'} ||
            $record_ref->{'msg_length'} == $record_ref->{'rec_length'})
        {
            $record_ref->{'archive_timestamp'} = 0;
            $record_ref->{'checksum'}   = 0;
            $record_ref->{'rec_data'}   = substr($wire_data,8,$record_ref->{'rec_length'});
        }
        elsif($record_ref->{'msg_length'} == 16 + $record_ref->{'rec_length'})
        {
            $record_ref->{'archive_timestamp'} = unpack('N', substr($wire_data,8,4));
            $record_ref->{'checksum'}   = unpack('N', substr($wire_data,12,4));
            $record_ref->{'rec_data'}   = substr($wire_data,16,$record_ref->{'rec_length'});
        }
        else
        {
            warn "INVALID LENGTH $record_ref->{'msg_length'}"." EXPECTED $record_ref->{'rec_length'} plus 8 or 16";
            $record_ref->{'rec_type'} = 0;
            $record_ref->{'rec_length'} = 0;
            $record_ref->{'rec_data'} = '';
            $record_ref->{'archive_timestamp'} = 0;
            $record_ref->{'checksum'}   = 0;
        }

    }
    elsif ($record_ref->{'msg_length'} > 0 &&
        $record_ref->{'msg_type'} == $TYPE_HOST_DATA ||
        $record_ref->{'msg_type'} == $TYPE_MULTI_HOST_DATA ||
        $record_ref->{'msg_type'} == $TYPE_RULE_DOC_DATA)
    {
        $record_ref->{'rec_type'} = 0;
        $record_ref->{'rec_length'} = $record_ref->{'msg_length'};
        $record_ref->{'rec_data'} = $wire_data;
        $record_ref->{'archive_timestamp'} = 0;
        $record_ref->{'checksum'}   = 0;
    }
    elsif($record_ref->{'msg_length'} > 0 && $record_ref->{'msg_type'} == $TYPE_UEC_STREAM_INFO)
    {
        debug("Received UEC Stream Information record");
        $record_ref->{'rec_data'} = $wire_data;
    }
    elsif($record_ref->{'msg_length'} > 0 && $record_ref->{'msg_type'} == $TYPE_UNIFIED2_UEC_BUNDLE)
    {
        debug("Received bundled record");
        $record_ref->{'rec_length'} = $record_ref->{'msg_length'};
        $record_ref->{'rec_data'} = $wire_data;
    }
    else
    {
        $record_ref->{'rec_type'} = 0;
        $record_ref->{'rec_length'} = 0;
        $record_ref->{'rec_data'} = '';
        $record_ref->{'archive_timestamp'} = 0;
        $record_ref->{'checksum'}   = 0;
    }
}

###############################################################
# sub get_wire_data($$) {
# Reads specified amount of data from the handle passed
#
# Parameters:
# $filehandle is a handle
# $how_much is the number of bytes to get
#
# Returns: Data read or undef if there was an error
#
#
# TODO:
#
###############################################################
sub get_wire_data($$) {
    my $filehandle = $_[0];
    my $how_much = $_[1];
    my $ret = '';
    my $left = $how_much;
    debug("in get_wire_data");
    while($left){
        my $data;
        my $nbytes = sysread($filehandle, $data, $left);
        if(!defined $nbytes){
            die "Error reading from socket: $!";
        }elsif($nbytes == 0){
            # 0 bytes means EOF
            die "Remote host closed socket";
        }
        debug("get_wire_data - got " . $nbytes . " bytes (wanted $left)");
        $ret .= $data;
        $left -= $nbytes;
    }
    if ( $debug ) { log_data($debug_log . ".in", $ret); }
    return $ret;
}

###############################################################
# sub send_req($$) {
# Writes data passed to handle passed
#
# Parameters:
# $handle is the Handle to write to
# $req is the data to write
#
# Returns: The results
#
# TODO:
###############################################################
sub send_req($$) {
    my $handle = $_[0];
    my $req = $_[1];
    if ( $debug ) { log_data($debug_log . ".out", $req); }
    syswrite($handle, $req, length($req));
}

###############################################################
# sub log_data($$) {
# Writed data passed in raw form to the file specified
#
# Parameters:
# $outfile is the file to write to
# $data is the actual data
#
# Returns: undef if there was an error
#
# TODO:
###############################################################
sub log_data($$) {
    my $outfile = $_[0];
    my $data = $_[1];
    open(FH, ">>$outfile") || return undef;
    print FH $data;
    close FH;
}

###############################################################
# sub build_req($$$$) {
# Builds a request record
#
# Parameters:
# $version is the protocol version to use
# $type is the request type being sent
# $timestamp is the start of time we are requesting from
# $flags are the flage to use in the request
#
# Returns: The request suitable for transmission to the
# estreamer server
#
###############################################################
sub build_req($$$$) {
    my $version = pack('n', $_[0]);
    my $type = pack('n', $_[1]);
    my $timestamp = pack('N', $_[2]);
    my $flags = pack('N', $_[3]);

    my $size = pack('N', length($timestamp.$flags));

# Save the timestamp and flag
    $init_timestamp = $_[2];
    $init_flags     = $_[3];

    if ( $debug ) {
        debug("In build_req");
        debug("Version:".unpack('n',$version));
        debug("Type:".unpack('n', $type));
        debug("Size:".unpack('N',$size));
        debug("Timestamp:".unpack('N',$timestamp));
        debug("Flags:".unpack('N',$flags));
    }

    return $version . $type . $size . $timestamp . $flags;
}

###############################################################
# sub build_host_req()
# Builds an RNA Host request record
#
# Parameters:
# $type - single or multiple host request
# $flags - include host notes and/or service banners
# $ip_start - IP of the host request, or first IP in range
# $ip_end - last IP in range
#
# Returns:  The RNA Host request suitable for transmission to the
# estreamer server.
###############################################################
sub build_host_req
{
    my $version = $HEADER_VERSION_ONE;
    my $type = $TYPE_HOST_REQUEST;
    my $data_type = $_[0];
    my $flags = $_[1];
    my $start_ip = $_[2];
    my $end_ip = $_[3];
    my ($pkt_hdr, $size, $start_ip_obj, $end_ip_obj);

    if ( $debug ) {
        debug("In build_host_req");
        debug("Version:".$version);
        debug("Type:".$type);
        debug("data_type:".$data_type);
        debug("start ip:".$start_ip);
        debug("end ip:".$end_ip);
        debug("Flags:".$flags);
        debug("Size:".$size);
    }

    if($data_type <= $FLAG_HOST_MULTI_V5){
        # Legacy host requests are IPv4 addresses
        $size = 20;

        $start_ip_obj = NetAddr::IP->new($start_ip) or die "Unable to parse $start_ip";
        $end_ip_obj = NetAddr::IP->new($end_ip) or die "Unable to parse $end_ip";
    }else{
        # Starting with V6 hosts requests we do IPv6 addresses
        $size = 44;

        # fill IPv4 addresses to IPv6 mapped format
        if($start_ip !~ /:/){
            $start_ip = "::ffff:$start_ip";
        }
        if($end_ip !~ /:/){
            $end_ip = "::ffff:$end_ip";
        }
        $start_ip_obj = NetAddr::IP->new6($start_ip) or die "Unable to parse $start_ip";
        $end_ip_obj = NetAddr::IP->new6($end_ip) or die "Unable to parse $end_ip";
    }

    $pkt_hdr = pack("nnNNN", $version, $type, $size, $data_type, $flags);
    $pkt_hdr .= $start_ip_obj->aton();
    $pkt_hdr .= $end_ip_obj->aton();
    $pkt_hdr .= pack("N", 0);

    return $pkt_hdr;
}

###############################################################
# sub build_rule_doc()
# Builds an RNA Host request record
#
# Parameters:
# $type - single or multiple host request
# $flags - include host notes and/or service banners
# $sid - signature ID
# $gid - generator ID
# $rev - revision
#
# Returns:  The rule doc suitable for transmission to the
# estreamer server.
###############################################################
sub build_rule_doc($$$$$)
{
    my $version = $HEADER_VERSION_ONE;
    my $type = $TYPE_HOST_REQUEST;
    my $data_type = $_[0];
    my $flags = $_[1];
    my $sid = $_[2];
    my $gid = $_[3];
    my $rev = $_[4];

    my $size = 20;

    if ( $debug ) {
        debug("In build_rule_doc");
        debug("Version:".$version);
        debug("Type:".$type);
        debug("data_type:".$data_type);
        debug("sid:".$sid);
        debug("gid:".$gid);
        debug("rev:".$rev);
        debug("Flags:".$flags);
        debug("Size:".$size);
    }

    my $pkt_hdr = pack("nnNNNNNN", $version, $type, $size, $data_type, $flags, $sid, $gid, $rev);

    return $pkt_hdr;
}

###############################################################
# sub build_error($$$$) {
# Builds an error Record
#
# Parameters:
# $version is the protocol version to use
# $type is the request type being sent
# $error_code is the error code to send
# $error_msg is the message to send with the error_code
#
# Returns: An error message suitable for transmission to
# the estreamer server
#
# TODO:
###############################################################
sub build_error($$$$) {
    my $version = pack('n', $_[0]);
    my $type = pack('n', $_[1]);
    my $error_code = pack('N', $_[2]);
    my $error_msg = $_[3];
    my $error_length = pack('n', length($error_msg));
    my $size = pack('N', length($error_code . $error_length . $error_msg));

    if ( $debug ) {
        debug("In build_error");
        debug("Version:".$version);
        debug("Type:".$type);
        debug("Size:".$size);
        debug("Error Code:".$error_code);
        debug("Error Size:".$error_length);
        debug("Error Message:".$error_msg);
    }

    return $version . $type . $size . $error_code . $error_length . $error_msg;
}

###############################################################
# sub build_null($$) {
# Builds a null record
#
# Parameters:
# $version and $type are the version and type respectively
#
# Returns: A null message suitable for transmission to the
# server
#
# TODO:
###############################################################
sub build_null($$) {
    my $version = pack('n', $_[0]) || pack('n',$HEADER_VERSION_ONE);
    my $type = pack('n', $_[1]) || pack('n',$TYPE_NULL);
    my $size = pack('N', 0);

    if ( $debug ) {
        debug("In build_null");
        debug("Version:".unpack('n',$version));
        debug("Type:".unpack('n',$type));
        debug("Size:".unpack('N',$size));
    }

    return $version . $type . $size;
}

###############################################################
# sub req_data() {
#
# Parameters:
# $handle = Handle to a connection
# $timestamp = timestamp in unixtime for request - Send all events
# since this time
# $flage = Flags to use in the request
#
# Returns: Nothing
#
# TODO:
#
###############################################################
sub req_data($$$) {
    my $handle = $_[0] || die("Need a connection to a server");
    my $timestamp = $_[1] || 0;
    my $flags = $_[2] || $FLAG_METADATA | $FLAG_PKTS;

    send_req($handle,build_req($HEADER_VERSION_ONE,$TYPE_REQUEST,$timestamp,$flags));

}

###############################################################
# sub req_host()
#
# Parameters:
# $handle = Handle to a connection
# $type = single or multiple host request
# $flags = Flags to use in the request
# $start_ip = IP or start of IP range
# $end_ip = End IP of range
#
# Returns: Nothing
#
# TODO:
#
###############################################################
sub req_host($$$$$)
{
    my $handle = $_[0] || die("Need a connection to a server");
    my $type = $_[1];
    my $flags = $_[2]; # || $FLAG_HOST_NOTES | $FLAG_SERVICE_BANNERS;
    my $start_ip = $_[3];
    my $end_ip = $_[4];

    send_req($handle,build_host_req($type,$flags,$start_ip,$end_ip));
}

###############################################################
# sub req_rule_doc()
#
# Parameters:
# $handle = Handle to a connection
# $type = rule doc
# $flags = Flags to use in the request
# $sid = signature ID
# $gid = generator ID
# $rev = revision
#
# Returns: Nothing
#
# TODO:
#
###############################################################
sub req_rule_doc($$$$$$)
{
    my $handle = $_[0] || die("Need a connection to a server");
    my $type = $_[1];
    my $flags = $_[2];
    my $sid = $_[3];
    my $gid = $_[4];
    my $rev = $_[5];

    send_req($handle,build_rule_doc($type,$flags,$sid,$gid,$rev));
}

###############################################################
# sub ack_data()
#
# Parameters:
# $handle = Handle to a connection
#
# Returns: Nothing
# TODO:
#
###############################################################
sub ack_data($) {
    my $handle = $_[0] || die("Need a connection to a server");
    send_req($handle,build_null($HEADER_VERSION_ONE,$TYPE_NULL));
}


###############################################################
# sub send_error($$$)
#
# Parameters:
# $handle = Handle to a connection
# $number = Error Code
# $msg = Error Message
#
# Returns: Nothing
# TODO:
#
###############################################################
sub send_error($$) {
    my $handle = $_[0] || die("Need a connection to a server");
    my $number = $_[1] || -1;
    my $msg = $_[2] || "Undefined";

    send_req($handle,build_error($HEADER_VERSION_ONE,$TYPE_ERROR,$number,$msg));
}


###############################################################
# sub debug() {
# Prints message passed to STDERR wrapped in line markers
#
# Parameters: $msg is the debug message to print
#
# Returns: Nothing
#
# TODO:
###############################################################
sub debug {
    return if( ! $debug );
    my $msg = $_[0];
    my $package = undef;
    my $filename = undef;
    my $line = undef;
    ($package, $filename, $line) = caller();
    print STDOUT $filename . ":" . $line . " : " . $msg . "\n";
}


###############################################################
# sub build_service_req {
# Process the service request message sent from estreamer server
# when using new request; build a service request and send it to server
#
# Parameters: $brec is the record from server asking more detailed
# information about new services
#
# Returns: a message string that will be sent to server to complete
# the three-way handshake
###############################################################
sub build_service_req {
    my $brec = $_[0];
    my $length = $brec->{'msg_length'};
    my $data = $brec->{'rec_data'};
    my $offset = 0;
    my $services_count = 0;
    my $service_type;
    my $size = 0;            # Message payload size
    # Each service has a header with four 4-byte integers followed by two
    # 2-byte integers for RNA_EVENTS, RNA_FLOW, POLICY_EVENTS and METADATA.
    # also needs to add two more 2-byte integers at the end.

    while($offset < $length)
    {
        my $type = unpack('N', substr($data,$offset,4));
        $offset += 4;
        my $len  = unpack('N', substr($data,$offset,4));
        $offset += 4 + $len;

        # We only care about service SF_ESTREAM
        if($type == 6667)
        {
            $service_type = $type;
            $services_count = 1;
            last;
        }
    }

    if($services_count == 0)
    {
        return;
    }

    #Calculate the payload size
    my $request_count = 0;
    my $request_data = '';

    #######################################################################
    # The version of event types are set in the second request. New flags
    # have to be set here in the second request. Old flags could be set in
    # the old(first) request. But they will be overwritten here if present.
    # RNA events first
    if($main::OUTPUT_PLUGIN->{rna_events_ver}){
        $request_data .= pack('nn', $main::OUTPUT_PLUGIN->{rna_events_ver}, $REQ_SEND_RNA_EVENTS);
        $request_count++;
    }
    # RNA flow
    if($main::OUTPUT_PLUGIN->{rna_flow_ver}) {
        $request_data .= pack('nn', $main::OUTPUT_PLUGIN->{rna_flow_ver}, $REQ_SEND_RNA_FLOW);
        $request_count++;
    }
    # Policy events
    if ($main::OUTPUT_PLUGIN->{policy_events_ver}){
        $request_data .= pack('nn', $main::OUTPUT_PLUGIN->{policy_events_ver}, $REQ_SEND_POLICY_EVENTS);
        $request_count++;
    }
    # Metadata
    if($main::OUTPUT_PLUGIN->{flags} & $FLAG_METADATA_4){
        $request_data .= pack('nn', 4, $REQ_SEND_METADATA);
        $request_count++;
    }

    #RUA
    if($main::OUTPUT_PLUGIN->{rua_ver}){
        $request_data .= pack('nn', $main::OUTPUT_PLUGIN->{rua_ver}, $REQ_SEND_RUA_EVENTS);
        $request_count++;
    }

    # FireAMP
    if($main::OUTPUT_PLUGIN->{fireamp_events_ver}){
        $request_data .= pack('nn', $main::OUTPUT_PLUGIN->{fireamp_events_ver}, $REQ_SEND_FIREAMP_EVENTS);
        $request_count++;
    }

    # Filelog
    if($main::OUTPUT_PLUGIN->{filelog_events_ver}){
        $request_data .= pack('nn', $main::OUTPUT_PLUGIN->{filelog_events_ver}, $REQ_SEND_FILELOG_EVENTS);
        $request_count++;
    }

    # IDS
    if($main::OUTPUT_PLUGIN->{ids_events_ver}){
        $request_data .= pack('nn', $main::OUTPUT_PLUGIN->{ids_events_ver}, $REQ_SEND_SNORT_EVENTS);
        $request_count++;
    }

    # Impact Flags
    if($main::OUTPUT_PLUGIN->{impact_flag_ver}){
        $request_data .= pack('nn', $main::OUTPUT_PLUGIN->{impact_flag_ver}, $REQ_SEND_IMPACT_ALERTS);
        $request_count++;
    }

    # Null terminator
    $request_data .= pack('nn', 0, 0);
    $request_count++;
    #######################################################################

    $size = 16 + $request_count * 4;

    #Build the service request
    my $full_req = "";
    $full_req .= pack('n', $HEADER_VERSION_ONE);        # header version
    $full_req .= pack('n', $TYPE_UEC_STREAM_REQUEST);   # message type
    $full_req .= pack('N', $size);                      # message payload size
    $full_req .= pack('N', $service_type);       # service type
    $full_req .= pack('N', $size);
    $full_req .= pack('N', $init_flags);                      # initial flags
    $full_req .= pack('N', $init_timestamp);                  # initial time stamp
    debug("services id ". $service_type);
    debug("size of service request" . $size);
    debug("initial flags ".$init_flags);
    debug("initial timestamp ".$init_timestamp);
    $full_req .= $request_data;

    return $full_req;
}

#
# Decodes bundled data records and returns a list. Each element in the list
# is a single well-defined data record.
#
my $sequence_num = 0;
sub get_bundled_records {
    my $rec = $_[0];
    my @records;
    my $data = $rec->{'rec_data'};
    my $size = $rec->{'rec_length'};
    my $off  = 0;
    my $header_ver = $rec->{version};

    #unpack connection id
    my $conn_id         = unpack('N', substr($data, 0, 4));
    #unpack the sequence number
    my $sequence        = unpack('N', substr($data, 4, 4));
    $off = 8;

    # Check sequence number
    $sequence_num++;
    if($sequence_num != $sequence) {
        verbose("Lost a few bundles ($sequence_num vs $sequence)");
    }
    # Check to see if this is an empty bundle
    if($size <= 8) {
        verbose("Received an empty bundle with sequence number $sequence.\n");
        return;
    }

    my $record;
    while($off < $size) {
        $record = dclone($SFRecords::record);

        #Note the only data type in bundled records is TYPE_DATA
        #below we reconstruct the data records that could be used in get_feed.
        $record->{'version'}    = $header_ver;
        $record->{'msg_type'}   = unpack('N', substr($data, $off, 4));
        $record->{'msg_length'} = unpack('N', substr($data, $off+4, 4));
        $off += 8;

        if($record->{'msg_length'} > 0){
            #unpack record type
            $record->{'rec_type'}   = unpack('N', substr($data, $off, 4));
            if($record->{'rec_type'} & $U2R_EXTENDED_HEADER_BIT) {
                $record->{'rec_type'} &= ~$U2R_EXTENDED_HEADER_BIT;
            }
            #unpack length for this record
            $record->{'rec_length'} = unpack('N', substr($data, $off+4, 4));

            #should evaluate if the header is extended and we need another 8 bytes for
            #archive timestamp and checksum.
            if($record->{'msg_length'} == 8 + $record->{'rec_length'} ||
               $record->{'msg_length'} ==     $record->{'rec_length'}) {
                $record->{'archive_timestamp'} = 0;
                $record->{'checksum'}          = 0;
                $record->{'rec_data'}          = substr($data, $off+8, $record->{'rec_length'});
            } elsif($record->{'msg_length'} == 16 + $record->{'rec_length'}) {
                $record->{'archive_timestamp'} = unpack('N', substr($data, $off+8, 4));
                $record->{'checksum'}          = unpack('N', substr($data, $off+12, 4));
                $record->{'rec_data'}          = substr($data, $off+16, $record->{'rec_length'});
            } else {
                warn "INVALID LENGTH $record->{'msg_length'}"." EXPECTED $record->{'rec_length'} plus 8 or 16";
                $record->{'rec_type'} = 0;
                $record->{'rec_length'} = 0;
                $record->{'rec_data'} = '';
                $record->{'archive_timestamp'} = 0;
                $record->{'checksum'}   = 0;
            }
            push(@records, $record);
        }

        $off += $record->{'msg_length'};
    }

    return @records;
}

# required
1;

