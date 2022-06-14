package SFRNABlocks;

use warnings;
use strict;

our $rna_blocks = [
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {
      'block_length' => '$value - 8'
    },
    'index' => 0,
    'map' => {
      'data' => 'block_length'
    },
    'name' => 'String',
    'order' => [
      'block_type',
      'block_length',
      'data'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 1,
    'map' => {
      'service' => 'BLOCK',
      'vendor' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'ServiceSubtype',
    'order' => [
      'block_type',
      'block_length',
      'service',
      'vendor',
      'version'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hits' => 'N',
      'last_used' => 'N',
      'port' => 'n'
    },
    'eval' => {},
    'index' => 2,
    'map' => {
      'legacy_product' => 'BLOCK',
      'legacy_service' => 'BLOCK',
      'subtypelist' => 'BLOCK',
      'vendor' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'HostService',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'hits',
      'legacy_service',
      'vendor',
      'legacy_product',
      'version',
      'subtypelist',
      'confidence',
      'last_used'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'legacy_fpid' => 'N'
    },
    'eval' => {},
    'index' => 3,
    'map' => {
      'os_name' => 'BLOCK',
      'vendor' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'OS',
    'order' => [
      'block_type',
      'block_length',
      'os_name',
      'vendor',
      'version',
      'confidence',
      'legacy_fpid'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'proto' => 'n'
    },
    'eval' => {},
    'index' => 4,
    'map' => {},
    'name' => 'PndProtocol',
    'order' => [
      'block_type',
      'block_length',
      'proto'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'primary' => 'C',
      'ttl' => 'C'
    },
    'eval' => {
      'mac' => 'mac_to_str($value)'
    },
    'index' => 5,
    'map' => {
      'mac' => 6
    },
    'name' => 'HostMAC',
    'order' => [
      'block_type',
      'block_length',
      'ttl',
      'mac',
      'primary'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hops' => 'C',
      'host_type' => 'N',
      'last_seen' => 'N',
      'legacy_fpid' => 'N',
      'legacy_ip' => 'N',
      'pmtu' => 'N'
    },
    'eval' => {
      'legacy_ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 6,
    'map' => {
      'hostname' => 'BLOCK',
      'mac' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'os name' => 'BLOCK',
      'os vendor' => 'BLOCK',
      'os version' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'HostTracker',
    'order' => [
      'block_type',
      'block_length',
      'legacy_ip',
      'hostname',
      'hops',
      'pmtu',
      'os name',
      'os vendor',
      'os version',
      'confidence',
      'legacy_fpid',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'vuln_id' => 'N'
    },
    'eval' => {},
    'index' => 7,
    'map' => {},
    'name' => 'INT32',
    'order' => [
      'block_type',
      'block_length',
      'vuln_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'port' => 'n'
    },
    'eval' => {},
    'index' => 8,
    'map' => {
      'proto' => 'BLOCK',
      'subservice' => 'BLOCK',
      'vuln_list' => 'BLOCK'
    },
    'name' => 'VulnRef',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'proto',
      'subservice',
      'vuln_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'firstPktsecond' => 'N',
      'initiator' => 'V',
      'initiatorBytes' => 'N',
      'initiatorPkts' => 'N',
      'initiatorPort' => 'n',
      'lastPktsecond' => 'N',
      'protocol' => 'C',
      'responder' => 'V',
      'responderBytes' => 'N',
      'responderPkts' => 'N',
      'responderPort' => 'n'
    },
    'eval' => {
      'initiator' => 'inet_ntoa(pack("N", $value))',
      'responder' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 9,
    'map' => {},
    'name' => 'FlowStats',
    'order' => [
      'block_type',
      'block_length',
      'initiator',
      'responder',
      'initiatorPort',
      'responderPort',
      'firstPktsecond',
      'lastPktsecond',
      'initiatorPkts',
      'responderPkts',
      'initiatorBytes',
      'responderBytes',
      'protocol'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {
      'block_length' => '$value - 8'
    },
    'index' => 10,
    'map' => {
      'data' => 'block_length'
    },
    'name' => 'Blob',
    'order' => [
      'block_type',
      'block_length',
      'data'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 11,
    'map' => {
      'data' => 'LIST'
    },
    'name' => 'List',
    'order' => [
      'block_type',
      'block_length',
      'data'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hits' => 'N',
      'last_used' => 'N',
      'port' => 'n'
    },
    'eval' => {},
    'index' => 12,
    'map' => {
      'banner' => 'BLOCK',
      'legacy_product' => 'BLOCK',
      'legacy_service' => 'BLOCK',
      'subtypelist' => 'BLOCK',
      'vendor' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'HostService',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'hits',
      'legacy_service',
      'vendor',
      'legacy_product',
      'version',
      'subtypelist',
      'confidence',
      'last_used',
      'banner'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hops' => 'C',
      'host_type' => 'N',
      'last_seen' => 'N',
      'legacy_fpid' => 'N',
      'legacy_ip' => 'N',
      'pmtu' => 'N',
      'secondary' => 'C'
    },
    'eval' => {
      'legacy_ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 13,
    'map' => {
      'hostname' => 'BLOCK',
      'mac' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'os name' => 'BLOCK',
      'os vendor' => 'BLOCK',
      'os version' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'HostTracker',
    'order' => [
      'block_type',
      'block_length',
      'legacy_ip',
      'hostname',
      'hops',
      'secondary',
      'pmtu',
      'os name',
      'os vendor',
      'os version',
      'confidence',
      'legacy_fpid',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'priority' => 'C',
      'type' => 'C',
      'vid' => 'n'
    },
    'eval' => {},
    'index' => 14,
    'map' => {},
    'name' => 'VLAN',
    'order' => [
      'block_type',
      'block_length',
      'vid',
      'type',
      'priority'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hops' => 'C',
      'host_type' => 'N',
      'last_seen' => 'N',
      'legacy_fpid' => 'N',
      'legacy_ip' => 'N',
      'pmtu' => 'N',
      'priority' => 'C',
      'secondary' => 'C',
      'type' => 'C',
      'vid' => 'n'
    },
    'eval' => {
      'legacy_ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 15,
    'map' => {
      'mac' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'HostTracker',
    'order' => [
      'block_type',
      'block_length',
      'legacy_ip',
      'hops',
      'secondary',
      'pmtu',
      'confidence',
      'legacy_fpid',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type',
      'vid',
      'type',
      'priority'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'legacy_fpid' => 'N'
    },
    'eval' => {},
    'index' => 16,
    'map' => {},
    'name' => 'OS',
    'order' => [
      'block_type',
      'block_length',
      'confidence',
      'legacy_fpid'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'df' => 'C',
      'gateway' => 'N',
      'id' => 'N',
      'ipid_trend' => 'N',
      'mss_follows_syn' => 'n',
      'remote_cmd' => 'N',
      'remote_id' => 'N',
      'sensor_id' => 'N',
      'source_addr' => 'N',
      'source_mask' => 'N',
      'status' => 'N',
      'target_addr' => 'N',
      'target_distance' => 'C',
      'target_port' => 'n',
      'ttl' => 'C',
      'type' => 'n',
      'wscale' => 'N',
      'wsize_high' => 'n',
      'wsize_low' => 'n'
    },
    'eval' => {},
    'index' => 17,
    'map' => {
      'interface' => 8,
      'topts' => 'BLOCK'
    },
    'name' => 'fingerprint',
    'order' => [
      'block_type',
      'block_length',
      'remote_cmd',
      'status',
      'id',
      'remote_id',
      'sensor_id',
      'target_addr',
      'source_addr',
      'source_mask',
      'gateway',
      'wscale',
      'ipid_trend',
      'type',
      'target_port',
      'wsize_low',
      'wsize_high',
      'interface',
      'target_distance',
      'ttl',
      'df',
      'mss_follows_syn',
      'topts'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'firstPktsecond' => 'N',
      'initiator' => 'V',
      'initiatorBytes' => 'N',
      'initiatorPkts' => 'N',
      'initiatorPort' => 'n',
      'lastPktsecond' => 'N',
      'protocol' => 'C',
      'responder' => 'V',
      'responderBytes' => 'N',
      'responderPkts' => 'N',
      'responderPort' => 'n'
    },
    'eval' => {
      'initiator' => 'inet_ntoa(pack("N", $value))',
      'responder' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 18,
    'map' => {
      'legacy_service' => 'BLOCK'
    },
    'name' => 'FlowStats',
    'order' => [
      'block_type',
      'block_length',
      'initiator',
      'responder',
      'initiatorPort',
      'responderPort',
      'firstPktsecond',
      'lastPktsecond',
      'initiatorPkts',
      'responderPkts',
      'initiatorBytes',
      'responderBytes',
      'protocol',
      'legacy_service'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'dst_ip_address' => 'N',
      'ip_address' => 'N',
      'pe_id' => 'N',
      'pe_sensor_id' => 'N',
      'pe_time' => 'N',
      'policy_id' => 'N',
      'priority' => 'N',
      'rule_id' => 'N'
    },
    'eval' => {
      'dst_ip_address' => 'inet_ntoa(pack("N", $value))',
      'ip_address' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 19,
    'map' => {
      'description' => 'BLOCK'
    },
    'name' => 'PVEvent',
    'order' => [
      'block_type',
      'block_length',
      'pe_id',
      'pe_sensor_id',
      'pe_time',
      'policy_id',
      'rule_id',
      'priority',
      'ip_address',
      'dst_ip_address',
      'description'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'dst_ip_address' => 'N',
      'event_id' => 'N',
      'impact' => 'N',
      'sensor_id' => 'N',
      'src_ip_address' => 'N',
      'time' => 'N'
    },
    'eval' => {
      'dst_ip_address' => 'inet_ntoa(pack("N", $value))',
      'src_ip_address' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 20,
    'map' => {
      'description' => 'BLOCK'
    },
    'name' => 'ImpactAlert',
    'order' => [
      'block_type',
      'block_length',
      'event_id',
      'sensor_id',
      'time',
      'impact',
      'src_ip_address',
      'dst_ip_address',
      'description'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 21,
    'map' => {
      'val1' => 'BLOCK',
      'val10' => 'BLOCK',
      'val2' => 'BLOCK',
      'val3' => 'BLOCK',
      'val4' => 'BLOCK',
      'val5' => 'BLOCK',
      'val6' => 'BLOCK',
      'val7' => 'BLOCK',
      'val8' => 'BLOCK',
      'val9' => 'BLOCK'
    },
    'name' => 'fp_values',
    'order' => [
      'block_type',
      'block_length',
      'val1',
      'val2',
      'val3',
      'val4',
      'val5',
      'val6',
      'val7',
      'val8',
      'val9',
      'val10'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'ipaddr' => 'N',
      'port' => 'n',
      'proto' => 'n',
      'vuln_id' => 'N'
    },
    'eval' => {
      'ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 22,
    'map' => {
      'subservice' => 'BLOCK'
    },
    'name' => 'Deprecated_VulnAck',
    'order' => [
      'block_type',
      'block_length',
      'ipaddr',
      'port',
      'proto',
      'subservice',
      'vuln_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'ipaddr' => 'N',
      'uid' => 'N'
    },
    'eval' => {
      'ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 23,
    'map' => {
      'vuln_list' => 'BLOCK'
    },
    'name' => 'Deprecated_UserHostVulns',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'ipaddr',
      'vuln_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'ip' => 'N',
      'mask' => 'N'
    },
    'eval' => {
      'ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 24,
    'map' => {},
    'name' => 'Deprecated_IPMask',
    'order' => [
      'block_type',
      'block_length',
      'ip',
      'mask'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 25,
    'map' => {
      'ip_list' => 'BLOCK'
    },
    'name' => 'Deprecated_UserIPMasks',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'ip_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'ip' => 'N',
      'port' => 'n',
      'proto' => 'n'
    },
    'eval' => {
      'ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 26,
    'map' => {},
    'name' => 'Deprecated_UserService',
    'order' => [
      'block_type',
      'block_length',
      'ip',
      'port',
      'proto'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 27,
    'map' => {
      'service_list' => 'BLOCK'
    },
    'name' => 'Deprecated_UserServiceList',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'service_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'criticality' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 28,
    'map' => {
      'ip_list' => 'BLOCK'
    },
    'name' => 'Deprecated_UserCriticality',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'criticality',
      'ip_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'hits' => 'N',
      'id' => 'N',
      'last_used' => 'N'
    },
    'eval' => {},
    'index' => 29,
    'map' => {
      'version' => 'BLOCK'
    },
    'name' => 'HostClientApp',
    'order' => [
      'block_type',
      'block_length',
      'hits',
      'last_used',
      'id',
      'version'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'criticality' => 'n',
      'hops' => 'C',
      'host_type' => 'N',
      'last_seen' => 'N',
      'legacy_fpid' => 'N',
      'legacy_ip' => 'N',
      'priority' => 'C',
      'secondary' => 'C',
      'type' => 'C',
      'vid' => 'n'
    },
    'eval' => {
      'legacy_ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 30,
    'map' => {
      'apps' => 'BLOCK',
      'mac' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'HostTracker',
    'order' => [
      'block_type',
      'block_length',
      'legacy_ip',
      'hops',
      'secondary',
      'confidence',
      'legacy_fpid',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type',
      'criticality',
      'vid',
      'type',
      'priority',
      'apps'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 31,
    'map' => {
      'data' => 'LIST'
    },
    'name' => 'GenericList',
    'order' => [
      'block_type',
      'block_length',
      'data'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'firstPktsecond' => 'N',
      'initiator' => 'V',
      'initiatorBytes' => 'N',
      'initiatorPkts' => 'N',
      'initiatorPort' => 'n',
      'lastPktsecond' => 'N',
      'protocol' => 'C',
      'responder' => 'V',
      'responderBytes' => 'N',
      'responderPkts' => 'N',
      'responderPort' => 'n'
    },
    'eval' => {
      'initiator' => 'inet_ntoa(pack("N", $value))',
      'responder' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 32,
    'map' => {
      'clientVersion' => 'BLOCK',
      'legacy_service' => 'BLOCK',
      'url' => 'BLOCK'
    },
    'name' => 'FlowStats',
    'order' => [
      'block_type',
      'block_length',
      'initiator',
      'responder',
      'initiatorPort',
      'responderPort',
      'firstPktsecond',
      'lastPktsecond',
      'initiatorPkts',
      'responderPkts',
      'initiatorBytes',
      'responderBytes',
      'protocol',
      'legacy_service',
      'clientId',
      'clientVersion',
      'url'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'defined_mask' => 'N',
      'dest_criticality' => 'n',
      'dest_host_type' => 'C',
      'dest_ip_addr' => 'N',
      'dest_os_fingerprint_id' => 'N',
      'dest_port' => 'n',
      'dest_vlan_id' => 'n',
      'event_id' => 'N',
      'event_type' => 'C',
      'impact_flags' => 'N',
      'ip_protocol' => 'C',
      'net_protocol' => 'n',
      'policy_event_id' => 'N',
      'policy_id' => 'N',
      'policy_sensor_id' => 'C',
      'policy_tv_sec' => 'N',
      'priority' => 'N',
      'rule_id' => 'N',
      'sensor_id' => 'C',
      'sig_gen' => 'N',
      'sig_id' => 'N',
      'src_criticality' => 'n',
      'src_host_type' => 'C',
      'src_ip_addr' => 'N',
      'src_os_fingerprint_id' => 'N',
      'src_port' => 'n',
      'src_vlan_id' => 'n',
      'tv_sec' => 'N',
      'tv_usec' => 'N'
    },
    'eval' => {
      'dest_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'src_ip_addr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 33,
    'map' => {
      'description' => 'BLOCK',
      'dest_service' => 'BLOCK',
      'src_service' => 'BLOCK'
    },
    'name' => 'PolicyEvent',
    'order' => [
      'block_type',
      'block_length',
      'policy_sensor_id',
      'policy_tv_sec',
      'policy_event_id',
      'policy_id',
      'rule_id',
      'priority',
      'description',
      'event_type',
      'sensor_id',
      'sig_id',
      'sig_gen',
      'tv_sec',
      'tv_usec',
      'event_id',
      'defined_mask',
      'impact_flags',
      'ip_protocol',
      'net_protocol',
      'src_ip_addr',
      'src_host_type',
      'src_vlan_id',
      'src_os_fingerprint_id',
      'src_criticality',
      'src_port',
      'src_service',
      'dest_ip_addr',
      'dest_host_type',
      'dest_vlan_id',
      'dest_os_fingerprint_id',
      'dest_criticality',
      'dest_port',
      'dest_service'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hops' => 'C',
      'host_type' => 'N',
      'last_seen' => 'N',
      'legacy_ip' => 'N',
      'priority' => 'C',
      'secondary' => 'C',
      'type' => 'C',
      'vid' => 'n',
      'vlan_tag_present' => 'C'
    },
    'eval' => {
      'fpuuid' => 'uuid_to_str($value)',
      'legacy_ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 34,
    'map' => {
      'apps' => 'BLOCK',
      'fpuuid' => 16,
      'mac' => 'BLOCK',
      'netbios_name' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'HostTracker',
    'order' => [
      'block_type',
      'block_length',
      'legacy_ip',
      'hops',
      'secondary',
      'confidence',
      'fpuuid',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type',
      'vlan_tag_present',
      'vid',
      'type',
      'priority',
      'apps',
      'netbios_name'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 35,
    'map' => {
      'value' => 'BLOCK'
    },
    'name' => 'StringInfo',
    'order' => [
      'block_type',
      'block_length',
      'value'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hits' => 'N',
      'last_used' => 'N',
      'port' => 'n',
      'service_id' => 'n'
    },
    'eval' => {},
    'index' => 36,
    'map' => {
      'legacy_product' => 'BLOCK',
      'subtypelist' => 'BLOCK',
      'vendor' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'HostService',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'hits',
      'service_id',
      'vendor',
      'legacy_product',
      'version',
      'subtypelist',
      'confidence',
      'last_used'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'port' => 'n',
      'protocol' => 'C'
    },
    'eval' => {},
    'index' => 37,
    'map' => {
      'banner' => 'BLOCK'
    },
    'name' => 'ServiceBanner',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'protocol',
      'banner'
    ]
  },
  {
    'byte_order' => {
      'bits' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'id' => 'N',
      'legacy_ipaddr' => 'N'
    },
    'eval' => {
      'legacy_ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 38,
    'map' => {},
    'name' => 'AttributeAddress',
    'order' => [
      'block_type',
      'block_length',
      'id',
      'legacy_ipaddr',
      'bits'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'id' => 'N'
    },
    'eval' => {},
    'index' => 39,
    'map' => {
      'item_name' => 'BLOCK'
    },
    'name' => 'AttributeListItem',
    'order' => [
      'block_type',
      'block_length',
      'id',
      'item_name'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'end' => 'N',
      'id' => 'N',
      'ip_assigned' => 'N',
      'start' => 'N',
      'type' => 'N',
      'uid' => 'N'
    },
    'eval' => {
      'ip_assigned' => 'inet_ntoa(pack("N", $value))',
      'uuid' => 'uuid_to_str($value)'
    },
    'index' => 40,
    'map' => {
      'address_list' => 'BLOCK',
      'attribute_name' => 'BLOCK',
      'list' => 'BLOCK',
      'uuid' => 16
    },
    'name' => 'AttributeDef',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'uuid',
      'id',
      'attribute_name',
      'type',
      'start',
      'end',
      'ip_assigned',
      'list',
      'address_list'
    ]
  },
  {
    'byte_order' => {
      'attr_id' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 41,
    'map' => {
      'ip_list' => 'BLOCK',
      'value' => 'BLOCK'
    },
    'name' => 'Deprecated_UserAttrValue',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'attr_id',
      'ip_list',
      'value'
    ]
  },
  {
    'byte_order' => {
      'app_proto' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'hits' => 'N',
      'id' => 'N',
      'last_used' => 'N'
    },
    'eval' => {},
    'index' => 42,
    'map' => {
      'version' => 'BLOCK'
    },
    'name' => 'HostClientApp',
    'order' => [
      'block_type',
      'block_length',
      'hits',
      'last_used',
      'app_proto',
      'id',
      'version'
    ]
  },
  {
    'byte_order' => {
      'applicationId' => 'n',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'clnt_app_type_id' => 'N',
      'firstPktsecond' => 'N',
      'initiator' => 'V',
      'initiatorBytes' => 'N',
      'initiatorPkts' => 'N',
      'initiatorPort' => 'n',
      'lastPktsecond' => 'N',
      'protocol' => 'C',
      'responder' => 'V',
      'responderBytes' => 'N',
      'responderPkts' => 'N',
      'responderPort' => 'n'
    },
    'eval' => {
      'initiator' => 'inet_ntoa(pack("N", $value))',
      'responder' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 43,
    'map' => {
      'clientVersion' => 'BLOCK',
      'netbiosDomain' => 'BLOCK',
      'url' => 'BLOCK'
    },
    'name' => 'FlowStats',
    'order' => [
      'block_type',
      'block_length',
      'initiator',
      'responder',
      'initiatorPort',
      'responderPort',
      'firstPktsecond',
      'lastPktsecond',
      'initiatorPkts',
      'responderPkts',
      'initiatorBytes',
      'responderBytes',
      'protocol',
      'applicationId',
      'clnt_app_type_id',
      'clientId',
      'clientVersion',
      'url',
      'netbiosDomain'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'id' => 'N',
      'port' => 'n',
      'proto' => 'n'
    },
    'eval' => {},
    'index' => 44,
    'map' => {
      'bugtraq_ids' => 'BLOCK',
      'cve_ids' => 'BLOCK',
      'desc' => 'BLOCK',
      'vuln_name' => 'BLOCK'
    },
    'name' => 'ScanVuln',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'proto',
      'id',
      'vuln_name',
      'desc',
      'bugtraq_ids',
      'cve_ids'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'legacy_ipaddr' => 'N',
      'port' => 'n',
      'proto' => 'n',
      'type' => 'N',
      'uid' => 'N'
    },
    'eval' => {
      'legacy_ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 45,
    'map' => {
      'vulns' => 'BLOCK'
    },
    'name' => 'ScanResult',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'type',
      'legacy_ipaddr',
      'port',
      'proto',
      'vulns'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'ipaddr' => 'N',
      'type' => 'N',
      'uid' => 'N'
    },
    'eval' => {
      'ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 46,
    'map' => {
      'vuln_list' => 'BLOCK'
    },
    'name' => 'Deprecated_UserHostVulns',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'ipaddr',
      'type',
      'vuln_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'criticality' => 'n',
      'hops' => 'C',
      'host_type' => 'N',
      'last_seen' => 'N',
      'legacy_ip' => 'N',
      'priority' => 'C',
      'type' => 'C',
      'vid' => 'n'
    },
    'eval' => {
      'fpuuid' => 'uuid_to_str($value)',
      'legacy_ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 47,
    'map' => {
      'apps' => 'BLOCK',
      'attribute_list' => 'BLOCK',
      'fpuuid' => 16,
      'mac' => 'BLOCK',
      'netbios_name' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'notes' => 'BLOCK',
      'scan_vuln_list' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'vuln_list' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'FullHostTracker',
    'order' => [
      'block_type',
      'block_length',
      'legacy_ip',
      'hops',
      'confidence',
      'fpuuid',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type',
      'criticality',
      'vid',
      'type',
      'priority',
      'apps',
      'netbios_name',
      'notes',
      'vuln_list',
      'scan_vuln_list',
      'attribute_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'i_value' => 'N',
      'id' => 'N',
      'type' => 'N'
    },
    'eval' => {},
    'index' => 48,
    'map' => {
      't_value' => 'BLOCK'
    },
    'name' => 'AttributeValue',
    'order' => [
      'block_type',
      'block_length',
      'id',
      'type',
      'i_value',
      't_value'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'invalid' => 'C',
      'vuln_id' => 'N'
    },
    'eval' => {},
    'index' => 49,
    'map' => {},
    'name' => 'VulnList',
    'order' => [
      'block_type',
      'block_length',
      'vuln_id',
      'invalid'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hits' => 'N',
      'last_used' => 'N',
      'port' => 'n',
      'service_id' => 'n'
    },
    'eval' => {},
    'index' => 50,
    'map' => {
      'banner' => 'BLOCK',
      'legacy_product' => 'BLOCK',
      'scan_vuln_list' => 'BLOCK',
      'subtypelist' => 'BLOCK',
      'vendor' => 'BLOCK',
      'version' => 'BLOCK',
      'vuln_list' => 'BLOCK'
    },
    'name' => 'FullHostService',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'hits',
      'service_id',
      'vendor',
      'legacy_product',
      'version',
      'confidence',
      'last_used',
      'banner',
      'vuln_list',
      'scan_vuln_list',
      'subtypelist'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 51,
    'map' => {
      'scan_vuln_list' => 'BLOCK',
      'service' => 'BLOCK',
      'vendor' => 'BLOCK',
      'version' => 'BLOCK',
      'vuln_list' => 'BLOCK'
    },
    'name' => 'FullServiceSubtype',
    'order' => [
      'block_type',
      'block_length',
      'service',
      'vendor',
      'version',
      'vuln_list',
      'scan_vuln_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'defined_mask' => 'N',
      'dest_criticality' => 'n',
      'dest_host_type' => 'C',
      'dest_ip_addr' => 'N',
      'dest_port' => 'n',
      'dest_service_id' => 'n',
      'dest_vlan_id' => 'n',
      'event_id' => 'N',
      'event_type' => 'C',
      'impact_flags' => 'N',
      'ip_protocol' => 'C',
      'net_protocol' => 'n',
      'policy_event_id' => 'N',
      'policy_id' => 'N',
      'policy_sensor_id' => 'N',
      'policy_tv_sec' => 'N',
      'priority' => 'N',
      'rule_id' => 'N',
      'sensor_id' => 'N',
      'sig_gen' => 'N',
      'sig_id' => 'N',
      'src_criticality' => 'n',
      'src_host_type' => 'C',
      'src_ip_addr' => 'N',
      'src_port' => 'n',
      'src_service_id' => 'n',
      'src_vlan_id' => 'n',
      'tv_sec' => 'N',
      'tv_usec' => 'N'
    },
    'eval' => {
      'dest_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'dest_os_fingerprint_uuid' => 'uuid_to_str($value)',
      'src_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'src_os_fingerprint_uuid' => 'uuid_to_str($value)'
    },
    'index' => 52,
    'map' => {
      'description' => 'BLOCK',
      'dest_os_fingerprint_uuid' => 16,
      'src_os_fingerprint_uuid' => 16
    },
    'name' => 'PolicyEvent',
    'order' => [
      'block_type',
      'block_length',
      'policy_sensor_id',
      'policy_tv_sec',
      'policy_event_id',
      'policy_id',
      'rule_id',
      'priority',
      'description',
      'event_type',
      'sensor_id',
      'sig_id',
      'sig_gen',
      'tv_sec',
      'tv_usec',
      'event_id',
      'defined_mask',
      'impact_flags',
      'ip_protocol',
      'net_protocol',
      'src_ip_addr',
      'src_host_type',
      'src_vlan_id',
      'src_os_fingerprint_uuid',
      'src_criticality',
      'src_port',
      'src_service_id',
      'dest_ip_addr',
      'dest_host_type',
      'dest_vlan_id',
      'dest_os_fingerprint_uuid',
      'dest_criticality',
      'dest_port',
      'dest_service_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N'
    },
    'eval' => {
      'fpuuid' => 'uuid_to_str($value)'
    },
    'index' => 53,
    'map' => {
      'fpuuid' => 16
    },
    'name' => 'OS',
    'order' => [
      'block_type',
      'block_length',
      'confidence',
      'fpuuid'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'type' => 'N'
    },
    'eval' => {},
    'index' => 54,
    'map' => {
      'message' => 'BLOCK'
    },
    'name' => 'PolicyEngineControlMsg',
    'order' => [
      'block_type',
      'block_length',
      'type',
      'message'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'category' => 'N',
      'end' => 'N',
      'id' => 'N',
      'ip_assigned' => 'N',
      'start' => 'N',
      'type' => 'N',
      'uid' => 'N'
    },
    'eval' => {
      'ip_assigned' => 'inet_ntoa(pack("N", $value))',
      'uuid' => 'uuid_to_str($value)'
    },
    'index' => 55,
    'map' => {
      'address_list' => 'BLOCK',
      'attribute_name' => 'BLOCK',
      'list' => 'BLOCK',
      'uuid' => 16
    },
    'name' => 'AttributeDef',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'uuid',
      'id',
      'attribute_name',
      'type',
      'category',
      'start',
      'end',
      'ip_assigned',
      'list',
      'address_list'
    ]
  },
  {
    'byte_order' => {
      'applicationId' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'clnt_app_type_id' => 'N',
      'firstPktsecond' => 'N',
      'flow_type' => 'C',
      'initiator' => 'N',
      'initiatorBytes' => 'N',
      'initiatorPkts' => 'N',
      'initiatorPort' => 'n',
      'lastPktsecond' => 'N',
      'protocol' => 'C',
      'responder' => 'N',
      'responderBytes' => 'N',
      'responderPkts' => 'N',
      'responderPort' => 'n',
      'src_device' => 'N',
      'tcpFlags' => 'C'
    },
    'eval' => {
      'initiator' => 'inet_ntoa(pack("N", $value))',
      'responder' => 'inet_ntoa(pack("N", $value))',
      'src_device' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 56,
    'map' => {
      'clientVersion' => 'BLOCK',
      'netbiosDomain' => 'BLOCK',
      'url' => 'BLOCK'
    },
    'name' => 'FlowStats',
    'order' => [
      'block_type',
      'block_length',
      'initiator',
      'responder',
      'initiatorPort',
      'responderPort',
      'firstPktsecond',
      'lastPktsecond',
      'flow_type',
      'src_device',
      'tcpFlags',
      'initiatorPkts',
      'responderPkts',
      'initiatorBytes',
      'responderBytes',
      'protocol',
      'applicationId',
      'clnt_app_type_id',
      'clientId',
      'clientVersion',
      'url',
      'netbiosDomain'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'proto' => 'n',
      'proto_type' => 'C'
    },
    'eval' => {},
    'index' => 57,
    'map' => {
      'ip_range_list' => 'BLOCK',
      'mac_list' => 'BLOCK'
    },
    'name' => 'UserProtocol',
    'order' => [
      'block_type',
      'block_length',
      'ip_range_list',
      'mac_list',
      'proto_type',
      'proto'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 58,
    'map' => {
      'protos' => 'BLOCK'
    },
    'name' => 'UserProtocolList',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'protos'
    ]
  },
  {
    'byte_order' => {
      'app_proto' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'id' => 'N'
    },
    'eval' => {},
    'index' => 59,
    'map' => {
      'ip_range_list' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'UserClientApp',
    'order' => [
      'block_type',
      'block_length',
      'ip_range_list',
      'app_proto',
      'id',
      'version'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'source_type' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 60,
    'map' => {
      'apps' => 'BLOCK'
    },
    'name' => 'UserClientAppList',
    'order' => [
      'block_type',
      'block_length',
      'source_type',
      'uid',
      'apps'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'end' => 'N',
      'start' => 'N'
    },
    'eval' => {
      'end' => 'inet_ntoa(pack("N", $value))',
      'start' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 61,
    'map' => {},
    'name' => 'IPRangeSpec',
    'order' => [
      'block_type',
      'block_length',
      'start',
      'end'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 62,
    'map' => {
      'attribute_name' => 'BLOCK',
      'value' => 'BLOCK'
    },
    'name' => 'AttrSpec',
    'order' => [
      'block_type',
      'block_length',
      'attribute_name',
      'value'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {
      'macaddr' => 'mac_to_str($value)'
    },
    'index' => 63,
    'map' => {
      'macaddr' => 6
    },
    'name' => 'MacSpec',
    'order' => [
      'block_type',
      'block_length',
      'macaddr'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 64,
    'map' => {
      'ip_range_list' => 'BLOCK',
      'mac_list' => 'BLOCK'
    },
    'name' => 'AddressSpec',
    'order' => [
      'block_type',
      'block_length',
      'ip_range_list',
      'mac_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'drop_user_product' => 'N',
      'port' => 'n',
      'product_id' => 'N',
      'proto' => 'n',
      'service_id' => 'N',
      'software_id' => 'N',
      'source_type' => 'N',
      'uid' => 'N',
      'vendor_id' => 'N'
    },
    'eval' => {
      'uuid' => 'uuid_to_str($value)'
    },
    'index' => 65,
    'map' => {
      'build' => 'BLOCK',
      'custom_product_str' => 'BLOCK',
      'custom_vendor_str' => 'BLOCK',
      'custom_version_str' => 'BLOCK',
      'extension' => 'BLOCK',
      'fix_list' => 'BLOCK',
      'ip_range_list' => 'BLOCK',
      'major' => 'BLOCK',
      'minor' => 'BLOCK',
      'patch' => 'BLOCK',
      'revision' => 'BLOCK',
      'to_major' => 'BLOCK',
      'to_minor' => 'BLOCK',
      'to_revision' => 'BLOCK',
      'uuid' => 16
    },
    'name' => 'UserProduct',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'source_type',
      'ip_range_list',
      'port',
      'proto',
      'drop_user_product',
      'custom_vendor_str',
      'custom_product_str',
      'custom_version_str',
      'software_id',
      'service_id',
      'vendor_id',
      'product_id',
      'major',
      'minor',
      'revision',
      'to_major',
      'to_minor',
      'to_revision',
      'build',
      'patch',
      'extension',
      'uuid',
      'fix_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'bucket_stime' => 'N',
      'bytes_recv' => 'N',
      'bytes_sent' => 'N',
      'connections_n' => 'N',
      'flow_type' => 'C',
      'initiator' => 'N',
      'packets_recv' => 'N',
      'packets_sent' => 'N',
      'protocol' => 'C',
      'responder' => 'N',
      'responder_port' => 'n',
      'service_id' => 'N',
      'src_device' => 'N'
    },
    'eval' => {
      'initiator' => 'inet_ntoa(pack("N", $value))',
      'responder' => 'inet_ntoa(pack("N", $value))',
      'src_device' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 66,
    'map' => {},
    'name' => 'FlowChunk',
    'order' => [
      'block_type',
      'block_length',
      'initiator',
      'responder',
      'bucket_stime',
      'service_id',
      'responder_port',
      'protocol',
      'flow_type',
      'src_device',
      'packets_sent',
      'packets_recv',
      'bytes_sent',
      'bytes_recv',
      'connections_n'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'fix_id' => 'N'
    },
    'eval' => {},
    'index' => 67,
    'map' => {},
    'name' => 'FixList',
    'order' => [
      'block_type',
      'block_length',
      'fix_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hits' => 'N',
      'last_used' => 'N',
      'port' => 'n',
      'service_id' => 'N',
      'source_id' => 'N',
      'source_type' => 'N'
    },
    'eval' => {},
    'index' => 68,
    'map' => {
      'legacy_product' => 'BLOCK',
      'subtypelist' => 'BLOCK',
      'vendor' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'HostService',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'hits',
      'service_id',
      'vendor',
      'legacy_product',
      'version',
      'subtypelist',
      'confidence',
      'last_used',
      'source_type',
      'source_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hits' => 'N',
      'last_used' => 'N',
      'port' => 'n',
      'service_id' => 'N',
      'source_id' => 'N',
      'source_type' => 'N'
    },
    'eval' => {},
    'index' => 69,
    'map' => {
      'banner' => 'BLOCK',
      'legacy_product' => 'BLOCK',
      'scan_vuln_list' => 'BLOCK',
      'subtypelist' => 'BLOCK',
      'vendor' => 'BLOCK',
      'version' => 'BLOCK',
      'vuln_list' => 'BLOCK'
    },
    'name' => 'FullHostService',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'hits',
      'service_id',
      'vendor',
      'legacy_product',
      'version',
      'confidence',
      'last_used',
      'source_type',
      'source_id',
      'banner',
      'vuln_list',
      'scan_vuln_list',
      'subtypelist'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'defined_mask' => 'N',
      'dest_criticality' => 'n',
      'dest_host_type' => 'C',
      'dest_ip_addr' => 'N',
      'dest_port' => 'n',
      'dest_service_id' => 'N',
      'dest_vlan_id' => 'n',
      'event_id' => 'N',
      'event_type' => 'C',
      'impact_flags' => 'N',
      'ip_protocol' => 'C',
      'net_protocol' => 'n',
      'policy_event_id' => 'N',
      'policy_id' => 'N',
      'policy_sensor_id' => 'N',
      'policy_tv_sec' => 'N',
      'priority' => 'N',
      'rule_id' => 'N',
      'sensor_id' => 'N',
      'sig_gen' => 'N',
      'sig_id' => 'N',
      'src_criticality' => 'n',
      'src_host_type' => 'C',
      'src_ip_addr' => 'N',
      'src_port' => 'n',
      'src_service_id' => 'N',
      'src_vlan_id' => 'n',
      'tv_sec' => 'N',
      'tv_usec' => 'N'
    },
    'eval' => {
      'dest_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'dest_os_fingerprint_uuid' => 'uuid_to_str($value)',
      'src_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'src_os_fingerprint_uuid' => 'uuid_to_str($value)'
    },
    'index' => 70,
    'map' => {
      'description' => 'BLOCK',
      'dest_os_fingerprint_uuid' => 16,
      'src_os_fingerprint_uuid' => 16
    },
    'name' => 'PolicyEvent',
    'order' => [
      'block_type',
      'block_length',
      'policy_sensor_id',
      'policy_tv_sec',
      'policy_event_id',
      'policy_id',
      'rule_id',
      'priority',
      'description',
      'event_type',
      'sensor_id',
      'sig_id',
      'sig_gen',
      'tv_sec',
      'tv_usec',
      'event_id',
      'defined_mask',
      'impact_flags',
      'ip_protocol',
      'net_protocol',
      'src_ip_addr',
      'src_host_type',
      'src_vlan_id',
      'src_os_fingerprint_uuid',
      'src_criticality',
      'src_port',
      'src_service_id',
      'dest_ip_addr',
      'dest_host_type',
      'dest_vlan_id',
      'dest_os_fingerprint_uuid',
      'dest_criticality',
      'dest_port',
      'dest_service_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'port' => 'n',
      'proto' => 'n'
    },
    'eval' => {},
    'index' => 71,
    'map' => {
      'subtype_string' => 'BLOCK',
      'value' => 'BLOCK'
    },
    'name' => 'genericScanResults',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'proto',
      'subtype_string',
      'value'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'legacy_ipaddr' => 'N',
      'port' => 'n',
      'proto' => 'n',
      'type' => 'N',
      'uid' => 'N'
    },
    'eval' => {
      'legacy_ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 72,
    'map' => {
      'generic_scan_results' => 'BLOCK',
      'services' => 'BLOCK',
      'vulns' => 'BLOCK'
    },
    'name' => 'ScanResult',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'type',
      'legacy_ipaddr',
      'port',
      'proto',
      'vulns',
      'generic_scan_results',
      'services'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'id' => 'N',
      'legacy_ipaddr' => 'N',
      'protocol' => 'N',
      'timestamp' => 'N'
    },
    'eval' => {
      'legacy_ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 73,
    'map' => {
      'email' => 'BLOCK',
      'username' => 'BLOCK'
    },
    'name' => 'UserLoginInfo',
    'order' => [
      'block_type',
      'block_length',
      'timestamp',
      'legacy_ipaddr',
      'username',
      'id',
      'protocol',
      'email'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 74,
    'map' => {
      'address' => 'BLOCK',
      'building' => 'BLOCK',
      'city' => 'BLOCK',
      'company' => 'BLOCK',
      'country_region' => 'BLOCK',
      'dept' => 'BLOCK',
      'division' => 'BLOCK',
      'email' => 'BLOCK',
      'email_alias1' => 'BLOCK',
      'email_alias2' => 'BLOCK',
      'email_alias3' => 'BLOCK',
      'first_name' => 'BLOCK',
      'full_name' => 'BLOCK',
      'initials' => 'BLOCK',
      'ip_phone' => 'BLOCK',
      'last_name' => 'BLOCK',
      'location' => 'BLOCK',
      'mailstop' => 'BLOCK',
      'office' => 'BLOCK',
      'phone' => 'BLOCK',
      'postal_code' => 'BLOCK',
      'room' => 'BLOCK',
      'staff_idn' => 'BLOCK',
      'state' => 'BLOCK',
      'title' => 'BLOCK',
      'user1' => 'BLOCK',
      'user2' => 'BLOCK',
      'user3' => 'BLOCK',
      'user4' => 'BLOCK',
      'username' => 'BLOCK'
    },
    'name' => 'UserAccountUpdateMsg',
    'order' => [
      'block_type',
      'block_length',
      'username',
      'first_name',
      'initials',
      'last_name',
      'full_name',
      'title',
      'staff_idn',
      'address',
      'city',
      'state',
      'country_region',
      'postal_code',
      'building',
      'location',
      'room',
      'company',
      'division',
      'dept',
      'office',
      'mailstop',
      'email',
      'phone',
      'ip_phone',
      'user1',
      'user2',
      'user3',
      'user4',
      'email_alias1',
      'email_alias2',
      'email_alias3'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'id' => 'N',
      'protocol' => 'N'
    },
    'eval' => {},
    'index' => 75,
    'map' => {
      'dept' => 'BLOCK',
      'email' => 'BLOCK',
      'first_name' => 'BLOCK',
      'last_name' => 'BLOCK',
      'phone' => 'BLOCK',
      'username' => 'BLOCK'
    },
    'name' => 'UserInfo',
    'order' => [
      'block_type',
      'block_length',
      'id',
      'username',
      'protocol',
      'first_name',
      'last_name',
      'email',
      'dept',
      'phone'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'port' => 'n',
      'proto' => 'n'
    },
    'eval' => {},
    'index' => 76,
    'map' => {
      'ip_range_list' => 'BLOCK'
    },
    'name' => 'UserService',
    'order' => [
      'block_type',
      'block_length',
      'ip_range_list',
      'port',
      'proto'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'source_type' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 77,
    'map' => {
      'service_list' => 'BLOCK'
    },
    'name' => 'UserServiceList',
    'order' => [
      'block_type',
      'block_length',
      'source_type',
      'uid',
      'service_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'source_type' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 78,
    'map' => {
      'ip_range_list' => 'BLOCK',
      'mac_list' => 'BLOCK'
    },
    'name' => 'UserHosts',
    'order' => [
      'block_type',
      'block_length',
      'ip_range_list',
      'mac_list',
      'uid',
      'source_type'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'port' => 'n',
      'proto' => 'n',
      'vuln_id' => 'N'
    },
    'eval' => {
      'uuid' => 'uuid_to_str($value)'
    },
    'index' => 79,
    'map' => {
      'ip_range_list' => 'BLOCK',
      'uuid' => 16,
      'vuln_str' => 'BLOCK'
    },
    'name' => 'VulnAck',
    'order' => [
      'block_type',
      'block_length',
      'ip_range_list',
      'port',
      'proto',
      'vuln_id',
      'uuid',
      'vuln_str'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'source_type' => 'N',
      'type' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 80,
    'map' => {
      'vuln_list' => 'BLOCK'
    },
    'name' => 'UserHostVulns',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'source_type',
      'type',
      'vuln_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'criticality' => 'N',
      'source_type' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 81,
    'map' => {
      'ip_range_list' => 'BLOCK'
    },
    'name' => 'UserCriticality',
    'order' => [
      'block_type',
      'block_length',
      'ip_range_list',
      'uid',
      'source_type',
      'criticality'
    ]
  },
  {
    'byte_order' => {
      'attr_id' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'source_type' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 82,
    'map' => {
      'ip_range_list' => 'BLOCK',
      'value' => 'BLOCK'
    },
    'name' => 'UserAttrValue',
    'order' => [
      'block_type',
      'block_length',
      'ip_range_list',
      'uid',
      'source_type',
      'attr_id',
      'value'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'source_type' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 83,
    'map' => {
      'protos' => 'BLOCK'
    },
    'name' => 'UserProtocolList',
    'order' => [
      'block_type',
      'block_length',
      'source_type',
      'uid',
      'protos'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'defined_mask' => 'N',
      'dest_criticality' => 'n',
      'dest_host_type' => 'C',
      'dest_ip_addr' => 'N',
      'dest_port' => 'n',
      'dest_service_id' => 'N',
      'dest_uid' => 'N',
      'dest_vlan_id' => 'n',
      'event_id' => 'N',
      'event_type' => 'C',
      'impact_flags' => 'N',
      'ip_protocol' => 'C',
      'net_protocol' => 'n',
      'policy_event_id' => 'N',
      'policy_id' => 'N',
      'policy_sensor_id' => 'N',
      'policy_tv_sec' => 'N',
      'priority' => 'N',
      'rule_id' => 'N',
      'sensor_id' => 'N',
      'sig_gen' => 'N',
      'sig_id' => 'N',
      'src_criticality' => 'n',
      'src_host_type' => 'C',
      'src_ip_addr' => 'N',
      'src_port' => 'n',
      'src_service_id' => 'N',
      'src_uid' => 'N',
      'src_vlan_id' => 'n',
      'tv_sec' => 'N',
      'tv_usec' => 'N'
    },
    'eval' => {
      'dest_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'dest_os_fingerprint_uuid' => 'uuid_to_str($value)',
      'src_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'src_os_fingerprint_uuid' => 'uuid_to_str($value)'
    },
    'index' => 84,
    'map' => {
      'description' => 'BLOCK',
      'dest_os_fingerprint_uuid' => 16,
      'src_os_fingerprint_uuid' => 16
    },
    'name' => 'PolicyEvent',
    'order' => [
      'block_type',
      'block_length',
      'policy_sensor_id',
      'policy_tv_sec',
      'policy_event_id',
      'policy_id',
      'rule_id',
      'priority',
      'description',
      'event_type',
      'sensor_id',
      'sig_id',
      'sig_gen',
      'tv_sec',
      'tv_usec',
      'event_id',
      'defined_mask',
      'impact_flags',
      'ip_protocol',
      'net_protocol',
      'src_ip_addr',
      'src_host_type',
      'src_vlan_id',
      'src_os_fingerprint_uuid',
      'src_criticality',
      'src_uid',
      'src_port',
      'src_service_id',
      'dest_ip_addr',
      'dest_host_type',
      'dest_vlan_id',
      'dest_os_fingerprint_uuid',
      'dest_criticality',
      'dest_uid',
      'dest_port',
      'dest_service_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'invalid' => 'C',
      'type' => 'N',
      'vuln_id' => 'N'
    },
    'eval' => {},
    'index' => 85,
    'map' => {},
    'name' => 'VulnList',
    'order' => [
      'block_type',
      'block_length',
      'vuln_id',
      'invalid',
      'type'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'port' => 'n',
      'proto' => 'n'
    },
    'eval' => {},
    'index' => 86,
    'map' => {
      'bugtraq_ids' => 'BLOCK',
      'cve_ids' => 'BLOCK',
      'desc' => 'BLOCK',
      'id' => 'BLOCK',
      'vuln_name' => 'BLOCK'
    },
    'name' => 'ScanVuln',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'proto',
      'id',
      'vuln_name',
      'desc',
      'bugtraq_ids',
      'cve_ids'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'fp_source_id' => 'N',
      'fp_source_type' => 'N',
      'fp_type' => 'N',
      'last_seen' => 'N',
      'ttl_diff' => 'C'
    },
    'eval' => {
      'fpuuid' => 'uuid_to_str($value)'
    },
    'index' => 87,
    'map' => {
      'fpuuid' => 16
    },
    'name' => 'OSFP',
    'order' => [
      'block_type',
      'block_length',
      'fpuuid',
      'fp_type',
      'fp_source_type',
      'fp_source_id',
      'last_seen',
      'ttl_diff'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'last_used' => 'N',
      'service_id' => 'N',
      'source_id' => 'N',
      'source_type' => 'N'
    },
    'eval' => {},
    'index' => 88,
    'map' => {
      'vendor' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'ServiceInfo',
    'order' => [
      'block_type',
      'block_length',
      'service_id',
      'vendor',
      'version',
      'last_used',
      'source_type',
      'source_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hits' => 'N',
      'last_used' => 'N',
      'port' => 'n'
    },
    'eval' => {},
    'index' => 89,
    'map' => {
      'info[SERVICE_TYPE_RNA]' => 'BLOCK',
      'subtypelist' => 'BLOCK'
    },
    'name' => 'HostService',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'hits',
      'last_used',
      'info[SERVICE_TYPE_RNA]',
      'subtypelist',
      'confidence'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hits' => 'N',
      'port' => 'n'
    },
    'eval' => {},
    'index' => 90,
    'map' => {
      'banner' => 'BLOCK',
      'info[SERVICE_TYPE_APP]' => 'BLOCK',
      'info[SERVICE_TYPE_RNA]' => 'BLOCK',
      'info[SERVICE_TYPE_SCAN]' => 'BLOCK',
      'info[SERVICE_TYPE_USER]' => 'BLOCK',
      'scan_orig_vuln_list' => 'BLOCK',
      'scan_vuln_list' => 'BLOCK',
      'subtypelist' => 'BLOCK',
      'vuln_list' => 'BLOCK'
    },
    'name' => 'FullHostService',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'hits',
      'info[SERVICE_TYPE_RNA]',
      'info[SERVICE_TYPE_USER]',
      'info[SERVICE_TYPE_SCAN]',
      'info[SERVICE_TYPE_APP]',
      'confidence',
      'banner',
      'vuln_list',
      'scan_vuln_list',
      'scan_orig_vuln_list',
      'subtypelist'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'hops' => 'C',
      'host_type' => 'N',
      'last_seen' => 'N',
      'legacy_ip' => 'N',
      'priority' => 'C',
      'secondary' => 'C',
      'type' => 'C',
      'vid' => 'n',
      'vlan_tag_present' => 'C'
    },
    'eval' => {
      'legacy_ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 91,
    'map' => {
      'apps' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CLIENT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DHCP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SERVER]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SMB]' => 'BLOCK',
      'mac' => 'BLOCK',
      'netbios_name' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'HostTracker',
    'order' => [
      'block_type',
      'block_length',
      'legacy_ip',
      'hops',
      'secondary',
      'fp_list[FINGERPRINT_TYPE_SERVER]',
      'fp_list[FINGERPRINT_TYPE_CLIENT]',
      'fp_list[FINGERPRINT_TYPE_SMB]',
      'fp_list[FINGERPRINT_TYPE_DHCP]',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type',
      'vlan_tag_present',
      'vid',
      'type',
      'priority',
      'apps',
      'netbios_name'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'criticality' => 'n',
      'hops' => 'C',
      'host_type' => 'N',
      'last_seen' => 'N',
      'legacy_ip' => 'N',
      'priority' => 'C',
      'type' => 'C',
      'vid' => 'n'
    },
    'eval' => {
      'legacy_ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 92,
    'map' => {
      'apps' => 'BLOCK',
      'attribute_list' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_APP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CLIENT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CONFLICT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DERIVED]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DHCP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SCAN]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SERVER]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SMB]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_USER]' => 'BLOCK',
      'mac' => 'BLOCK',
      'netbios_name' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'notes' => 'BLOCK',
      'scan_orig_vuln_list' => 'BLOCK',
      'scan_vuln_list' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'vuln_list' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'FullHostTracker',
    'order' => [
      'block_type',
      'block_length',
      'legacy_ip',
      'hops',
      'fp_list[FINGERPRINT_TYPE_DERIVED]',
      'fp_list[FINGERPRINT_TYPE_SERVER]',
      'fp_list[FINGERPRINT_TYPE_CLIENT]',
      'fp_list[FINGERPRINT_TYPE_SMB]',
      'fp_list[FINGERPRINT_TYPE_DHCP]',
      'fp_list[FINGERPRINT_TYPE_USER]',
      'fp_list[FINGERPRINT_TYPE_SCAN]',
      'fp_list[FINGERPRINT_TYPE_APP]',
      'fp_list[FINGERPRINT_TYPE_CONFLICT]',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type',
      'criticality',
      'vid',
      'type',
      'priority',
      'apps',
      'netbios_name',
      'notes',
      'vuln_list',
      'scan_vuln_list',
      'scan_orig_vuln_list',
      'attribute_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 93,
    'map' => {
      'val1' => 'BLOCK',
      'val10' => 'BLOCK',
      'val11' => 'BLOCK',
      'val12' => 'BLOCK',
      'val2' => 'BLOCK',
      'val3' => 'BLOCK',
      'val4' => 'BLOCK',
      'val5' => 'BLOCK',
      'val6' => 'BLOCK',
      'val7' => 'BLOCK',
      'val8' => 'BLOCK',
      'val9' => 'BLOCK'
    },
    'name' => 'fp_values',
    'order' => [
      'block_type',
      'block_length',
      'val1',
      'val2',
      'val3',
      'val4',
      'val5',
      'val6',
      'val7',
      'val8',
      'val9',
      'val10',
      'val11',
      'val12'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'port' => 'n',
      'protocol' => 'n',
      'sm_id' => 'N',
      'source_id' => 'N',
      'source_type' => 'N'
    },
    'eval' => {
      'uuid' => 'uuid_to_str($value)'
    },
    'index' => 94,
    'map' => {
      'uuid' => 16
    },
    'name' => 'IdentityData',
    'order' => [
      'block_type',
      'block_length',
      'source_type',
      'source_id',
      'uuid',
      'port',
      'protocol',
      'sm_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'last_seen' => 'N',
      'primary' => 'C',
      'ttl' => 'C'
    },
    'eval' => {
      'mac' => 'mac_to_str($value)'
    },
    'index' => 95,
    'map' => {
      'mac' => 6
    },
    'name' => 'HostMAC',
    'order' => [
      'block_type',
      'block_length',
      'ttl',
      'mac',
      'primary',
      'last_seen'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'ip' => 'N'
    },
    'eval' => {
      'ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 96,
    'map' => {
      'mac' => 'BLOCK'
    },
    'name' => 'SecondaryHostUpdate',
    'order' => [
      'block_type',
      'block_length',
      'ip',
      'mac'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'payload_id' => 'N',
      'payload_type' => 'N'
    },
    'eval' => {},
    'index' => 97,
    'map' => {},
    'name' => 'Payload',
    'order' => [
      'block_type',
      'block_length',
      'payload_type',
      'payload_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hits' => 'N',
      'last_used' => 'N',
      'port' => 'n'
    },
    'eval' => {},
    'index' => 98,
    'map' => {
      'info[SERVICE_TYPE_RNA]' => 'BLOCK',
      'payload' => 'BLOCK',
      'subtypelist' => 'BLOCK'
    },
    'name' => 'HostService',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'hits',
      'last_used',
      'info[SERVICE_TYPE_RNA]',
      'subtypelist',
      'confidence',
      'payload'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hits' => 'N',
      'port' => 'n'
    },
    'eval' => {},
    'index' => 99,
    'map' => {
      'banner' => 'BLOCK',
      'info[SERVICE_TYPE_APP]' => 'BLOCK',
      'info[SERVICE_TYPE_RNA]' => 'BLOCK',
      'info[SERVICE_TYPE_SCAN]' => 'BLOCK',
      'info[SERVICE_TYPE_USER]' => 'BLOCK',
      'payload' => 'BLOCK',
      'scan_orig_vuln_list' => 'BLOCK',
      'scan_vuln_list' => 'BLOCK',
      'subtypelist' => 'BLOCK',
      'vuln_list' => 'BLOCK'
    },
    'name' => 'FullHostService',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'hits',
      'info[SERVICE_TYPE_RNA]',
      'info[SERVICE_TYPE_USER]',
      'info[SERVICE_TYPE_SCAN]',
      'info[SERVICE_TYPE_APP]',
      'confidence',
      'banner',
      'vuln_list',
      'scan_vuln_list',
      'scan_orig_vuln_list',
      'subtypelist',
      'payload'
    ]
  },
  {
    'byte_order' => {
      'app_proto' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'hits' => 'N',
      'id' => 'N',
      'last_used' => 'N'
    },
    'eval' => {},
    'index' => 100,
    'map' => {
      'payload' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'HostClientApp',
    'order' => [
      'block_type',
      'block_length',
      'hits',
      'last_used',
      'app_proto',
      'id',
      'version',
      'payload'
    ]
  },
  {
    'byte_order' => {
      'applicationId' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'clnt_app_type_id' => 'N',
      'firstPktsecond' => 'N',
      'flow_type' => 'C',
      'initiator' => 'N',
      'initiatorBytes' => 'N',
      'initiatorPkts' => 'N',
      'initiatorPort' => 'n',
      'lastPktsecond' => 'N',
      'payload_type' => 'N',
      'protocol' => 'C',
      'responder' => 'N',
      'responderBytes' => 'N',
      'responderPkts' => 'N',
      'responderPort' => 'n',
      'src_device' => 'N',
      'tcpFlags' => 'C',
      'webApp' => 'N'
    },
    'eval' => {
      'initiator' => 'inet_ntoa(pack("N", $value))',
      'responder' => 'inet_ntoa(pack("N", $value))',
      'src_device' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 101,
    'map' => {
      'clientVersion' => 'BLOCK',
      'netbiosDomain' => 'BLOCK',
      'url' => 'BLOCK'
    },
    'name' => 'FlowStats',
    'order' => [
      'block_type',
      'block_length',
      'initiator',
      'responder',
      'initiatorPort',
      'responderPort',
      'firstPktsecond',
      'lastPktsecond',
      'flow_type',
      'src_device',
      'tcpFlags',
      'initiatorPkts',
      'responderPkts',
      'initiatorBytes',
      'responderBytes',
      'protocol',
      'applicationId',
      'clnt_app_type_id',
      'clientId',
      'clientVersion',
      'url',
      'netbiosDomain',
      'payload_type',
      'webApp'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'flag' => 'n',
      'legacy_ipaddr' => 'N',
      'port' => 'n',
      'proto' => 'n',
      'type' => 'N',
      'uid' => 'N'
    },
    'eval' => {
      'legacy_ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 102,
    'map' => {
      'generic_scan_results' => 'BLOCK',
      'services' => 'BLOCK',
      'vulns' => 'BLOCK'
    },
    'name' => 'ScanResult',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'type',
      'legacy_ipaddr',
      'port',
      'proto',
      'flag',
      'vulns',
      'generic_scan_results',
      'services'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hits' => 'N',
      'last_used' => 'N',
      'port' => 'n'
    },
    'eval' => {},
    'index' => 103,
    'map' => {
      'info[SERVICE_TYPE_RNA]' => 'BLOCK',
      'payload' => 'BLOCK'
    },
    'name' => 'HostService',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'hits',
      'last_used',
      'info[SERVICE_TYPE_RNA]',
      'confidence',
      'payload'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'confidence' => 'N',
      'hits' => 'N',
      'port' => 'n'
    },
    'eval' => {},
    'index' => 104,
    'map' => {
      'banner' => 'BLOCK',
      'info[SERVICE_TYPE_APP]' => 'BLOCK',
      'info[SERVICE_TYPE_RNA]' => 'BLOCK',
      'info[SERVICE_TYPE_SCAN]' => 'BLOCK',
      'info[SERVICE_TYPE_USER]' => 'BLOCK',
      'payload' => 'BLOCK',
      'scan_orig_vuln_list' => 'BLOCK',
      'scan_vuln_list' => 'BLOCK',
      'vuln_list' => 'BLOCK'
    },
    'name' => 'FullHostService',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'hits',
      'info[SERVICE_TYPE_RNA]',
      'info[SERVICE_TYPE_USER]',
      'info[SERVICE_TYPE_SCAN]',
      'info[SERVICE_TYPE_APP]',
      'confidence',
      'banner',
      'vuln_list',
      'scan_vuln_list',
      'scan_orig_vuln_list',
      'payload'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'last_used' => 'N',
      'service_id' => 'N',
      'source_id' => 'N',
      'source_type' => 'N'
    },
    'eval' => {},
    'index' => 105,
    'map' => {
      'subtypelist' => 'BLOCK',
      'vendor' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'ServiceInfo',
    'order' => [
      'block_type',
      'block_length',
      'service_id',
      'vendor',
      'version',
      'last_used',
      'source_type',
      'source_id',
      'subtypelist'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'last_used' => 'N',
      'service_id' => 'N',
      'source_id' => 'N',
      'source_type' => 'N'
    },
    'eval' => {},
    'index' => 106,
    'map' => {
      'subtypelist' => 'BLOCK',
      'vendor' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'FullServiceInfo',
    'order' => [
      'block_type',
      'block_length',
      'service_id',
      'vendor',
      'version',
      'last_used',
      'source_type',
      'source_id',
      'subtypelist'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'blocked' => 'C',
      'defined_mask' => 'N',
      'dest_criticality' => 'n',
      'dest_host_type' => 'C',
      'dest_ip_addr' => 'N',
      'dest_port' => 'n',
      'dest_service_id' => 'N',
      'dest_uid' => 'N',
      'dest_vlan_id' => 'n',
      'event_id' => 'N',
      'event_type' => 'C',
      'impact_flags' => 'C',
      'ip_protocol' => 'C',
      'net_protocol' => 'n',
      'policy_event_id' => 'N',
      'policy_id' => 'N',
      'policy_sensor_id' => 'N',
      'policy_tv_sec' => 'N',
      'priority' => 'N',
      'rule_id' => 'N',
      'sensor_id' => 'N',
      'sig_gen' => 'N',
      'sig_id' => 'N',
      'src_criticality' => 'n',
      'src_host_type' => 'C',
      'src_ip_addr' => 'N',
      'src_port' => 'n',
      'src_service_id' => 'N',
      'src_uid' => 'N',
      'src_vlan_id' => 'n',
      'tv_sec' => 'N',
      'tv_usec' => 'N'
    },
    'eval' => {
      'dest_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'dest_os_fingerprint_uuid' => 'uuid_to_str($value)',
      'src_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'src_os_fingerprint_uuid' => 'uuid_to_str($value)'
    },
    'index' => 107,
    'map' => {
      'description' => 'BLOCK',
      'dest_os_fingerprint_uuid' => 16,
      'src_os_fingerprint_uuid' => 16
    },
    'name' => 'PolicyEvent',
    'order' => [
      'block_type',
      'block_length',
      'policy_sensor_id',
      'policy_tv_sec',
      'policy_event_id',
      'policy_id',
      'rule_id',
      'priority',
      'description',
      'event_type',
      'sensor_id',
      'sig_id',
      'sig_gen',
      'tv_sec',
      'tv_usec',
      'event_id',
      'defined_mask',
      'impact_flags',
      'ip_protocol',
      'net_protocol',
      'src_ip_addr',
      'src_host_type',
      'src_vlan_id',
      'src_os_fingerprint_uuid',
      'src_criticality',
      'src_uid',
      'src_port',
      'src_service_id',
      'dest_ip_addr',
      'dest_host_type',
      'dest_vlan_id',
      'dest_os_fingerprint_uuid',
      'dest_criticality',
      'dest_uid',
      'dest_port',
      'dest_service_id',
      'blocked'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'port' => 'n',
      'proto' => 'n'
    },
    'eval' => {},
    'index' => 108,
    'map' => {
      'subtype_string' => 'BLOCK',
      'subtype_string_clean' => 'BLOCK',
      'value' => 'BLOCK',
      'value_clean' => 'BLOCK'
    },
    'name' => 'genericScanResults',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'proto',
      'subtype_string',
      'value',
      'subtype_string_clean',
      'value_clean'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'port' => 'n',
      'proto' => 'n'
    },
    'eval' => {},
    'index' => 109,
    'map' => {
      'bugtraq_ids' => 'BLOCK',
      'cve_ids' => 'BLOCK',
      'desc' => 'BLOCK',
      'desc_clean' => 'BLOCK',
      'id' => 'BLOCK',
      'name_clean' => 'BLOCK',
      'vuln_name' => 'BLOCK'
    },
    'name' => 'ScanVuln',
    'order' => [
      'block_type',
      'block_length',
      'port',
      'proto',
      'id',
      'vuln_name',
      'desc',
      'name_clean',
      'desc_clean',
      'bugtraq_ids',
      'cve_ids'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'ip' => 'N',
      'reset_wl' => 'N'
    },
    'eval' => {
      'ip' => 'inet_ntoa(pack("N", $value))',
      'wl_uuid' => 'uuid_to_str($value)'
    },
    'index' => 110,
    'map' => {
      'wl_uuid' => 16
    },
    'name' => 'PolicyEngineControlMsg_V2',
    'order' => [
      'block_type',
      'block_length',
      'ip',
      'reset_wl',
      'wl_uuid'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'criticality' => 'n',
      'hops' => 'C',
      'host_type' => 'N',
      'last_seen' => 'N',
      'legacy_ip' => 'N',
      'priority' => 'C',
      'type' => 'C',
      'vid' => 'n'
    },
    'eval' => {
      'legacy_ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 111,
    'map' => {
      'apps' => 'BLOCK',
      'attribute_list' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_APP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CLIENT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CONFLICT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DERIVED]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DHCP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SCAN]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SERVER]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SMB]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_USER]' => 'BLOCK',
      'mac' => 'BLOCK',
      'netbios_name' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'notes' => 'BLOCK',
      'scan_orig_vuln_list' => 'BLOCK',
      'scan_vuln_list' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'vuln_list' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'FullHostTracker',
    'order' => [
      'block_type',
      'block_length',
      'legacy_ip',
      'hops',
      'fp_list[FINGERPRINT_TYPE_DERIVED]',
      'fp_list[FINGERPRINT_TYPE_SERVER]',
      'fp_list[FINGERPRINT_TYPE_CLIENT]',
      'fp_list[FINGERPRINT_TYPE_SMB]',
      'fp_list[FINGERPRINT_TYPE_DHCP]',
      'fp_list[FINGERPRINT_TYPE_USER]',
      'fp_list[FINGERPRINT_TYPE_SCAN]',
      'fp_list[FINGERPRINT_TYPE_APP]',
      'fp_list[FINGERPRINT_TYPE_CONFLICT]',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type',
      'criticality',
      'vid',
      'type',
      'priority',
      'apps',
      'netbios_name',
      'notes',
      'vuln_list',
      'scan_vuln_list',
      'scan_orig_vuln_list',
      'attribute_list'
    ]
  },
  {
    'byte_order' => {
      'app_proto' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'hits' => 'N',
      'id' => 'N',
      'last_used' => 'N'
    },
    'eval' => {},
    'index' => 112,
    'map' => {
      'payload' => 'BLOCK',
      'version' => 'BLOCK',
      'vuln_list' => 'BLOCK'
    },
    'name' => 'FullHostClientApp',
    'order' => [
      'block_type',
      'block_length',
      'hits',
      'last_used',
      'app_proto',
      'id',
      'version',
      'payload',
      'vuln_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'flags' => 'C',
      'for_policy' => 'C',
      'id' => 'N'
    },
    'eval' => {},
    'index' => 113,
    'map' => {
      'email' => 'BLOCK',
      'username' => 'BLOCK'
    },
    'name' => 'UserAccountInfoMsg',
    'order' => [
      'block_type',
      'block_length',
      'id',
      'username',
      'email',
      'flags',
      'for_policy'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'type' => 'C'
    },
    'eval' => {},
    'index' => 114,
    'map' => {
      'filename' => 'BLOCK',
      'peer_uuid' => 'BLOCK'
    },
    'name' => 'UserLoadSnapshotMsg',
    'order' => [
      'block_type',
      'block_length',
      'type',
      'filename',
      'peer_uuid'
    ]
  },
  {
    'byte_order' => {
      'applicationId' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'firstPktsecond' => 'N',
      'initiatorPort' => 'n',
      'lastPktsecond' => 'N',
      'protocol' => 'C',
      'responderPort' => 'n',
      'ruleAction' => 'N',
      'ruleId' => 'N',
      'sensorId' => 'N',
      'tcpFlags' => 'n',
      'urlCategory' => 'N',
      'urlReputation' => 'N',
      'userId' => 'N',
      'webApp' => 'N'
    },
    'eval' => {
      'egressIntf' => 'uuid_to_str($value)',
      'egressZone' => 'uuid_to_str($value)',
      'ingressIntf' => 'uuid_to_str($value)',
      'ingressZone' => 'uuid_to_str($value)',
      'initiatorBytes' => 'int64_to_bigint($value)',
      'initiatorIp' => 'ipv6_to_str($value)',
      'initiatorPkts' => 'int64_to_bigint($value)',
      'netflowSource' => 'ipv6_to_str($value)',
      'policyRevision' => 'uuid_to_str($value)',
      'responderBytes' => 'int64_to_bigint($value)',
      'responderIp' => 'ipv6_to_str($value)',
      'responderPkts' => 'int64_to_bigint($value)'
    },
    'index' => 115,
    'map' => {
      'clientVersion' => 'BLOCK',
      'egressIntf' => 16,
      'egressZone' => 16,
      'ingressIntf' => 16,
      'ingressZone' => 16,
      'initiatorBytes' => 8,
      'initiatorIp' => 16,
      'initiatorPkts' => 8,
      'netbiosDomain' => 'BLOCK',
      'netflowSource' => 16,
      'policyRevision' => 16,
      'responderBytes' => 8,
      'responderIp' => 16,
      'responderPkts' => 8,
      'url' => 'BLOCK'
    },
    'name' => 'FlowStats',
    'order' => [
      'block_type',
      'block_length',
      'sensorId',
      'ingressZone',
      'egressZone',
      'ingressIntf',
      'egressIntf',
      'initiatorIp',
      'responderIp',
      'policyRevision',
      'ruleId',
      'ruleAction',
      'initiatorPort',
      'responderPort',
      'tcpFlags',
      'protocol',
      'netflowSource',
      'firstPktsecond',
      'lastPktsecond',
      'initiatorPkts',
      'responderPkts',
      'initiatorBytes',
      'responderBytes',
      'userId',
      'applicationId',
      'urlCategory',
      'urlReputation',
      'clientId',
      'webApp',
      'url',
      'netbiosDomain',
      'clientVersion'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'blocked' => 'C',
      'defined_mask' => 'N',
      'dest_criticality' => 'n',
      'dest_host_type' => 'C',
      'dest_ip_addr' => 'N',
      'dest_port' => 'n',
      'dest_service_id' => 'N',
      'dest_uid' => 'N',
      'dest_vlan_id' => 'n',
      'event_id' => 'N',
      'event_type' => 'C',
      'impact_flags' => 'C',
      'ip_protocol' => 'C',
      'net_protocol' => 'n',
      'policy_event_id' => 'N',
      'policy_id' => 'N',
      'policy_sensor_id' => 'N',
      'policy_tv_sec' => 'N',
      'priority' => 'N',
      'rule_id' => 'N',
      'sensor_id' => 'N',
      'sig_gen' => 'N',
      'sig_id' => 'N',
      'src_criticality' => 'n',
      'src_host_type' => 'C',
      'src_ip_addr' => 'N',
      'src_port' => 'n',
      'src_service_id' => 'N',
      'src_uid' => 'N',
      'src_vlan_id' => 'n',
      'tv_sec' => 'N',
      'tv_usec' => 'N'
    },
    'eval' => {
      'dest_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'dest_os_fingerprint_uuid' => 'uuid_to_str($value)',
      'interface_egress_uuid' => 'uuid_to_str($value)',
      'interface_ingress_uuid' => 'uuid_to_str($value)',
      'security_zone_egress_uuid' => 'uuid_to_str($value)',
      'security_zone_ingress_uuid' => 'uuid_to_str($value)',
      'src_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'src_os_fingerprint_uuid' => 'uuid_to_str($value)'
    },
    'index' => 116,
    'map' => {
      'description' => 'BLOCK',
      'dest_os_fingerprint_uuid' => 16,
      'interface_egress_uuid' => 16,
      'interface_ingress_uuid' => 16,
      'security_zone_egress_uuid' => 16,
      'security_zone_ingress_uuid' => 16,
      'src_os_fingerprint_uuid' => 16
    },
    'name' => 'PolicyEvent',
    'order' => [
      'block_type',
      'block_length',
      'policy_sensor_id',
      'policy_tv_sec',
      'policy_event_id',
      'policy_id',
      'rule_id',
      'priority',
      'description',
      'event_type',
      'sensor_id',
      'sig_id',
      'sig_gen',
      'tv_sec',
      'tv_usec',
      'event_id',
      'defined_mask',
      'impact_flags',
      'ip_protocol',
      'net_protocol',
      'src_ip_addr',
      'src_host_type',
      'src_vlan_id',
      'src_os_fingerprint_uuid',
      'src_criticality',
      'src_uid',
      'src_port',
      'src_service_id',
      'dest_ip_addr',
      'dest_host_type',
      'dest_vlan_id',
      'dest_os_fingerprint_uuid',
      'dest_criticality',
      'dest_uid',
      'dest_port',
      'dest_service_id',
      'blocked',
      'interface_ingress_uuid',
      'interface_egress_uuid',
      'security_zone_ingress_uuid',
      'security_zone_egress_uuid'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'last_used' => 'N',
      'service_id' => 'N',
      'source_id' => 'N',
      'source_type' => 'N'
    },
    'eval' => {},
    'index' => 117,
    'map' => {
      'subtypelist' => 'BLOCK',
      'vendor' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'ServiceInfo',
    'order' => [
      'block_type',
      'block_length',
      'service_id',
      'vendor',
      'version',
      'last_used',
      'source_type',
      'source_id',
      'subtypelist'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'drop_user_product' => 'N',
      'port' => 'n',
      'product_id' => 'N',
      'proto' => 'n',
      'service_id' => 'N',
      'software_id' => 'N',
      'source_type' => 'N',
      'uid' => 'N',
      'vendor_id' => 'N'
    },
    'eval' => {
      'uuid' => 'uuid_to_str($value)'
    },
    'index' => 118,
    'map' => {
      'build' => 'BLOCK',
      'custom_product_str' => 'BLOCK',
      'custom_vendor_str' => 'BLOCK',
      'custom_version_str' => 'BLOCK',
      'extension' => 'BLOCK',
      'fix_list' => 'BLOCK',
      'ip_range_list' => 'BLOCK',
      'major' => 'BLOCK',
      'minor' => 'BLOCK',
      'patch' => 'BLOCK',
      'revision' => 'BLOCK',
      'to_major' => 'BLOCK',
      'to_minor' => 'BLOCK',
      'to_revision' => 'BLOCK',
      'uuid' => 16
    },
    'name' => 'UserProduct',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'source_type',
      'ip_range_list',
      'port',
      'proto',
      'drop_user_product',
      'custom_vendor_str',
      'custom_product_str',
      'custom_version_str',
      'software_id',
      'service_id',
      'vendor_id',
      'product_id',
      'major',
      'minor',
      'revision',
      'to_major',
      'to_minor',
      'to_revision',
      'build',
      'patch',
      'extension',
      'uuid',
      'fix_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'bucket_stime' => 'N',
      'bytes_recv' => 'N',
      'bytes_sent' => 'N',
      'connections_n' => 'N',
      'flow_type' => 'C',
      'initiator' => 'N',
      'packets_recv' => 'N',
      'packets_sent' => 'N',
      'protocol' => 'C',
      'responder' => 'N',
      'responder_port' => 'n',
      'service_id' => 'N',
      'src_device' => 'N'
    },
    'eval' => {
      'initiator' => 'inet_ntoa(pack("N", $value))',
      'responder' => 'inet_ntoa(pack("N", $value))',
      'src_device' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 119,
    'map' => {},
    'name' => 'FlowChunk',
    'order' => [
      'block_type',
      'block_length',
      'initiator',
      'responder',
      'bucket_stime',
      'service_id',
      'responder_port',
      'protocol',
      'flow_type',
      'src_device',
      'packets_sent',
      'packets_recv',
      'bytes_sent',
      'bytes_recv',
      'connections_n'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'id' => 'N',
      'protocol' => 'N'
    },
    'eval' => {},
    'index' => 120,
    'map' => {
      'dept' => 'BLOCK',
      'email' => 'BLOCK',
      'first_name' => 'BLOCK',
      'last_name' => 'BLOCK',
      'phone' => 'BLOCK',
      'username' => 'BLOCK'
    },
    'name' => 'UserInfo',
    'order' => [
      'block_type',
      'block_length',
      'id',
      'username',
      'protocol',
      'first_name',
      'last_name',
      'email',
      'dept',
      'phone'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'id' => 'N',
      'legacy_ipaddr' => 'N',
      'protocol' => 'N',
      'timestamp' => 'N'
    },
    'eval' => {
      'legacy_ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 121,
    'map' => {
      'email' => 'BLOCK',
      'username' => 'BLOCK'
    },
    'name' => 'UserLoginInfo',
    'order' => [
      'block_type',
      'block_length',
      'timestamp',
      'legacy_ipaddr',
      'username',
      'id',
      'protocol',
      'email'
    ]
  },
  {
    'byte_order' => {
      'app_proto' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'hits' => 'N',
      'id' => 'N',
      'last_used' => 'N'
    },
    'eval' => {},
    'index' => 122,
    'map' => {
      'payload' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'HostClientApp',
    'order' => [
      'block_type',
      'block_length',
      'hits',
      'last_used',
      'id',
      'app_proto',
      'version',
      'payload'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'payload_id' => 'N'
    },
    'eval' => {},
    'index' => 123,
    'map' => {},
    'name' => 'Payload',
    'order' => [
      'block_type',
      'block_length',
      'payload_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'client_app_id' => 'N',
      'client_app_proto' => 'N',
      'port' => 'n',
      'proto' => 'n',
      'vuln_id' => 'N'
    },
    'eval' => {
      'uuid' => 'uuid_to_str($value)'
    },
    'index' => 124,
    'map' => {
      'ip_range_list' => 'BLOCK',
      'uuid' => 16,
      'version' => 'BLOCK',
      'vuln_str' => 'BLOCK'
    },
    'name' => 'VulnAck',
    'order' => [
      'block_type',
      'block_length',
      'ip_range_list',
      'port',
      'proto',
      'vuln_id',
      'uuid',
      'vuln_str',
      'client_app_id',
      'client_app_proto',
      'version'
    ]
  },
  {
    'byte_order' => {
      'applicationId' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'clnt_app_type_id' => 'N',
      'firstPktsecond' => 'N',
      'flow_type' => 'C',
      'initiator' => 'N',
      'initiatorBytes' => 'N',
      'initiatorPkts' => 'N',
      'initiatorPort' => 'n',
      'lastPktsecond' => 'N',
      'netflow destination tos' => 'C',
      'netflow input snmp interface' => 'n',
      'netflow output snmp interface' => 'n',
      'netflow source tos' => 'C',
      'payload_type' => 'N',
      'protocol' => 'C',
      'responder' => 'N',
      'responderBytes' => 'N',
      'responderPkts' => 'N',
      'responderPort' => 'n',
      'src_device' => 'N',
      'tcpFlags' => 'C',
      'webApp' => 'N'
    },
    'eval' => {
      'initiator' => 'inet_ntoa(pack("N", $value))',
      'responder' => 'inet_ntoa(pack("N", $value))',
      'src_device' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 125,
    'map' => {
      'clientVersion' => 'BLOCK',
      'netbiosDomain' => 'BLOCK',
      'url' => 'BLOCK'
    },
    'name' => 'FlowStats',
    'order' => [
      'block_type',
      'block_length',
      'initiator',
      'responder',
      'initiatorPort',
      'responderPort',
      'firstPktsecond',
      'lastPktsecond',
      'flow_type',
      'netflow source tos',
      'netflow destination tos',
      'netflow input snmp interface',
      'netflow output snmp interface',
      'src_device',
      'tcpFlags',
      'initiatorPkts',
      'responderPkts',
      'initiatorBytes',
      'responderBytes',
      'protocol',
      'applicationId',
      'clnt_app_type_id',
      'clientId',
      'clientVersion',
      'url',
      'netbiosDomain',
      'payload_type',
      'webApp'
    ]
  },
  {
    'byte_order' => {
      'applicationId' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'firstPktsecond' => 'N',
      'initiatorPort' => 'n',
      'lastPktsecond' => 'N',
      'layer' => 'C',
      'monitorRules[0]' => 'N',
      'monitorRules[1]' => 'N',
      'monitorRules[2]' => 'N',
      'monitorRules[3]' => 'N',
      'monitorRules[4]' => 'N',
      'monitorRules[5]' => 'N',
      'monitorRules[6]' => 'N',
      'monitorRules[7]' => 'N',
      'protocol' => 'C',
      'responderPort' => 'n',
      'ruleAction' => 'n',
      'ruleId' => 'N',
      'ruleReason' => 'n',
      'sensorId' => 'N',
      'src_dest' => 'C',
      'tcpFlags' => 'n',
      'urlCategory' => 'N',
      'urlReputation' => 'N',
      'userId' => 'N',
      'webApp' => 'N'
    },
    'eval' => {
      'egressIntf' => 'uuid_to_str($value)',
      'egressZone' => 'uuid_to_str($value)',
      'ingressIntf' => 'uuid_to_str($value)',
      'ingressZone' => 'uuid_to_str($value)',
      'initiatorBytes' => 'int64_to_bigint($value)',
      'initiatorIp' => 'ipv6_to_str($value)',
      'initiatorPkts' => 'int64_to_bigint($value)',
      'netflowSource' => 'ipv6_to_str($value)',
      'policyRevision' => 'uuid_to_str($value)',
      'responderBytes' => 'int64_to_bigint($value)',
      'responderIp' => 'ipv6_to_str($value)',
      'responderPkts' => 'int64_to_bigint($value)'
    },
    'index' => 126,
    'map' => {
      'clientVersion' => 'BLOCK',
      'egressIntf' => 16,
      'egressZone' => 16,
      'ingressIntf' => 16,
      'ingressZone' => 16,
      'initiatorBytes' => 8,
      'initiatorIp' => 16,
      'initiatorPkts' => 8,
      'netbiosDomain' => 'BLOCK',
      'netflowSource' => 16,
      'policyRevision' => 16,
      'responderBytes' => 8,
      'responderIp' => 16,
      'responderPkts' => 8,
      'url' => 'BLOCK'
    },
    'name' => 'FlowStats',
    'order' => [
      'block_type',
      'block_length',
      'sensorId',
      'ingressZone',
      'egressZone',
      'ingressIntf',
      'egressIntf',
      'initiatorIp',
      'responderIp',
      'policyRevision',
      'ruleId',
      'ruleAction',
      'ruleReason',
      'initiatorPort',
      'responderPort',
      'tcpFlags',
      'protocol',
      'netflowSource',
      'firstPktsecond',
      'lastPktsecond',
      'initiatorPkts',
      'responderPkts',
      'initiatorBytes',
      'responderBytes',
      'userId',
      'applicationId',
      'urlCategory',
      'urlReputation',
      'clientId',
      'webApp',
      'url',
      'netbiosDomain',
      'clientVersion',
      'monitorRules[0]',
      'monitorRules[1]',
      'monitorRules[2]',
      'monitorRules[3]',
      'monitorRules[4]',
      'monitorRules[5]',
      'monitorRules[6]',
      'monitorRules[7]',
      'src_dest',
      'layer'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'id' => 'N',
      'legacy_ipaddr' => 'N',
      'login_type' => 'C',
      'protocol' => 'N',
      'timestamp' => 'N'
    },
    'eval' => {
      'ipaddr_v6' => 'ipv6_to_str($value)',
      'legacy_ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 127,
    'map' => {
      'email' => 'BLOCK',
      'ipaddr_v6' => 16,
      'reported_by' => 'BLOCK',
      'username' => 'BLOCK'
    },
    'name' => 'UserLoginInfo',
    'order' => [
      'block_type',
      'block_length',
      'timestamp',
      'legacy_ipaddr',
      'username',
      'id',
      'protocol',
      'email',
      'ipaddr_v6',
      'login_type',
      'reported_by'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'blocked' => 'C',
      'defined_mask' => 'N',
      'dest_criticality' => 'n',
      'dest_host_type' => 'C',
      'dest_ip_addr' => 'N',
      'dest_port' => 'n',
      'dest_service_id' => 'N',
      'dest_uid' => 'N',
      'dest_vlan_id' => 'n',
      'event_id' => 'N',
      'event_type' => 'C',
      'impact_flags' => 'C',
      'ip_protocol' => 'C',
      'net_protocol' => 'n',
      'policy_event_id' => 'N',
      'policy_id' => 'N',
      'policy_sensor_id' => 'N',
      'policy_tv_sec' => 'N',
      'priority' => 'N',
      'rule_id' => 'N',
      'sensor_id' => 'N',
      'sig_gen' => 'N',
      'sig_id' => 'N',
      'src_criticality' => 'n',
      'src_host_type' => 'C',
      'src_ip_addr' => 'N',
      'src_port' => 'n',
      'src_service_id' => 'N',
      'src_uid' => 'N',
      'src_vlan_id' => 'n',
      'tv_sec' => 'N',
      'tv_usec' => 'N'
    },
    'eval' => {
      'dest_ip6_addr' => 'ipv6_to_str($value)',
      'dest_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'dest_os_fingerprint_uuid' => 'uuid_to_str($value)',
      'interface_egress_uuid' => 'uuid_to_str($value)',
      'interface_ingress_uuid' => 'uuid_to_str($value)',
      'security_zone_egress_uuid' => 'uuid_to_str($value)',
      'security_zone_ingress_uuid' => 'uuid_to_str($value)',
      'src_ip6_addr' => 'ipv6_to_str($value)',
      'src_ip_addr' => 'inet_ntoa(pack("N", $value))',
      'src_os_fingerprint_uuid' => 'uuid_to_str($value)'
    },
    'index' => 128,
    'map' => {
      'description' => 'BLOCK',
      'dest_ip6_addr' => 16,
      'dest_os_fingerprint_uuid' => 16,
      'interface_egress_uuid' => 16,
      'interface_ingress_uuid' => 16,
      'security_zone_egress_uuid' => 16,
      'security_zone_ingress_uuid' => 16,
      'src_ip6_addr' => 16,
      'src_os_fingerprint_uuid' => 16
    },
    'name' => 'PolicyEvent',
    'order' => [
      'block_type',
      'block_length',
      'policy_sensor_id',
      'policy_tv_sec',
      'policy_event_id',
      'policy_id',
      'rule_id',
      'priority',
      'description',
      'event_type',
      'sensor_id',
      'sig_id',
      'sig_gen',
      'tv_sec',
      'tv_usec',
      'event_id',
      'defined_mask',
      'impact_flags',
      'ip_protocol',
      'net_protocol',
      'src_ip_addr',
      'src_host_type',
      'src_vlan_id',
      'src_os_fingerprint_uuid',
      'src_criticality',
      'src_uid',
      'src_port',
      'src_service_id',
      'dest_ip_addr',
      'dest_host_type',
      'dest_vlan_id',
      'dest_os_fingerprint_uuid',
      'dest_criticality',
      'dest_uid',
      'dest_port',
      'dest_service_id',
      'blocked',
      'interface_ingress_uuid',
      'interface_egress_uuid',
      'security_zone_ingress_uuid',
      'security_zone_egress_uuid',
      'src_ip6_addr',
      'dest_ip6_addr'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 129,
    'map' => {
      'val1' => 'BLOCK',
      'val10' => 'BLOCK',
      'val11' => 'BLOCK',
      'val12' => 'BLOCK',
      'val13' => 'BLOCK',
      'val14' => 'BLOCK',
      'val15' => 'BLOCK',
      'val2' => 'BLOCK',
      'val3' => 'BLOCK',
      'val4' => 'BLOCK',
      'val5' => 'BLOCK',
      'val6' => 'BLOCK',
      'val7' => 'BLOCK',
      'val8' => 'BLOCK',
      'val9' => 'BLOCK'
    },
    'name' => 'fp_values',
    'order' => [
      'block_type',
      'block_length',
      'val1',
      'val2',
      'val3',
      'val4',
      'val5',
      'val6',
      'val7',
      'val8',
      'val9',
      'val10',
      'val11',
      'val12',
      'val13',
      'val14',
      'val15'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'fp_source_id' => 'N',
      'fp_source_type' => 'N',
      'fp_type' => 'N',
      'last_seen' => 'N',
      'ttl_diff' => 'C'
    },
    'eval' => {
      'fpuuid' => 'uuid_to_str($value)'
    },
    'index' => 130,
    'map' => {
      'device' => 'BLOCK',
      'fpuuid' => 16
    },
    'name' => 'OSFP',
    'order' => [
      'block_type',
      'block_length',
      'fpuuid',
      'fp_type',
      'fp_source_type',
      'fp_source_id',
      'last_seen',
      'ttl_diff',
      'device'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'jailbroken' => 'N',
      'last_seen' => 'N',
      'mobile' => 'N'
    },
    'eval' => {},
    'index' => 131,
    'map' => {
      'device_string' => 'BLOCK'
    },
    'name' => 'DeviceInfo',
    'order' => [
      'block_type',
      'block_length',
      'device_string',
      'last_seen',
      'mobile',
      'jailbroken'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'hops' => 'C',
      'host_type' => 'N',
      'jailbroken' => 'C',
      'last_seen' => 'N',
      'legacy_ip' => 'N',
      'mobile' => 'C',
      'priority' => 'C',
      'secondary' => 'C',
      'type' => 'C',
      'vid' => 'n',
      'vlan_tag_present' => 'C'
    },
    'eval' => {
      'legacy_ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 132,
    'map' => {
      'apps' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CLIENT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DHCP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_MOBILE]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SERVER]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SMB]' => 'BLOCK',
      'mac' => 'BLOCK',
      'netbios_name' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'HostTracker',
    'order' => [
      'block_type',
      'block_length',
      'legacy_ip',
      'hops',
      'secondary',
      'fp_list[FINGERPRINT_TYPE_SERVER]',
      'fp_list[FINGERPRINT_TYPE_CLIENT]',
      'fp_list[FINGERPRINT_TYPE_SMB]',
      'fp_list[FINGERPRINT_TYPE_DHCP]',
      'fp_list[FINGERPRINT_TYPE_MOBILE]',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type',
      'mobile',
      'jailbroken',
      'vlan_tag_present',
      'vid',
      'type',
      'priority',
      'apps',
      'netbios_name'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'legacy_ipaddr' => 'N',
      'timestamp' => 'N'
    },
    'eval' => {
      'ipaddr_v6' => 'ipv6_to_str($value)',
      'legacy_ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 133,
    'map' => {
      'ipaddr_v6' => 16,
      'netbios_name' => 'BLOCK',
      'reported_by' => 'BLOCK'
    },
    'name' => 'MachineLoginInfo',
    'order' => [
      'block_type',
      'block_length',
      'timestamp',
      'legacy_ipaddr',
      'ipaddr_v6',
      'netbios_name',
      'reported_by'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'drop_user_product' => 'N',
      'jailbroken' => 'C',
      'mobile' => 'C',
      'port' => 'n',
      'product_id' => 'N',
      'proto' => 'n',
      'service_id' => 'N',
      'software_id' => 'N',
      'source_type' => 'N',
      'uid' => 'N',
      'vendor_id' => 'N'
    },
    'eval' => {
      'uuid' => 'uuid_to_str($value)'
    },
    'index' => 134,
    'map' => {
      'build' => 'BLOCK',
      'custom_product_str' => 'BLOCK',
      'custom_vendor_str' => 'BLOCK',
      'custom_version_str' => 'BLOCK',
      'device_string' => 'BLOCK',
      'extension' => 'BLOCK',
      'fix_list' => 'BLOCK',
      'ip_range_list' => 'BLOCK',
      'major' => 'BLOCK',
      'minor' => 'BLOCK',
      'patch' => 'BLOCK',
      'revision' => 'BLOCK',
      'to_major' => 'BLOCK',
      'to_minor' => 'BLOCK',
      'to_revision' => 'BLOCK',
      'uuid' => 16
    },
    'name' => 'UserProduct',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'source_type',
      'ip_range_list',
      'port',
      'proto',
      'drop_user_product',
      'custom_vendor_str',
      'custom_product_str',
      'custom_version_str',
      'software_id',
      'service_id',
      'vendor_id',
      'product_id',
      'major',
      'minor',
      'revision',
      'to_major',
      'to_minor',
      'to_revision',
      'build',
      'patch',
      'extension',
      'uuid',
      'device_string',
      'mobile',
      'jailbroken',
      'fix_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'criticality' => 'n',
      'hops' => 'C',
      'host_type' => 'N',
      'jailbroken' => 'C',
      'last_seen' => 'N',
      'legacy_ip' => 'N',
      'mobile' => 'C',
      'priority' => 'C',
      'type' => 'C',
      'vid' => 'n',
      'vlan_tag_present' => 'C'
    },
    'eval' => {
      'legacy_ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 135,
    'map' => {
      'apps' => 'BLOCK',
      'attribute_list' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_APP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CLIENT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CONFLICT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DERIVED]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DHCP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SCAN]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SERVER]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SMB]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_USER]' => 'BLOCK',
      'mac' => 'BLOCK',
      'netbios_name' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'notes' => 'BLOCK',
      'scan_orig_vuln_list' => 'BLOCK',
      'scan_vuln_list' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'vuln_list' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'FullHostTracker',
    'order' => [
      'block_type',
      'block_length',
      'legacy_ip',
      'hops',
      'fp_list[FINGERPRINT_TYPE_DERIVED]',
      'fp_list[FINGERPRINT_TYPE_SERVER]',
      'fp_list[FINGERPRINT_TYPE_CLIENT]',
      'fp_list[FINGERPRINT_TYPE_SMB]',
      'fp_list[FINGERPRINT_TYPE_DHCP]',
      'fp_list[FINGERPRINT_TYPE_USER]',
      'fp_list[FINGERPRINT_TYPE_SCAN]',
      'fp_list[FINGERPRINT_TYPE_APP]',
      'fp_list[FINGERPRINT_TYPE_CONFLICT]',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type',
      'criticality',
      'vid',
      'type',
      'priority',
      'apps',
      'netbios_name',
      'notes',
      'vuln_list',
      'scan_vuln_list',
      'scan_orig_vuln_list',
      'attribute_list',
      'mobile',
      'jailbroken',
      'vlan_tag_present'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'bucket_stime' => 'N',
      'connections_n' => 'N',
      'flow_type' => 'C',
      'initiator' => 'N',
      'protocol' => 'C',
      'responder' => 'N',
      'responder_port' => 'n',
      'service_id' => 'N',
      'src_device' => 'N'
    },
    'eval' => {
      'bytes_recv' => 'int64_to_bigint($value)',
      'bytes_sent' => 'int64_to_bigint($value)',
      'initiator' => 'inet_ntoa(pack("N", $value))',
      'packets_recv' => 'int64_to_bigint($value)',
      'packets_sent' => 'int64_to_bigint($value)',
      'responder' => 'inet_ntoa(pack("N", $value))',
      'src_device' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 136,
    'map' => {
      'bytes_recv' => 8,
      'bytes_sent' => 8,
      'packets_recv' => 8,
      'packets_sent' => 8
    },
    'name' => 'FlowChunk',
    'order' => [
      'block_type',
      'block_length',
      'initiator',
      'responder',
      'bucket_stime',
      'service_id',
      'responder_port',
      'protocol',
      'flow_type',
      'src_device',
      'packets_sent',
      'packets_recv',
      'bytes_sent',
      'bytes_recv',
      'connections_n'
    ]
  },
  {
    'byte_order' => {
      'applicationId' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'connectId' => 'n',
      'fileCount' => 'n',
      'firstPktsecond' => 'N',
      'initiatorPort' => 'n',
      'instanceId' => 'n',
      'ipsCount' => 'n',
      'lastPktsecond' => 'N',
      'layer' => 'C',
      'monitorRules[0]' => 'N',
      'monitorRules[1]' => 'N',
      'monitorRules[2]' => 'N',
      'monitorRules[3]' => 'N',
      'monitorRules[4]' => 'N',
      'monitorRules[5]' => 'N',
      'monitorRules[6]' => 'N',
      'monitorRules[7]' => 'N',
      'protocol' => 'C',
      'responderPort' => 'n',
      'ruleAction' => 'n',
      'ruleId' => 'N',
      'ruleReason' => 'n',
      'sensorId' => 'N',
      'src_dest' => 'C',
      'tcpFlags' => 'n',
      'urlCategory' => 'N',
      'urlReputation' => 'N',
      'userId' => 'N',
      'webApp' => 'N'
    },
    'eval' => {
      'egressIntf' => 'uuid_to_str($value)',
      'egressZone' => 'uuid_to_str($value)',
      'ingressIntf' => 'uuid_to_str($value)',
      'ingressZone' => 'uuid_to_str($value)',
      'initiatorBytes' => 'int64_to_bigint($value)',
      'initiatorIp' => 'ipv6_to_str($value)',
      'initiatorPkts' => 'int64_to_bigint($value)',
      'netflowSource' => 'ipv6_to_str($value)',
      'policyRevision' => 'uuid_to_str($value)',
      'responderBytes' => 'int64_to_bigint($value)',
      'responderIp' => 'ipv6_to_str($value)',
      'responderPkts' => 'int64_to_bigint($value)'
    },
    'index' => 137,
    'map' => {
      'clientVersion' => 'BLOCK',
      'egressIntf' => 16,
      'egressZone' => 16,
      'ingressIntf' => 16,
      'ingressZone' => 16,
      'initiatorBytes' => 8,
      'initiatorIp' => 16,
      'initiatorPkts' => 8,
      'netbiosDomain' => 'BLOCK',
      'netflowSource' => 16,
      'policyRevision' => 16,
      'responderBytes' => 8,
      'responderIp' => 16,
      'responderPkts' => 8,
      'url' => 'BLOCK'
    },
    'name' => 'FlowStats',
    'order' => [
      'block_type',
      'block_length',
      'sensorId',
      'ingressZone',
      'egressZone',
      'ingressIntf',
      'egressIntf',
      'initiatorIp',
      'responderIp',
      'policyRevision',
      'ruleId',
      'ruleAction',
      'ruleReason',
      'initiatorPort',
      'responderPort',
      'tcpFlags',
      'protocol',
      'netflowSource',
      'instanceId',
      'connectId',
      'firstPktsecond',
      'lastPktsecond',
      'initiatorPkts',
      'responderPkts',
      'initiatorBytes',
      'responderBytes',
      'userId',
      'applicationId',
      'urlCategory',
      'urlReputation',
      'clientId',
      'webApp',
      'url',
      'netbiosDomain',
      'clientVersion',
      'monitorRules[0]',
      'monitorRules[1]',
      'monitorRules[2]',
      'monitorRules[3]',
      'monitorRules[4]',
      'monitorRules[5]',
      'monitorRules[6]',
      'monitorRules[7]',
      'src_dest',
      'layer',
      'fileCount',
      'ipsCount'
    ]
  },
  {
    'byte_order' => {
      'app_proto' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'id' => 'N',
      'payload_id' => 'N',
      'payload_type' => 'N'
    },
    'eval' => {},
    'index' => 138,
    'map' => {
      'ip_range_list' => 'BLOCK',
      'version' => 'BLOCK'
    },
    'name' => 'UserClientApp',
    'order' => [
      'block_type',
      'block_length',
      'ip_range_list',
      'app_proto',
      'id',
      'version',
      'payload_type',
      'payload_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'hops' => 'C',
      'host_type' => 'N',
      'jailbroken' => 'C',
      'last_seen' => 'N',
      'mobile' => 'C',
      'priority' => 'C',
      'secondary' => 'C',
      'type' => 'C',
      'vid' => 'n',
      'vlan_tag_present' => 'C'
    },
    'eval' => {
      'host_id' => 'hex_to_str($value)'
    },
    'index' => 139,
    'map' => {
      'apps' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CLIENT6]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CLIENT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DHCP6]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DHCP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_MOBILE]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SERVER6]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SERVER]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SMB]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_USERAGENT]' => 'BLOCK',
      'host_id' => 16,
      'mac' => 'BLOCK',
      'netbios_name' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'HostTracker',
    'order' => [
      'block_type',
      'block_length',
      'host_id',
      'hops',
      'secondary',
      'fp_list[FINGERPRINT_TYPE_SERVER]',
      'fp_list[FINGERPRINT_TYPE_CLIENT]',
      'fp_list[FINGERPRINT_TYPE_SMB]',
      'fp_list[FINGERPRINT_TYPE_DHCP]',
      'fp_list[FINGERPRINT_TYPE_MOBILE]',
      'fp_list[FINGERPRINT_TYPE_SERVER6]',
      'fp_list[FINGERPRINT_TYPE_CLIENT6]',
      'fp_list[FINGERPRINT_TYPE_DHCP6]',
      'fp_list[FINGERPRINT_TYPE_USERAGENT]',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type',
      'mobile',
      'jailbroken',
      'vlan_tag_present',
      'vid',
      'type',
      'priority',
      'apps',
      'netbios_name'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'criticality' => 'n',
      'hops' => 'C',
      'host_type' => 'N',
      'jailbroken' => 'C',
      'last_seen' => 'N',
      'mobile' => 'C',
      'priority' => 'C',
      'type' => 'C',
      'vid' => 'n'
    },
    'eval' => {
      'host_id' => 'hex_to_str($value)'
    },
    'index' => 140,
    'map' => {
      'apps' => 'BLOCK',
      'attribute_list' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_APP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CLIENT6]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CLIENT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CONFLICT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DERIVED]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DHCP6]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DHCP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_MOBILE]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SCAN]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SERVER6]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SERVER]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SMB]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_USERAGENT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_USER]' => 'BLOCK',
      'host_id' => 16,
      'ips' => 'BLOCK',
      'mac' => 'BLOCK',
      'netbios_name' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'notes' => 'BLOCK',
      'scan_orig_vuln_list' => 'BLOCK',
      'scan_vuln_list' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'vuln_list' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'FullHostTracker',
    'order' => [
      'block_type',
      'block_length',
      'host_id',
      'ips',
      'hops',
      'fp_list[FINGERPRINT_TYPE_DERIVED]',
      'fp_list[FINGERPRINT_TYPE_SERVER]',
      'fp_list[FINGERPRINT_TYPE_CLIENT]',
      'fp_list[FINGERPRINT_TYPE_SMB]',
      'fp_list[FINGERPRINT_TYPE_DHCP]',
      'fp_list[FINGERPRINT_TYPE_USER]',
      'fp_list[FINGERPRINT_TYPE_SCAN]',
      'fp_list[FINGERPRINT_TYPE_APP]',
      'fp_list[FINGERPRINT_TYPE_CONFLICT]',
      'fp_list[FINGERPRINT_TYPE_MOBILE]',
      'fp_list[FINGERPRINT_TYPE_SERVER6]',
      'fp_list[FINGERPRINT_TYPE_CLIENT6]',
      'fp_list[FINGERPRINT_TYPE_DHCP6]',
      'fp_list[FINGERPRINT_TYPE_USERAGENT]',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type',
      'criticality',
      'vid',
      'type',
      'priority',
      'apps',
      'netbios_name',
      'notes',
      'vuln_list',
      'scan_vuln_list',
      'scan_orig_vuln_list',
      'attribute_list',
      'mobile',
      'jailbroken'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {
      'end' => 'ipv6_to_str($value)',
      'start' => 'ipv6_to_str($value)'
    },
    'index' => 141,
    'map' => {
      'end' => 16,
      'start' => 16
    },
    'name' => 'IPRangeSpec',
    'order' => [
      'block_type',
      'block_length',
      'start',
      'end'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'flag' => 'n',
      'port' => 'n',
      'proto' => 'n',
      'type' => 'N',
      'uid' => 'N'
    },
    'eval' => {
      'ipaddr' => 'ipv6_to_str($value)'
    },
    'index' => 142,
    'map' => {
      'generic_scan_results' => 'BLOCK',
      'ipaddr' => 16,
      'services' => 'BLOCK',
      'vulns' => 'BLOCK'
    },
    'name' => 'ScanResult',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'type',
      'ipaddr',
      'port',
      'proto',
      'flag',
      'vulns',
      'generic_scan_results',
      'services'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'last_seen' => 'N'
    },
    'eval' => {
      'ipaddr' => 'ipv6_to_str($value)'
    },
    'index' => 143,
    'map' => {
      'ipaddr' => 16
    },
    'name' => 'HostIP',
    'order' => [
      'block_type',
      'block_length',
      'ipaddr',
      'last_seen'
    ]
  },
  {
    'byte_order' => {
      'applicationId' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'connectId' => 'n',
      'fileCount' => 'n',
      'firstPktsecond' => 'N',
      'initiatorPort' => 'n',
      'initiator_country' => 'n',
      'instanceId' => 'n',
      'ipsCount' => 'n',
      'lastPktsecond' => 'N',
      'layer' => 'C',
      'monitorRules[0]' => 'N',
      'monitorRules[1]' => 'N',
      'monitorRules[2]' => 'N',
      'monitorRules[3]' => 'N',
      'monitorRules[4]' => 'N',
      'monitorRules[5]' => 'N',
      'monitorRules[6]' => 'N',
      'monitorRules[7]' => 'N',
      'protocol' => 'C',
      'responderPort' => 'n',
      'responder_country' => 'n',
      'ruleAction' => 'n',
      'ruleId' => 'N',
      'ruleReason' => 'n',
      'sensorId' => 'N',
      'src_dest' => 'C',
      'tcpFlags' => 'n',
      'urlCategory' => 'N',
      'urlReputation' => 'N',
      'userId' => 'N',
      'webApp' => 'N'
    },
    'eval' => {
      'egressIntf' => 'uuid_to_str($value)',
      'egressZone' => 'uuid_to_str($value)',
      'ingressIntf' => 'uuid_to_str($value)',
      'ingressZone' => 'uuid_to_str($value)',
      'initiatorBytes' => 'int64_to_bigint($value)',
      'initiatorIp' => 'ipv6_to_str($value)',
      'initiatorPkts' => 'int64_to_bigint($value)',
      'netflowSource' => 'ipv6_to_str($value)',
      'policyRevision' => 'uuid_to_str($value)',
      'responderBytes' => 'int64_to_bigint($value)',
      'responderIp' => 'ipv6_to_str($value)',
      'responderPkts' => 'int64_to_bigint($value)'
    },
    'index' => 144,
    'map' => {
      'clientVersion' => 'BLOCK',
      'egressIntf' => 16,
      'egressZone' => 16,
      'ingressIntf' => 16,
      'ingressZone' => 16,
      'initiatorBytes' => 8,
      'initiatorIp' => 16,
      'initiatorPkts' => 8,
      'netbiosDomain' => 'BLOCK',
      'netflowSource' => 16,
      'policyRevision' => 16,
      'responderBytes' => 8,
      'responderIp' => 16,
      'responderPkts' => 8,
      'url' => 'BLOCK'
    },
    'name' => 'FlowStats',
    'order' => [
      'block_type',
      'block_length',
      'sensorId',
      'ingressZone',
      'egressZone',
      'ingressIntf',
      'egressIntf',
      'initiatorIp',
      'responderIp',
      'policyRevision',
      'ruleId',
      'ruleAction',
      'ruleReason',
      'initiatorPort',
      'responderPort',
      'tcpFlags',
      'protocol',
      'netflowSource',
      'instanceId',
      'connectId',
      'firstPktsecond',
      'lastPktsecond',
      'initiatorPkts',
      'responderPkts',
      'initiatorBytes',
      'responderBytes',
      'userId',
      'applicationId',
      'urlCategory',
      'urlReputation',
      'clientId',
      'webApp',
      'url',
      'netbiosDomain',
      'clientVersion',
      'monitorRules[0]',
      'monitorRules[1]',
      'monitorRules[2]',
      'monitorRules[3]',
      'monitorRules[4]',
      'monitorRules[5]',
      'monitorRules[6]',
      'monitorRules[7]',
      'src_dest',
      'layer',
      'fileCount',
      'ipsCount',
      'initiator_country',
      'responder_country'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'lease_time' => 'N',
      'netmask' => 'N'
    },
    'eval' => {
      'router_ip' => 'ipv6_to_str($value)'
    },
    'index' => 145,
    'map' => {
      'router_ip' => 16
    },
    'name' => 'RNADHCPInfo',
    'order' => [
      'block_type',
      'block_length',
      'lease_time',
      'netmask',
      'router_ip'
    ]
  },
  {
    'byte_order' => {
      'bits' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'id' => 'N'
    },
    'eval' => {
      'ipaddr' => 'ipv6_to_str($value)'
    },
    'index' => 146,
    'map' => {
      'ipaddr' => 16
    },
    'name' => 'AttributeAddress',
    'order' => [
      'block_type',
      'block_length',
      'id',
      'ipaddr',
      'bits'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'type' => 'C'
    },
    'eval' => {},
    'index' => 147,
    'map' => {
      'peer_uuid' => 'BLOCK',
      'user_group_filename' => 'BLOCK',
      'user_ip_filename' => 'BLOCK'
    },
    'name' => 'UserGroupLoadSnapshotMsg',
    'order' => [
      'block_type',
      'block_length',
      'type',
      'user_ip_filename',
      'user_group_filename',
      'peer_uuid'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'ioc_id' => 'N',
      'source_type' => 'N',
      'uid' => 'N'
    },
    'eval' => {},
    'index' => 148,
    'map' => {
      'ip_range_list' => 'BLOCK'
    },
    'name' => 'HostIOCMsg',
    'order' => [
      'block_type',
      'block_length',
      'uid',
      'source_type',
      'ip_range_list',
      'ioc_id'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'criticality' => 'n',
      'hops' => 'C',
      'host_type' => 'N',
      'jailbroken' => 'C',
      'last_seen' => 'N',
      'mobile' => 'C',
      'priority' => 'C',
      'type' => 'C',
      'vid' => 'n'
    },
    'eval' => {
      'host_id' => 'hex_to_str($value)'
    },
    'index' => 149,
    'map' => {
      'apps' => 'BLOCK',
      'attribute_list' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_APP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CLIENT6]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CLIENT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_CONFLICT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DERIVED]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DHCP6]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_DHCP]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_MOBILE]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SCAN]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SERVER6]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SERVER]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_SMB]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_USERAGENT]' => 'BLOCK',
      'fp_list[FINGERPRINT_TYPE_USER]' => 'BLOCK',
      'host_id' => 16,
      'ioc_list' => 'BLOCK',
      'ips' => 'BLOCK',
      'mac' => 'BLOCK',
      'netbios_name' => 'BLOCK',
      'network_protos' => 'BLOCK',
      'notes' => 'BLOCK',
      'scan_orig_vuln_list' => 'BLOCK',
      'scan_vuln_list' => 'BLOCK',
      'tcpsvclist' => 'BLOCK',
      'udpsvclist' => 'BLOCK',
      'vuln_list' => 'BLOCK',
      'xport_protos' => 'BLOCK'
    },
    'name' => 'FullHostTracker',
    'order' => [
      'block_type',
      'block_length',
      'host_id',
      'ips',
      'hops',
      'fp_list[FINGERPRINT_TYPE_DERIVED]',
      'fp_list[FINGERPRINT_TYPE_SERVER]',
      'fp_list[FINGERPRINT_TYPE_CLIENT]',
      'fp_list[FINGERPRINT_TYPE_SMB]',
      'fp_list[FINGERPRINT_TYPE_DHCP]',
      'fp_list[FINGERPRINT_TYPE_USER]',
      'fp_list[FINGERPRINT_TYPE_SCAN]',
      'fp_list[FINGERPRINT_TYPE_APP]',
      'fp_list[FINGERPRINT_TYPE_CONFLICT]',
      'fp_list[FINGERPRINT_TYPE_MOBILE]',
      'fp_list[FINGERPRINT_TYPE_SERVER6]',
      'fp_list[FINGERPRINT_TYPE_CLIENT6]',
      'fp_list[FINGERPRINT_TYPE_DHCP6]',
      'fp_list[FINGERPRINT_TYPE_USERAGENT]',
      'tcpsvclist',
      'udpsvclist',
      'network_protos',
      'xport_protos',
      'mac',
      'last_seen',
      'host_type',
      'criticality',
      'vid',
      'type',
      'priority',
      'apps',
      'netbios_name',
      'notes',
      'vuln_list',
      'scan_vuln_list',
      'scan_orig_vuln_list',
      'attribute_list',
      'mobile',
      'jailbroken',
      'ioc_list'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'disabled' => 'C',
      'first_connection_time' => 'N',
      'first_counter' => 'n',
      'first_device_id' => 'N',
      'first_event_id' => 'N',
      'first_instance_id' => 'n',
      'first_seen' => 'N',
      'ioc_id' => 'N',
      'last_connection_time' => 'N',
      'last_counter' => 'n',
      'last_device_id' => 'N',
      'last_event_id' => 'N',
      'last_instance_id' => 'n',
      'last_seen' => 'N'
    },
    'eval' => {},
    'index' => 150,
    'map' => {},
    'name' => 'IOCState',
    'order' => [
      'block_type',
      'block_length',
      'ioc_id',
      'disabled',
      'first_seen',
      'first_event_id',
      'first_device_id',
      'first_instance_id',
      'first_connection_time',
      'first_counter',
      'last_seen',
      'last_event_id',
      'last_device_id',
      'last_instance_id',
      'last_connection_time',
      'last_counter'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'file_type' => 'N',
      'threat_score' => 'C'
    },
    'eval' => {
      'sha' => 'hex_to_str($value)'
    },
    'index' => 151,
    'map' => {
      'sha' => 'BLOCK'
    },
    'name' => 'SandboxAnalysisFileSignature',
    'order' => [
      'block_type',
      'block_length',
      'sha',
      'threat_score',
      'file_type'
    ]
  },
  {
    'byte_order' => {
      'applicationId' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'connectId' => 'n',
      'fileCount' => 'n',
      'firstPktsecond' => 'N',
      'initiatorPort' => 'n',
      'initiator_country' => 'n',
      'instanceId' => 'n',
      'ipsCount' => 'n',
      'lastPktsecond' => 'N',
      'layer' => 'C',
      'monitorRules[0]' => 'N',
      'monitorRules[1]' => 'N',
      'monitorRules[2]' => 'N',
      'monitorRules[3]' => 'N',
      'monitorRules[4]' => 'N',
      'monitorRules[5]' => 'N',
      'monitorRules[6]' => 'N',
      'monitorRules[7]' => 'N',
      'nf_dst_as' => 'N',
      'nf_dst_mask' => 'C',
      'nf_dst_tos' => 'C',
      'nf_snmp_in' => 'n',
      'nf_snmp_out' => 'n',
      'nf_src_as' => 'N',
      'nf_src_mask' => 'C',
      'nf_src_tos' => 'C',
      'num_ioc' => 'n',
      'protocol' => 'C',
      'responderPort' => 'n',
      'responder_country' => 'n',
      'ruleAction' => 'n',
      'ruleId' => 'N',
      'ruleReason' => 'n',
      'sensorId' => 'N',
      'src_dest' => 'C',
      'tcpFlags' => 'n',
      'urlCategory' => 'N',
      'urlReputation' => 'N',
      'userId' => 'N',
      'webApp' => 'N'
    },
    'eval' => {
      'egressIntf' => 'uuid_to_str($value)',
      'egressZone' => 'uuid_to_str($value)',
      'ingressIntf' => 'uuid_to_str($value)',
      'ingressZone' => 'uuid_to_str($value)',
      'initiatorBytes' => 'int64_to_bigint($value)',
      'initiatorIp' => 'ipv6_to_str($value)',
      'initiatorPkts' => 'int64_to_bigint($value)',
      'netflowSource' => 'ipv6_to_str($value)',
      'policyRevision' => 'uuid_to_str($value)',
      'responderBytes' => 'int64_to_bigint($value)',
      'responderIp' => 'ipv6_to_str($value)',
      'responderPkts' => 'int64_to_bigint($value)'
    },
    'index' => 152,
    'map' => {
      'clientVersion' => 'BLOCK',
      'egressIntf' => 16,
      'egressZone' => 16,
      'ingressIntf' => 16,
      'ingressZone' => 16,
      'initiatorBytes' => 8,
      'initiatorIp' => 16,
      'initiatorPkts' => 8,
      'netbiosDomain' => 'BLOCK',
      'netflowSource' => 16,
      'policyRevision' => 16,
      'responderBytes' => 8,
      'responderIp' => 16,
      'responderPkts' => 8,
      'url' => 'BLOCK'
    },
    'name' => 'FlowStats',
    'order' => [
      'block_type',
      'block_length',
      'sensorId',
      'ingressZone',
      'egressZone',
      'ingressIntf',
      'egressIntf',
      'initiatorIp',
      'responderIp',
      'policyRevision',
      'ruleId',
      'ruleAction',
      'ruleReason',
      'initiatorPort',
      'responderPort',
      'tcpFlags',
      'protocol',
      'netflowSource',
      'instanceId',
      'connectId',
      'firstPktsecond',
      'lastPktsecond',
      'initiatorPkts',
      'responderPkts',
      'initiatorBytes',
      'responderBytes',
      'userId',
      'applicationId',
      'urlCategory',
      'urlReputation',
      'clientId',
      'webApp',
      'url',
      'netbiosDomain',
      'clientVersion',
      'monitorRules[0]',
      'monitorRules[1]',
      'monitorRules[2]',
      'monitorRules[3]',
      'monitorRules[4]',
      'monitorRules[5]',
      'monitorRules[6]',
      'monitorRules[7]',
      'src_dest',
      'layer',
      'fileCount',
      'ipsCount',
      'initiator_country',
      'responder_country',
      'num_ioc',
      'nf_src_as',
      'nf_dst_as',
      'nf_snmp_in',
      'nf_snmp_out',
      'nf_src_tos',
      'nf_dst_tos',
      'nf_src_mask',
      'nf_dst_mask'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'event_id' => 'N',
      'impact' => 'N',
      'sensor_id' => 'N',
      'time' => 'N'
    },
    'eval' => {
      'ip_destination' => 'ipv6_to_str($value)',
      'ip_source' => 'ipv6_to_str($value)'
    },
    'index' => 153,
    'map' => {
      'description' => 'BLOCK',
      'ip_destination' => 16,
      'ip_source' => 16
    },
    'name' => 'ImpactAlert',
    'order' => [
      'block_type',
      'block_length',
      'event_id',
      'sensor_id',
      'time',
      'impact',
      'ip_source',
      'ip_destination',
      'description'
    ]
  }
];
our $other_blocks = [
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {
      'block_length' => '$value - 8'
    },
    'index' => 0,
    'map' => {
      'data' => 'block_length'
    },
    'name' => 'String',
    'order' => [
      'block_type',
      'block_length',
      'data'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {
      'block_length' => '$value - 8'
    },
    'index' => 1,
    'map' => {
      'data' => 'block_length'
    },
    'name' => 'Blob',
    'order' => [
      'block_type',
      'block_length',
      'data'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 2,
    'map' => {
      'data' => 'LIST'
    },
    'name' => 'List',
    'order' => [
      'block_type',
      'block_length',
      'data'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 3,
    'map' => {
      'data' => 'LIST'
    },
    'name' => 'GenericList',
    'order' => [
      'block_type',
      'block_length',
      'data'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'event_id' => 'N',
      'event_second' => 'N',
      'sensor_id' => 'N',
      'type' => 'N'
    },
    'eval' => {},
    'index' => 4,
    'map' => {
      'data' => 'BLOCK'
    },
    'name' => 'Unified2ExtraData',
    'order' => [
      'block_type',
      'block_length',
      'sensor_id',
      'event_id',
      'event_second',
      'type',
      'data'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'type' => 'N'
    },
    'eval' => {},
    'index' => 5,
    'map' => {
      'encoding' => 'BLOCK',
      'extra_data_type_name' => 'BLOCK'
    },
    'name' => 'Unified2ExtraDataType',
    'order' => [
      'block_type',
      'block_length',
      'type',
      'extra_data_type_name',
      'encoding'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'value' => 'N'
    },
    'eval' => {},
    'index' => 6,
    'map' => {},
    'name' => 'INT32',
    'order' => [
      'block_type',
      'block_length',
      'value'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'legacy_ipaddr' => 'N',
      'timestamp' => 'N',
      'user_id' => 'N'
    },
    'eval' => {
      'legacy_ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 7,
    'map' => {
      'user_name' => 'BLOCK'
    },
    'name' => 'Unified2UserIpMap',
    'order' => [
      'block_type',
      'block_length',
      'user_id',
      'user_name',
      'legacy_ipaddr',
      'timestamp'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'flag' => 'C',
      'legacy_ipaddr' => 'N',
      'timestamp' => 'N',
      'user_id' => 'N'
    },
    'eval' => {
      'legacy_ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 8,
    'map' => {
      'user_name' => 'BLOCK'
    },
    'name' => 'Unified2UserIpMapUpdate',
    'order' => [
      'block_type',
      'block_length',
      'user_id',
      'user_name',
      'legacy_ipaddr',
      'timestamp',
      'flag'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'group_id' => 'N'
    },
    'eval' => {},
    'index' => 9,
    'map' => {
      'group_name' => 'BLOCK',
      'users' => 'BLOCK'
    },
    'name' => 'Unified2UserGroupMap',
    'order' => [
      'block_type',
      'block_length',
      'group_id',
      'group_name',
      'users'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'group_id' => 'N'
    },
    'eval' => {},
    'index' => 10,
    'map' => {
      'group_name' => 'BLOCK',
      'user_updates' => 'BLOCK'
    },
    'name' => 'Unified2UserGroupMapUpdate',
    'order' => [
      'block_type',
      'block_length',
      'group_id',
      'group_name',
      'user_updates'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'flag' => 'C',
      'id' => 'N'
    },
    'eval' => {},
    'index' => 11,
    'map' => {},
    'name' => 'Unified2UserMapUpdate',
    'order' => [
      'block_type',
      'block_length',
      'id',
      'flag'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'legacy_ipaddr' => 'N',
      'timestamp' => 'N',
      'user_id' => 'N'
    },
    'eval' => {
      'legacy_ipaddr' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 12,
    'map' => {
      'groups' => 'BLOCK'
    },
    'name' => 'Unified2UserSnapshot',
    'order' => [
      'block_type',
      'block_length',
      'user_id',
      'legacy_ipaddr',
      'timestamp',
      'groups'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {},
    'index' => 13,
    'map' => {
      'groups' => 'BLOCK'
    },
    'name' => 'Unified2UserGroupSnapshot',
    'order' => [
      'block_type',
      'block_length',
      'groups'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {
      'uuid' => 'uuid_to_str($value)'
    },
    'index' => 14,
    'map' => {
      'name_string' => 'BLOCK',
      'uuid' => 16
    },
    'name' => 'Unified2UUIDString',
    'order' => [
      'block_type',
      'block_length',
      'uuid',
      'name_string'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'rule_id' => 'N'
    },
    'eval' => {
      'revision' => 'uuid_to_str($value)'
    },
    'index' => 15,
    'map' => {
      'revision' => 16,
      'rule_name' => 'BLOCK'
    },
    'name' => 'Unified2FWRuleID',
    'order' => [
      'block_type',
      'block_length',
      'revision',
      'rule_id',
      'rule_name'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'detector' => 'C',
      'file_size' => 'N',
      'file_ts' => 'N',
      'file_type' => 'C',
      'host_ip' => 'N',
      'subtype_id' => 'C',
      'timestamp' => 'N',
      'type_id' => 'N'
    },
    'eval' => {
      'agent_uuid' => 'uuid_to_str($value)',
      'cloud_uuid' => 'uuid_to_str($value)',
      'host_ip' => 'inet_ntoa(pack("N", $value))'
    },
    'index' => 16,
    'map' => {
      'agent_uuid' => 16,
      'cloud_uuid' => 16,
      'detection_name' => 'BLOCK',
      'event_description' => 'BLOCK',
      'file_name' => 'BLOCK',
      'file_path' => 'BLOCK',
      'file_sha' => 'BLOCK',
      'parent_fname' => 'BLOCK',
      'parent_sha' => 'BLOCK',
      'user' => 'BLOCK'
    },
    'name' => 'Unified2FireAMPEvent',
    'order' => [
      'block_type',
      'block_length',
      'agent_uuid',
      'cloud_uuid',
      'timestamp',
      'type_id',
      'subtype_id',
      'host_ip',
      'detector',
      'detection_name',
      'user',
      'file_name',
      'file_path',
      'file_sha',
      'file_size',
      'file_type',
      'file_ts',
      'parent_fname',
      'parent_sha',
      'event_description'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {
      'macaddr' => 'mac_to_str($value)'
    },
    'index' => 17,
    'map' => {
      'macaddr' => 6
    },
    'name' => 'MACADDR',
    'order' => [
      'block_type',
      'block_length',
      'macaddr'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'os_build' => 'N',
      'os_sp_major' => 'C',
      'os_sp_minor' => 'C',
      'os_v_major' => 'C',
      'os_v_minor' => 'C',
      'timestamp' => 'N'
    },
    'eval' => {
      'agent_uuid' => 'uuid_to_str($value)',
      'ldap_uuid' => 'uuid_to_str($value)'
    },
    'index' => 18,
    'map' => {
      'agent_uuid' => 16,
      'description' => 'BLOCK',
      'hostname' => 'BLOCK',
      'ips' => 'BLOCK',
      'ldap_name' => 'BLOCK',
      'ldap_sid' => 'BLOCK',
      'ldap_uuid' => 16,
      'macs' => 'BLOCK',
      'name_string' => 'BLOCK',
      'os_arch' => 'BLOCK',
      'os_name' => 'BLOCK',
      'os_prod_type' => 'BLOCK',
      'os_suites' => 'BLOCK',
      'os_type' => 'BLOCK',
      'os_v_type' => 'BLOCK'
    },
    'name' => 'Unified2FireAMPHostEvent',
    'order' => [
      'block_type',
      'block_length',
      'agent_uuid',
      'timestamp',
      'name_string',
      'description',
      'hostname',
      'ips',
      'macs',
      'ldap_uuid',
      'ldap_name',
      'ldap_sid',
      'os_type',
      'os_name',
      'os_v_major',
      'os_v_minor',
      'os_v_type',
      'os_sp_major',
      'os_sp_minor',
      'os_build',
      'os_prod_type',
      'os_arch',
      'os_suites'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'protocol' => 'n',
      'type' => 'n'
    },
    'eval' => {},
    'index' => 19,
    'map' => {
      'description' => 'BLOCK'
    },
    'name' => 'Unified2ICMPType',
    'order' => [
      'block_type',
      'block_length',
      'type',
      'protocol',
      'description'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'code' => 'n',
      'protocol' => 'n',
      'type' => 'n'
    },
    'eval' => {},
    'index' => 20,
    'map' => {
      'description' => 'BLOCK'
    },
    'name' => 'Unified2ICMPCode',
    'order' => [
      'block_type',
      'block_length',
      'code',
      'type',
      'protocol',
      'description'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'reason' => 'n'
    },
    'eval' => {},
    'index' => 21,
    'map' => {
      'description' => 'BLOCK'
    },
    'name' => 'Unified2FWRuleReason',
    'order' => [
      'block_type',
      'block_length',
      'reason',
      'description'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'rule_id' => 'N'
    },
    'eval' => {
      'policy_uuid' => 'uuid_to_str($value)'
    },
    'index' => 22,
    'map' => {
      'policy_uuid' => 16,
      'rule_name' => 'BLOCK'
    },
    'name' => 'Unified2IPRepCategory',
    'order' => [
      'block_type',
      'block_length',
      'rule_id',
      'policy_uuid',
      'rule_name'
    ]
  },
  {
    'byte_order' => {
      'action' => 'C',
      'app_id' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'connection_counter' => 'n',
      'connection_instance' => 'n',
      'connection_time' => 'N',
      'direction' => 'C',
      'disposition' => 'C',
      'file_event_timestamp' => 'N',
      'file_type_id' => 'N',
      'port_dst' => 'n',
      'port_src' => 'n',
      'protocol' => 'C',
      'sensor_id' => 'N',
      'user_id' => 'N'
    },
    'eval' => {
      'file_size' => 'int64_to_bigint($value)',
      'ip_dst' => 'ipv6_to_str($value)',
      'ip_src' => 'ipv6_to_str($value)',
      'policy_uuid' => 'uuid_to_str($value)',
      'sha256' => 'hex_to_str($value)'
    },
    'index' => 23,
    'map' => {
      'file_name' => 'BLOCK',
      'file_size' => 8,
      'ip_dst' => 16,
      'ip_src' => 16,
      'policy_uuid' => 16,
      'sha256' => 32,
      'signature' => 'BLOCK',
      'uri' => 'BLOCK'
    },
    'name' => 'Unified2FileLogEvent',
    'order' => [
      'block_type',
      'block_length',
      'sensor_id',
      'connection_instance',
      'connection_counter',
      'connection_time',
      'file_event_timestamp',
      'ip_src',
      'ip_dst',
      'disposition',
      'action',
      'sha256',
      'file_type_id',
      'file_name',
      'file_size',
      'direction',
      'app_id',
      'user_id',
      'uri',
      'signature',
      'port_src',
      'port_dst',
      'protocol',
      'policy_uuid'
    ]
  },
  {
    'byte_order' => {
      'app_id' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'connection_counter' => 'n',
      'connection_instance' => 'n',
      'connection_time' => 'N',
      'detector' => 'C',
      'direction' => 'C',
      'disposition' => 'C',
      'file_size' => 'N',
      'file_ts' => 'N',
      'file_type' => 'C',
      'host_ip' => 'N',
      'port_dst' => 'n',
      'port_src' => 'n',
      'retro_disposition' => 'C',
      'sensor_id' => 'N',
      'subtype_id' => 'C',
      'timestamp' => 'N',
      'type_id' => 'N',
      'user_id' => 'N'
    },
    'eval' => {
      'agent_uuid' => 'uuid_to_str($value)',
      'cloud_uuid' => 'uuid_to_str($value)',
      'host_ip' => 'inet_ntoa(pack("N", $value))',
      'ip_dst' => 'ipv6_to_str($value)',
      'ip_src' => 'ipv6_to_str($value)',
      'policy_uuid' => 'uuid_to_str($value)'
    },
    'index' => 24,
    'map' => {
      'agent_uuid' => 16,
      'cloud_uuid' => 16,
      'detection_name' => 'BLOCK',
      'event_description' => 'BLOCK',
      'file_name' => 'BLOCK',
      'file_path' => 'BLOCK',
      'file_sha' => 'BLOCK',
      'ip_dst' => 16,
      'ip_src' => 16,
      'parent_fname' => 'BLOCK',
      'parent_sha' => 'BLOCK',
      'policy_uuid' => 16,
      'uri' => 'BLOCK',
      'user' => 'BLOCK'
    },
    'name' => 'Unified2FireAMPEvent',
    'order' => [
      'block_type',
      'block_length',
      'agent_uuid',
      'cloud_uuid',
      'timestamp',
      'type_id',
      'subtype_id',
      'host_ip',
      'detector',
      'detection_name',
      'user',
      'file_name',
      'file_path',
      'file_sha',
      'file_size',
      'file_type',
      'file_ts',
      'parent_fname',
      'parent_sha',
      'event_description',
      'sensor_id',
      'connection_instance',
      'connection_counter',
      'connection_time',
      'direction',
      'ip_src',
      'ip_dst',
      'app_id',
      'user_id',
      'policy_uuid',
      'disposition',
      'retro_disposition',
      'uri',
      'port_src',
      'port_dst'
    ]
  },
  {
    'byte_order' => {
      'application_protocol_id' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'blocked' => 'C',
      'classification_id' => 'N',
      'client_application_id' => 'N',
      'connection_counter' => 'n',
      'connection_instance_id' => 'n',
      'connection_second' => 'N',
      'dport_icode' => 'n',
      'event_id' => 'N',
      'event_microsecond' => 'N',
      'event_second' => 'N',
      'firewall_rule_id' => 'N',
      'generator_id' => 'N',
      'impact' => 'C',
      'impact_flag' => 'C',
      'mpls_label' => 'N',
      'pad' => 'n',
      'priority_id' => 'N',
      'protocol' => 'C',
      'sensor_id' => 'N',
      'signature_id' => 'N',
      'signature_revision' => 'N',
      'sport_itype' => 'n',
      'user_id' => 'N',
      'vlanId' => 'n',
      'web_application_id' => 'N'
    },
    'eval' => {
      'firewall_policy_uuid' => 'uuid_to_str($value)',
      'interface_egress_uuid' => 'uuid_to_str($value)',
      'interface_ingress_uuid' => 'uuid_to_str($value)',
      'ip_destination' => 'ipv6_to_str($value)',
      'ip_source' => 'ipv6_to_str($value)',
      'policy_uuid' => 'uuid_to_str($value)',
      'security_zone_egress_uuid' => 'uuid_to_str($value)',
      'security_zone_ingress_uuid' => 'uuid_to_str($value)'
    },
    'index' => 25,
    'map' => {
      'firewall_policy_uuid' => 16,
      'interface_egress_uuid' => 16,
      'interface_ingress_uuid' => 16,
      'ip_destination' => 16,
      'ip_source' => 16,
      'policy_uuid' => 16,
      'security_zone_egress_uuid' => 16,
      'security_zone_ingress_uuid' => 16
    },
    'name' => 'Unified2IPSEvent',
    'order' => [
      'block_type',
      'block_length',
      'sensor_id',
      'event_id',
      'event_second',
      'event_microsecond',
      'signature_id',
      'generator_id',
      'signature_revision',
      'classification_id',
      'priority_id',
      'ip_source',
      'ip_destination',
      'sport_itype',
      'dport_icode',
      'protocol',
      'impact_flag',
      'impact',
      'blocked',
      'mpls_label',
      'vlanId',
      'pad',
      'policy_uuid',
      'user_id',
      'web_application_id',
      'client_application_id',
      'application_protocol_id',
      'firewall_rule_id',
      'firewall_policy_uuid',
      'interface_ingress_uuid',
      'interface_egress_uuid',
      'security_zone_ingress_uuid',
      'security_zone_egress_uuid',
      'connection_second',
      'connection_instance_id',
      'connection_counter'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N'
    },
    'eval' => {
      'sha' => 'hex_to_str($value)'
    },
    'index' => 26,
    'map' => {
      'name_string' => 'BLOCK',
      'sha' => 32
    },
    'name' => 'Unified2FileLogSha',
    'order' => [
      'block_type',
      'block_length',
      'sha',
      'name_string'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'gid' => 'N',
      'rev' => 'N',
      'sid' => 'N'
    },
    'eval' => {},
    'index' => 27,
    'map' => {
      'additional_references' => 'BLOCK',
      'affected_systems' => 'BLOCK',
      'attack_scenarios' => 'BLOCK',
      'contributors' => 'BLOCK',
      'corrective_action' => 'BLOCK',
      'detailed_info' => 'BLOCK',
      'ease_of_attack' => 'BLOCK',
      'false_negatives' => 'BLOCK',
      'false_positives' => 'BLOCK',
      'impact' => 'BLOCK',
      'summary' => 'BLOCK'
    },
    'name' => 'Unified2RuleDoc',
    'order' => [
      'block_type',
      'block_length',
      'sid',
      'gid',
      'rev',
      'summary',
      'impact',
      'detailed_info',
      'affected_systems',
      'attack_scenarios',
      'ease_of_attack',
      'false_positives',
      'false_negatives',
      'corrective_action',
      'contributors',
      'additional_references'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'country_code' => 'n'
    },
    'eval' => {},
    'index' => 28,
    'map' => {
      'name_string' => 'BLOCK'
    },
    'name' => 'Unified2Geolocation',
    'order' => [
      'block_type',
      'block_length',
      'country_code',
      'name_string'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'timestamp' => 'N',
      'user_id' => 'N'
    },
    'eval' => {
      'ipaddr' => 'ipv6_to_str($value)'
    },
    'index' => 29,
    'map' => {
      'ipaddr' => 16,
      'user_name' => 'BLOCK'
    },
    'name' => 'Unified2UserIpMap',
    'order' => [
      'block_type',
      'block_length',
      'user_id',
      'user_name',
      'ipaddr',
      'timestamp'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'flag' => 'C',
      'timestamp' => 'N',
      'user_id' => 'N'
    },
    'eval' => {
      'ipaddr' => 'ipv6_to_str($value)'
    },
    'index' => 30,
    'map' => {
      'ipaddr' => 16,
      'user_name' => 'BLOCK'
    },
    'name' => 'Unified2UserIpMapUpdate',
    'order' => [
      'block_type',
      'block_length',
      'user_id',
      'user_name',
      'ipaddr',
      'timestamp',
      'flag'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'timestamp' => 'N',
      'user_id' => 'N'
    },
    'eval' => {
      'ipaddr' => 'ipv6_to_str($value)'
    },
    'index' => 31,
    'map' => {
      'groups' => 'BLOCK',
      'ipaddr' => 16
    },
    'name' => 'Unified2UserSnapshot',
    'order' => [
      'block_type',
      'block_length',
      'user_id',
      'ipaddr',
      'timestamp',
      'groups'
    ]
  },
  {
    'byte_order' => {
      'action' => 'C',
      'app_id' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'connection_counter' => 'n',
      'connection_instance' => 'n',
      'connection_time' => 'N',
      'direction' => 'C',
      'disposition' => 'C',
      'file_event_timestamp' => 'N',
      'file_type_id' => 'N',
      'ip_dst_country' => 'n',
      'ip_src_country' => 'n',
      'port_dst' => 'n',
      'port_src' => 'n',
      'protocol' => 'C',
      'sensor_id' => 'N',
      'user_id' => 'N',
      'webApp' => 'N'
    },
    'eval' => {
      'file_size' => 'int64_to_bigint($value)',
      'ip_dst' => 'ipv6_to_str($value)',
      'ip_src' => 'ipv6_to_str($value)',
      'policy_uuid' => 'uuid_to_str($value)',
      'sha256' => 'hex_to_str($value)'
    },
    'index' => 32,
    'map' => {
      'file_name' => 'BLOCK',
      'file_size' => 8,
      'ip_dst' => 16,
      'ip_src' => 16,
      'policy_uuid' => 16,
      'sha256' => 32,
      'signature' => 'BLOCK',
      'uri' => 'BLOCK'
    },
    'name' => 'Unified2FileLogEvent',
    'order' => [
      'block_type',
      'block_length',
      'sensor_id',
      'connection_instance',
      'connection_counter',
      'connection_time',
      'file_event_timestamp',
      'ip_src',
      'ip_dst',
      'disposition',
      'action',
      'sha256',
      'file_type_id',
      'file_name',
      'file_size',
      'direction',
      'app_id',
      'user_id',
      'uri',
      'signature',
      'port_src',
      'port_dst',
      'protocol',
      'policy_uuid',
      'ip_src_country',
      'ip_dst_country',
      'webApp',
      'clientId'
    ]
  },
  {
    'byte_order' => {
      'action' => 'C',
      'app_id' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'connection_counter' => 'n',
      'connection_instance' => 'n',
      'connection_time' => 'N',
      'detector' => 'C',
      'direction' => 'C',
      'disposition' => 'C',
      'file_size' => 'N',
      'file_ts' => 'N',
      'file_type' => 'N',
      'ip_dst_country' => 'n',
      'ip_src_country' => 'n',
      'port_dst' => 'n',
      'port_src' => 'n',
      'protocol' => 'C',
      'retro_disposition' => 'C',
      'sensor_id' => 'N',
      'subtype_id' => 'C',
      'timestamp' => 'N',
      'type_id' => 'N',
      'user_id' => 'N',
      'webApp' => 'N'
    },
    'eval' => {
      'agent_uuid' => 'uuid_to_str($value)',
      'cloud_uuid' => 'uuid_to_str($value)',
      'ip_dst' => 'ipv6_to_str($value)',
      'ip_src' => 'ipv6_to_str($value)',
      'policy_uuid' => 'uuid_to_str($value)'
    },
    'index' => 33,
    'map' => {
      'agent_uuid' => 16,
      'cloud_uuid' => 16,
      'detection_name' => 'BLOCK',
      'event_description' => 'BLOCK',
      'file_name' => 'BLOCK',
      'file_path' => 'BLOCK',
      'file_sha' => 'BLOCK',
      'ip_dst' => 16,
      'ip_src' => 16,
      'parent_fname' => 'BLOCK',
      'parent_sha' => 'BLOCK',
      'policy_uuid' => 16,
      'uri' => 'BLOCK',
      'user' => 'BLOCK'
    },
    'name' => 'Unified2FireAMPEvent',
    'order' => [
      'block_type',
      'block_length',
      'agent_uuid',
      'cloud_uuid',
      'timestamp',
      'type_id',
      'subtype_id',
      'detector',
      'detection_name',
      'user',
      'file_name',
      'file_path',
      'file_sha',
      'file_size',
      'file_type',
      'file_ts',
      'parent_fname',
      'parent_sha',
      'event_description',
      'sensor_id',
      'connection_instance',
      'connection_counter',
      'connection_time',
      'direction',
      'ip_src',
      'ip_dst',
      'app_id',
      'user_id',
      'policy_uuid',
      'disposition',
      'retro_disposition',
      'uri',
      'port_src',
      'port_dst',
      'ip_src_country',
      'ip_dst_country',
      'webApp',
      'clientId',
      'action',
      'protocol'
    ]
  },
  {
    'byte_order' => {
      'application_protocol_id' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'blocked' => 'C',
      'classification_id' => 'N',
      'client_application_id' => 'N',
      'connection_counter' => 'n',
      'connection_instance_id' => 'n',
      'connection_second' => 'N',
      'dport_icode' => 'n',
      'event_id' => 'N',
      'event_microsecond' => 'N',
      'event_second' => 'N',
      'firewall_rule_id' => 'N',
      'generator_id' => 'N',
      'impact' => 'C',
      'impact_flag' => 'C',
      'ip_dst_country' => 'n',
      'ip_src_country' => 'n',
      'mpls_label' => 'N',
      'pad' => 'n',
      'priority_id' => 'N',
      'protocol' => 'C',
      'sensor_id' => 'N',
      'signature_id' => 'N',
      'signature_revision' => 'N',
      'sport_itype' => 'n',
      'user_id' => 'N',
      'vlanId' => 'n',
      'web_application_id' => 'N'
    },
    'eval' => {
      'firewall_policy_uuid' => 'uuid_to_str($value)',
      'interface_egress_uuid' => 'uuid_to_str($value)',
      'interface_ingress_uuid' => 'uuid_to_str($value)',
      'ip_destination' => 'ipv6_to_str($value)',
      'ip_source' => 'ipv6_to_str($value)',
      'policy_uuid' => 'uuid_to_str($value)',
      'security_zone_egress_uuid' => 'uuid_to_str($value)',
      'security_zone_ingress_uuid' => 'uuid_to_str($value)'
    },
    'index' => 34,
    'map' => {
      'firewall_policy_uuid' => 16,
      'interface_egress_uuid' => 16,
      'interface_ingress_uuid' => 16,
      'ip_destination' => 16,
      'ip_source' => 16,
      'policy_uuid' => 16,
      'security_zone_egress_uuid' => 16,
      'security_zone_ingress_uuid' => 16
    },
    'name' => 'Unified2IPSEvent',
    'order' => [
      'block_type',
      'block_length',
      'sensor_id',
      'event_id',
      'event_second',
      'event_microsecond',
      'signature_id',
      'generator_id',
      'signature_revision',
      'classification_id',
      'priority_id',
      'ip_source',
      'ip_destination',
      'sport_itype',
      'dport_icode',
      'protocol',
      'impact_flag',
      'impact',
      'blocked',
      'mpls_label',
      'vlanId',
      'pad',
      'policy_uuid',
      'user_id',
      'web_application_id',
      'client_application_id',
      'application_protocol_id',
      'firewall_rule_id',
      'firewall_policy_uuid',
      'interface_ingress_uuid',
      'interface_egress_uuid',
      'security_zone_ingress_uuid',
      'security_zone_egress_uuid',
      'connection_second',
      'connection_instance_id',
      'connection_counter',
      'ip_src_country',
      'ip_dst_country'
    ]
  },
  {
    'byte_order' => {
      'action' => 'C',
      'app_id' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'connection_counter' => 'n',
      'connection_instance' => 'n',
      'connection_time' => 'N',
      'detector' => 'C',
      'direction' => 'C',
      'disposition' => 'C',
      'file_size' => 'N',
      'file_ts' => 'N',
      'file_type' => 'N',
      'ip_dst_country' => 'n',
      'ip_src_country' => 'n',
      'num_ioc' => 'n',
      'port_dst' => 'n',
      'port_src' => 'n',
      'protocol' => 'C',
      'retro_disposition' => 'C',
      'sensor_id' => 'N',
      'subtype_id' => 'N',
      'threat_score' => 'C',
      'timestamp' => 'N',
      'type_id' => 'N',
      'user_id' => 'N',
      'webApp' => 'N'
    },
    'eval' => {
      'agent_uuid' => 'uuid_to_str($value)',
      'cloud_uuid' => 'uuid_to_str($value)',
      'ip_dst' => 'ipv6_to_str($value)',
      'ip_src' => 'ipv6_to_str($value)',
      'policy_uuid' => 'uuid_to_str($value)'
    },
    'index' => 35,
    'map' => {
      'agent_uuid' => 16,
      'cloud_uuid' => 16,
      'detection_name' => 'BLOCK',
      'event_description' => 'BLOCK',
      'file_name' => 'BLOCK',
      'file_path' => 'BLOCK',
      'file_sha' => 'BLOCK',
      'ip_dst' => 16,
      'ip_src' => 16,
      'parent_fname' => 'BLOCK',
      'parent_sha' => 'BLOCK',
      'policy_uuid' => 16,
      'uri' => 'BLOCK',
      'user' => 'BLOCK'
    },
    'name' => 'Unified2FireAMPEvent',
    'order' => [
      'block_type',
      'block_length',
      'agent_uuid',
      'cloud_uuid',
      'timestamp',
      'type_id',
      'subtype_id',
      'detector',
      'detection_name',
      'user',
      'file_name',
      'file_path',
      'file_sha',
      'file_size',
      'file_type',
      'file_ts',
      'parent_fname',
      'parent_sha',
      'event_description',
      'sensor_id',
      'connection_instance',
      'connection_counter',
      'connection_time',
      'direction',
      'ip_src',
      'ip_dst',
      'app_id',
      'user_id',
      'policy_uuid',
      'disposition',
      'retro_disposition',
      'uri',
      'port_src',
      'port_dst',
      'ip_src_country',
      'ip_dst_country',
      'webApp',
      'clientId',
      'action',
      'protocol',
      'threat_score',
      'num_ioc'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'disposition' => 'C',
      'file_type_id' => 'N',
      'status' => 'N',
      'subtype' => 'n',
      'timestamp' => 'N'
    },
    'eval' => {
      'file_size' => 'int64_to_bigint($value)',
      'sha256' => 'hex_to_str($value)'
    },
    'index' => 36,
    'map' => {
      'file_name' => 'BLOCK',
      'file_size' => 8,
      'sha256' => 32
    },
    'name' => 'Unified2FileExtractEvent',
    'order' => [
      'block_type',
      'block_length',
      'sha256',
      'timestamp',
      'subtype',
      'status',
      'disposition',
      'file_size',
      'file_type_id',
      'file_name'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'category' => 'n',
      'id' => 'N',
      'number_dropped' => 'N',
      'number_stored' => 'N',
      'timestamp' => 'N'
    },
    'eval' => {
      'bytes_written' => 'int64_to_bigint($value)'
    },
    'index' => 37,
    'map' => {
      'bytes_written' => 8
    },
    'name' => 'Unified2FileStorageStats',
    'order' => [
      'block_type',
      'block_length',
      'timestamp',
      'category',
      'id',
      'number_stored',
      'number_dropped',
      'bytes_written'
    ]
  },
  {
    'byte_order' => {
      'action' => 'C',
      'app_id' => 'N',
      'archive_file_status' => 'C',
      'block_length' => 'N',
      'block_type' => 'N',
      'clientId' => 'N',
      'connection_counter' => 'n',
      'connection_instance' => 'n',
      'connection_time' => 'N',
      'direction' => 'C',
      'disposition' => 'C',
      'file_event_timestamp' => 'N',
      'file_sandbox_status' => 'C',
      'file_storage_status' => 'C',
      'file_type_id' => 'N',
      'ip_dst_country' => 'n',
      'ip_src_country' => 'n',
      'port_dst' => 'n',
      'port_src' => 'n',
      'protocol' => 'C',
      'sensor_id' => 'N',
      'spero_disposition' => 'C',
      'threat_score' => 'C',
      'user_id' => 'N',
      'webApp' => 'N'
    },
    'eval' => {
      'file_size' => 'int64_to_bigint($value)',
      'ip_dst' => 'ipv6_to_str($value)',
      'ip_src' => 'ipv6_to_str($value)',
      'policy_uuid' => 'uuid_to_str($value)',
      'sha256' => 'hex_to_str($value)'
    },
    'index' => 38,
    'map' => {
      'file_name' => 'BLOCK',
      'file_size' => 8,
      'ip_dst' => 16,
      'ip_src' => 16,
      'policy_uuid' => 16,
      'sha256' => 32,
      'signature' => 'BLOCK',
      'uri' => 'BLOCK'
    },
    'name' => 'Unified2FileLogEvent',
    'order' => [
      'block_type',
      'block_length',
      'sensor_id',
      'connection_instance',
      'connection_counter',
      'connection_time',
      'file_event_timestamp',
      'ip_src',
      'ip_dst',
      'disposition',
      'spero_disposition',
      'file_storage_status',
      'file_sandbox_status',
      'archive_file_status',
      'threat_score',
      'action',
      'sha256',
      'file_type_id',
      'file_name',
      'file_size',
      'direction',
      'app_id',
      'user_id',
      'uri',
      'signature',
      'port_src',
      'port_dst',
      'protocol',
      'policy_uuid',
      'ip_src_country',
      'ip_dst_country',
      'webApp',
      'clientId'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'ioc_id' => 'N'
    },
    'eval' => {},
    'index' => 39,
    'map' => {
      'category' => 'BLOCK',
      'event_type' => 'BLOCK'
    },
    'name' => 'Unified2IOCName',
    'order' => [
      'block_type',
      'block_length',
      'ioc_id',
      'category',
      'event_type'
    ]
  },
  {
    'byte_order' => {
      'block_length' => 'N',
      'block_type' => 'N',
      'disposition' => 'C',
      'user_defined' => 'C'
    },
    'eval' => {
      'sha' => 'hex_to_str($value)'
    },
    'index' => 40,
    'map' => {
      'name_string' => 'BLOCK',
      'sha' => 32
    },
    'name' => 'Unified2FileLogSha',
    'order' => [
      'block_type',
      'block_length',
      'sha',
      'name_string',
      'disposition',
      'user_defined'
    ]
  },
  {
    'byte_order' => {
      'application_protocol_id' => 'N',
      'block_length' => 'N',
      'block_type' => 'N',
      'blocked' => 'C',
      'classification_id' => 'N',
      'client_application_id' => 'N',
      'connection_counter' => 'n',
      'connection_instance_id' => 'n',
      'connection_second' => 'N',
      'dport_icode' => 'n',
      'event_id' => 'N',
      'event_microsecond' => 'N',
      'event_second' => 'N',
      'firewall_rule_id' => 'N',
      'generator_id' => 'N',
      'impact' => 'C',
      'impact_flag' => 'C',
      'ip_dst_country' => 'n',
      'ip_src_country' => 'n',
      'mpls_label' => 'N',
      'num_ioc' => 'n',
      'pad' => 'n',
      'priority_id' => 'N',
      'protocol' => 'C',
      'sensor_id' => 'N',
      'signature_id' => 'N',
      'signature_revision' => 'N',
      'sport_itype' => 'n',
      'user_id' => 'N',
      'vlanId' => 'n',
      'web_application_id' => 'N'
    },
    'eval' => {
      'firewall_policy_uuid' => 'uuid_to_str($value)',
      'interface_egress_uuid' => 'uuid_to_str($value)',
      'interface_ingress_uuid' => 'uuid_to_str($value)',
      'ip_destination' => 'ipv6_to_str($value)',
      'ip_source' => 'ipv6_to_str($value)',
      'policy_uuid' => 'uuid_to_str($value)',
      'security_zone_egress_uuid' => 'uuid_to_str($value)',
      'security_zone_ingress_uuid' => 'uuid_to_str($value)'
    },
    'index' => 41,
    'map' => {
      'firewall_policy_uuid' => 16,
      'interface_egress_uuid' => 16,
      'interface_ingress_uuid' => 16,
      'ip_destination' => 16,
      'ip_source' => 16,
      'policy_uuid' => 16,
      'security_zone_egress_uuid' => 16,
      'security_zone_ingress_uuid' => 16
    },
    'name' => 'Unified2IPSEvent',
    'order' => [
      'block_type',
      'block_length',
      'sensor_id',
      'event_id',
      'event_second',
      'event_microsecond',
      'signature_id',
      'generator_id',
      'signature_revision',
      'classification_id',
      'priority_id',
      'ip_source',
      'ip_destination',
      'sport_itype',
      'dport_icode',
      'protocol',
      'impact_flag',
      'impact',
      'blocked',
      'mpls_label',
      'vlanId',
      'pad',
      'policy_uuid',
      'user_id',
      'web_application_id',
      'client_application_id',
      'application_protocol_id',
      'firewall_rule_id',
      'firewall_policy_uuid',
      'interface_ingress_uuid',
      'interface_egress_uuid',
      'security_zone_ingress_uuid',
      'security_zone_egress_uuid',
      'connection_second',
      'connection_instance_id',
      'connection_counter',
      'ip_src_country',
      'ip_dst_country',
      'num_ioc'
    ]
  }
];

1;
