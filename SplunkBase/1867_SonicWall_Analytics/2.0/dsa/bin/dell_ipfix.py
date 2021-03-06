#!/usr/bin/env python
#
# Description: A IPFIX collector which convert the DELL IPFIX information and index into splunk
# Created by: Matthew Gao
# Copyright 2013 Dell, Inc.

import random, sys, socket, types,os,thread
import datetime,time,signal,traceback,struct
from splunklib.modularinput import *
from TemplateManager import *
from DataManager import *
#from threading import Timer

s_message_count = 0
s_total_size = 0
s_discard_count = 0

try:
    import xml.etree.cElementTree as ET
except ImportError:
    import xml.etree.ElementTree as ET

def checkForRunningProcess(port):
    canonPath = getPIDFilePath(port)
    if os.path.isfile(canonPath):
        pidfile = open(canonPath, "r")
        pidfile.seek(0)
        old_pid = pidfile.readline()
        try:
            os.kill(int(old_pid),signal.SIGKILL)
        except Exception as e:
            sys.stdout = str(sys._getframe().f_code.co_name)+":"+str(e)
            pass
        pidfile.close()  
        os.remove(canonPath)
          
def writePidFile(port):
    canonPath = getPIDFilePath(port)
    pid = str(os.getpid())
    f = open(canonPath, 'w')
    f.write(pid)
    f.close()

        
def getPIDFilePath(port):
    return os.environ.get("SPLUNK_HOME", "")+"/var/run/dell-ipfix-"+str(port)+".pid"

    
class IPFIXCollector(Script):
    """All modular inputs should inherit from the abstract base class Script
    from splunklib.modularinput.script.
    They must override the get_scheme and stream_events functions, and,
    if the scheme returned by get_scheme has Scheme.use_external_validation
    set to True, the validate_input function.
    """
    def get_scheme(self):
        """When Splunk starts, it looks for all the modular inputs defined by
        its configuration, and tries to run them with the argument --scheme.
        Splunkd expects the modular inputs to print a description of the
        input in XML on stdout. The modular input framework takes care of all
        the details of formatting XML and printing it. The user need only
        override get_scheme and return a new Scheme object.

        :return: scheme, a Scheme object
        """
        scheme = Scheme("Dell IPFIX collector")
        scheme.description = "Collect the Dell IPFIX information"
        
        # If you set external validation to True, without overriding validate_input,
        # the script will accept anything as valid. Generally you only need external
        # validation if there are relationships you must maintain among the
        # parameters, such as requiring min to be less than max in this example,
        # or you need to check that some resource is reachable or valid.
        # Otherwise, Splunk lets you specify a validation string for each argument
        # and will run validation internally using that string.
        scheme.use_external_validation = True
        
        #if con-current start the input modular set it False
        scheme.use_single_instance = False
        
        port_argument = Argument("port")
        port_argument.data_type = Argument.data_type_number
        port_argument.description = "Listen Port"
        port_argument.required_on_create = True
        scheme.add_argument(port_argument)

        return scheme


    def validate_input(self, validation_definition):
        """In this function we are using external validation to verify that whether
        the port has been used. If validate_input does not raise an Exception, the
        input is assumed to be valid. Otherwise it prints the exception as an error
        message when telling splunkd that the configuration is invalid.

        When using external validation, after splunkd calls the modular input with
        --scheme to get a scheme, it calls it again with --validate-arguments for
        each instance of the modular input in its configuration files, feeding XML
        on stdin to the modular input to do validation. It is called the same way
        whenever a modular input's configuration is edited.

        :param validation_definition: a ValidationDefinition object
        """
        try:
            port = int(validation_definition.parameters["port"])
        except Exception as e:
            raise ValueError("Port is not a integer")
        
        if(port<0 or port>65535):
            raise ValueError("Port range exceeded")

        try:
            sk = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sk.settimeout(2)
            sk.bind(('', port))
            sk.close()
        except socket.error, e:
            sk.close()
            if e.errno == 98 or e.errno == 13:
                raise ValueError("This port is already in use")

    def stream_events(self, inputs, ew):
        """This function handles all the action: splunk calls this modular input
        without arguments, streams XML describing the inputs to stdin, and waits
        for XML on stout describing events.

        If you set use_single_instance to True on the scheme in get_scheme, it
        will pass all the instances of this input to a single instance of this
        script.

        :param inputs: an InputDefinition object
        :param ew: an EventWriter object
        """
        host =''
        port =0

        for input_name, input_item in inputs.inputs.iteritems():
            port = int(input_item["port"])
        
        ew.log(EventWriter.INFO,"IPFIX converter init")
        checkForRunningProcess(port)
        writePidFile(port)
        ew.log(EventWriter.INFO,"Start to listen port "+str(port))
        #ew.log(EventWriter.INFO,port)
        
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind((host, port))
        except Exception as e:
            ew.log(EventWriter.ERROR,str(sys._getframe().f_code.co_name)+":Failed When Establish Connection:"+str(e))

        def send_converter_status(ew,num_lock):

            while True:
                if num_lock.acquire():
                    try:
                        global s_message_count
                        global s_total_size
                        global s_discard_count
                        
                        event2 = Event()

                        event2.data = "tid=555" +\
                                      " total_data_count=" + str(s_message_count) +\
                                      " total_data_size_kb=" + str(s_total_size) +\
                                      " total_discard_count=" + str(s_discard_count)
                        event2.time = time.strftime("%Y-%m-%d %H:%M:%S")
                        event2.host = "localhost:" + str(port)
                        event2.sourcetype = "Dell_IPFIX"
                        #event1.index=None
                        #event1.done=None
                        #event1.unbroken=None
                        ew.write_event(event2)

                        s_message_count = 0
                        s_total_size = 0
                        s_discard_count = 0
                    except Exception as e:
                        ew.log(EventWriter.ERROR,"send template 555 fail:"+str(e))
                    finally:
                        num_lock.release()

                time.sleep(120)
            thread.exit_thread()
         

        lock = thread.allocate_lock()
        id1 = thread.start_new_thread(send_converter_status,(ew, lock))

        while True:
            try:
                message, address = s.recvfrom(16384)
            except Exception as e:
                ew.log(EventWriter.ERROR,str(sys._getframe().f_code.co_name)+"="+str(e))

            """
            Initialize the TemplateManager and DataManager
            """
            tmp = TemplateManager()
            data = DataManager()
            
            """
            Parse the template header, If it's None then skip.
            """
            hdr = data.parseHdr(message)
            if hdr is None:
                continue
            
            """
            Break header down to several parameters
            """
            (version, length, sequence, export_epoch, odid, setID, setLen)=hdr

            if(version >10 or version <9):
                continue

            """
            Cleanup the result
            """    
            result = ()

            """
            setID == 2 represent a template data.
            """  
            if(setID == 2):
                continue
            else:
                result = data.parseDate(message,setID,setLen,tmp.getFmtStr())

            if result is None:
                continue

            global s_message_count
            global s_total_size
            global s_discard_count

            if lock.acquire():
                try:
                    for r in result:
                        event1 = Event()
                        outstr = data2string(setID,r)

                        s_message_count = s_message_count + 1
                        
                        if(outstr == None):
                            s_discard_count = s_discard_count + 1
                            continue

                        s_total_size = s_total_size + float(len(outstr))/1024

                        event1.data = "tid="+str(setID)+" "+outstr
                        event1.stanza = str(address)
                        event1.time = time.strftime("%Y-%m-%d %H:%M:%S")
                        event1.host = str(address[0])
                        event1.sourcetype = "Dell_IPFIX"
                        #event1.index=None
                        #event1.done=None
                        #event1.unbroken=None
                        ew.write_event(event1)
                        
                except Exception as e:
                    sys.stdout = "Process Data Error" + " TemplateID: "+str(setID)
                    f = sys.exc_info()[2].tb_frame.f_back
                    ew.log(EventWriter.ERROR,str(f.f_code.co_name)+" at line "+str(f.f_lineno)+", failure reason:"+ str(e)+", TemplateID:"+str(setID))
                    ew.log(EventWriter.ERROR,"tid="+str(setID)+", OUTPUT STRING:"+str(outstr))
                finally:
                    lock.release()
        s.close()
        
def data2string(setID,inputdata):
    templateList= {
        TEMPLATE_AVT_SESSION_START: lambda: resolve_AVT_SESSION_START(inputdata),
        TEMPLATE_AVT_SESSION_END: lambda: resolve_AVT_SESSION_END(inputdata),
        TEMPLATE_AVT_RESOUCRE: lambda: resolve_AVT_RESOUCRE(inputdata),

        TEMPLATE_ANTI_SPYWARE: lambda: resolve_ANTI_SPYWARE(inputdata),
        TEMPLATE_APPLICATION: lambda: resolve_APPLICATION(inputdata),
        TEMPLATE_COLUMN_MAP: lambda: resolve_COLUMN_MAP(inputdata),
        TEMPLATE_CORE_STAT: lambda: resolve_CORE_STAT(inputdata),
        TEMPLATE_DEVICES: lambda: resolve_DEVICES(inputdata),
        TEMPLATE_FLOW_EXTN: lambda: resolve_FLOW_EXTN(inputdata),
        TEMPLATE_GAV: lambda: resolve_GAV(inputdata),
        TEMPLATE_IF_STAT: lambda: resolve_IF_STAT(inputdata),
        TEMPLATE_IPS: lambda: resolve_IPS(inputdata),
        TEMPLATE_LOCATION_MAP: lambda: resolve_LOCATION_MAP(inputdata),
        TEMPLATE_LOCATION: lambda: resolve_LOCATION(inputdata),
        TEMPLATE_LOG: lambda: resolve_LOG(inputdata),
        TEMPLATE_MEMORY: lambda: resolve_MEMORY(inputdata),
        TEMPLATE_RATING: lambda: resolve_RATING(inputdata),
        TEMPLATE_SERVICES: lambda: resolve_SERVICES(inputdata),
        TEMPLATE_SPAM: lambda: resolve_SPAM(inputdata),
        TEMPLATE_TABLE_MAP: lambda: resolve_TABLE_MAP(inputdata),
        TEMPLATE_TOPAPPS_STAT: lambda: resolve_TOPAPPS_STAT(inputdata),
        TEMPLATE_URL_RATING: lambda: resolve_URL_RATING(inputdata),
        TEMPLATE_URL: lambda: resolve_URL(inputdata),
        TEMPLATE_USER: lambda: resolve_USER(inputdata),
        TEMPLATE_VOIP: lambda: resolve_VOIP(inputdata),
        TEMPLATE_VPN: lambda: resolve_VPN(inputdata),

        TEMPLATE_IPV6_FLOW_EXTN: lambda: resolve_IPV6_FLOW_EXTN(inputdata),
        TEMPLATE_IPV6_USER: lambda: resolve_IPV6_USER(inputdata),
        TEMPLATE_IPV6_URL: lambda: resolve_IPV6_URL(inputdata),
        TEMPLATE_IPV6_LOCATION: lambda: resolve_IPV6_LOCATION(inputdata),
        TEMPLATE_IPV6_SPAM: lambda: resolve_IPV6_SPAM(inputdata),
        TEMPLATE_IPV6_DEVICES: lambda: resolve_IPV6_DEVICES(inputdata),
        TEMPLATE_IPV6_VPN_TUNNELS: lambda: resolve_IPV6_VPN_TUNNELS(inputdata),
        TEMPLATE_IPV6_IF_STAT: lambda: resolve_IPV6_IF_STAT(inputdata),
        TEMPLATE_IPV6_TOPAPPS: lambda: resolve_IPV6_TOPAPPS(inputdata),

        TEMPLATE_FLOW_OPEN_TYPE_V2: lambda: resolve_FLOW_OPEN_TYPE_V2(inputdata),
        TEMPLATE_IPV6_FLOW_OPEN_TYPE_V2: lambda: resolve_IPV6_FLOW_OPEN_TYPE_V2(inputdata),
        TEMPLATE_FLOW_CLOSE_TYPE_V2: lambda: resolve_FLOW_CLOSE_TYPE_V2(inputdata),
        TEMPLATE_THREAT_UPDATE_TYPE_V2: lambda: resolve_THREAT_UPDATE_TYPE_V2(inputdata),
        TEMPLATE_VPN_UPDATE_TYPE_V2: lambda: resolve_VPN_UPDATE_TYPE_V2(inputdata),
        TEMPLATE_USER_UPDATE_TYPE_V2: lambda: resolve_USER_UPDATE_TYPE_V2(inputdata),
        TEMPLATE_APP_UPDATE_TYPE_V2: lambda: resolve_APP_UPDATE_TYPE_V2(inputdata),
        TEMPLATE_BYTES_UPDATE_TYPE_V2: lambda: resolve_BYTES_UPDATE_TYPE_V2(inputdata),

    }
    if(templateList.has_key(setID)):
        return templateList[setID]()
    return None

def resolve_ANTI_SPYWARE(r):
    outString = "signature="+"\""+str(r[1])+"\""+\
                " product_version="+str(r[2])+\
                " product="+str(r[3])+\
                " signature_id="+str(r[4])
    return outString

def resolve_APPLICATION(r):
    outString = "app_ID="+str(r[1])+\
                " app_name="+"\""+str(r[2])+"\""+\
                " cat-id="+str(r[3])+\
                " app_cat-name="+str(r[4])+\
                " sig-id="+str(r[5])+\
                " bwm_attr="+str(r[6])+\
                " risk_attr="+str(r[7])+\
                " tech_attr="+str(r[8])+\
                " attr_bit_mask="+str(r[9])+\
                " content_type="+str(r[10])
    return outString

def resolve_COLUMN_MAP(r):
    return None

def resolve_CORE_STAT(r):
    return None
    outString = "core-stat_core_id="+str(r[0])+\
                " core-stat_core_util="+str(r[1])
    return outString

def resolve_DEVICES(r):
    outString = "src_int="+str(r[0])+\
                " dvc_ip="+ipv4_to_string(int(r[1]))+\
                " dvc_mac="+hex2string(r[2])
    return outString

def resolve_FLOW_EXTN(r):
    outString = "session_id="+str(r[1])+\
                " src_mac="+hex2string(r[2])+\
                " dest_mac="+hex2string(r[3])+\
                " src_ip="+ipv4_to_string(int(r[4]))+\
                " dest_ip="+ipv4_to_string(int(r[5]))+\
                " initiator_GW-IP_Addr="+ipv4_to_string(int(r[6]))+\
                " responder_GW-IP_Addr="+ipv4_to_string(int(r[7]))+\
                " src_int="+str(r[8])+\
                " src_port="+str(r[12])+\
                " dest_port="+str(r[13])+\
                " init_to_resp_pkts="+str(r[14]+r[18])+\
                " init_to_resp_octets="+str(r[15]+r[19])+\
                " resp_to_init_pkts="+str(r[16]+r[20])+\
                " resp_to_init_octets="+str(r[17]+r[21])+\
                " start_time="+"\""+datetime.datetime.fromtimestamp(r[22]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " end_time="+"\""+datetime.datetime.fromtimestamp(r[23]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " tcp_flag="+str(r[24])+\
                " protocol="+str(r[25])
    if(r[26] != 0):
        outString = outString + " flow_block_reason="+str(r[26])
    outString = outString + " app_id="+str(r[27])
    if(r[28] != 0):
        outString = outString + " user="+str(r[28])
    if(r[29] != 0):        
        outString = outString +" flow_to_ips_id="+str(r[29])
    if(r[30] != 0):        
        outString = outString +" flow_to_virus_id="+str(r[30])
    if(r[31] != 0):        
        outString = outString +" flow_to_spyware_id="+str(r[31])

    return outString

def resolve_GAV(r):
    outString = "signature="+"\""+str(r[1])+"\""+\
                " signature_id="+str(r[2])
    return outString

def resolve_IF_STAT(r):
    if(r[5] == 0):
        return None
    if(r[6] == 0):
        return None
    if(r[7] == 0):
        return None
    if(r[10] == 1):
        outString = "outbound_interface="+str(r[0])+\
                    " ipackets_in="+str(r[1])+\
                    " packets_out="+str(r[2])+\
                    " bytes_in="+str(r[3])+\
                    " bytes_out="+str(r[4])+\
                    " if-stat_in_pkt_size="+str(r[5])+\
                    " if-stat_out_pkt_size="+str(r[6])+\
                    " if-stat_conn_rate="+str(r[7])+\
                    " if-stat_if_type="+str(r[8])+\
                    " if-stat_if_mode="+str(r[9])+\
                    " if-stat_if_state="+str(r[10])+\
                    " if-stat_if_speed="+str(r[11])+\
                    " if-stat_if_name="+str(r[12])+\
                    " if-stat_if_mtu="+str(r[13])+\
                    " dvc_mac="+hex2string(r[14])+\
                    " dvc_ip="+ipv4_to_string(int(r[15]))+\
                    " if-stat_security_type="+str(r[16])+\
                    " if-stat_zone_name="+str(r[17])
        return outString
    return None

def resolve_IPS(r):
    outString = "ips_name="+"\""+str(r[1])+"\""+\
                " ips_cat-id="+str(r[2])+\
                " ips_cat-name="+str(r[3])+\
                " signature_id="+str(r[4])
    return outString

def resolve_LOCATION_MAP(r):
    outString = "country_id="+str(r[1])+\
                " dest_country="+"\""+str(r[2])+"\""
                
    return outString

def resolve_LOCATION(r):
    outString = "location_ip="+ipv4_to_string(int(r[0]))+\
                " location_region-id="+str(r[1])
    #" location_domain-name="+str(r[2])
    return outString

def resolve_LOG(r):
    outString = " "
    return outString

def resolve_MEMORY(r):
    return None
    outString = "TotalMBytes="+str(r[0])+\
                " mem_avail_RAM="+str(r[1])+\
                " UsedMBytes="+str(r[2])+\
                " mem_DB_RAM="+str(r[3])+\
                " mem_flow_count="+str(r[4])+\
                " mem_per_flow="+str(r[5])+\
                " min-conn="+str(r[6])+\
                " curr-conn="+str(r[7])+\
                " max-conn="+str(r[8])
    return outString

def resolve_RATING(r):
    outString = "rating_index="+str(r[0])+\
                " rating_name="+"\""+str(r[1])+"\""
    return outString

def resolve_SERVICES(r):
    return None
    outString = "service_name="+"\""+str(r[0])+"\""+\
                " service_ip_type="+str(r[1])+\
                " service_port_begin="+str(r[2])
    if(r[2]!=r[3]):
        outString = outString+" service_port_end="+str(r[3])
                
    return outString

def resolve_SPAM(r):
    outString = "event_id="+str(r[0])+\
                " spam_flow_id="+str(r[1])+\
                " spam_time_id="+str(r[2])+\
                " spam_spammer="+str(r[3])+\
                " spam_type="+str(r[4])+\
                " recipient="+str(r[5])+\
                " sender="+str(r[6])
    return outString

def resolve_TABLE_MAP(r):
    return None
    outString = "template_identifier="+str(r[0])+\
                " table_name="+str(r[1])
    return outString

def resolve_TOPAPPS_STAT(r):
    return None
    outString = "top-apps_sigId="+str(r[0])+\
                " top-apps_appname="+"\""+str(r[1])+"\""\
                " top-apps_rate="+str(r[2])
    return outString

def resolve_URL_RATING(r):
    outString = "url="+str(r[0])
    if(r[1]!=0):
        outString = outString+" url-rating_val1="+str(r[1])
    if(r[2]!=0):
        outString = outString+" url-rating_val2="+str(r[2])
    if(r[3]!=0):
        outString = outString+" url-rating_val3="+str(r[3])
    if(r[4]!=0):
        outString = outString+" url-rating_val4="+str(r[4])

    return outString

def resolve_URL(r):
    outString = "session_id="+str(r[0])+\
                " first_time="+"\""+datetime.datetime.fromtimestamp(r[1]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " url="+str(r[2])
    return outString

def resolve_USER(r):
    outString = "user="+str(r[0])+\
                " user_id="+str(r[1])+\
                " user_domain_name="+str(r[2])+\
                " src_ip="+ipv4_to_string(int(r[4]))+\
                " user_auth_type="+str(r[5])
    return outString

def resolve_VOIP(r):
    outString = "session_id="+str(r[0])+\
                " voip_time_id="+str(r[1])+\
                " media_type="+str(r[2])+\
                " media_protocol="+str(r[3])+\
                " voip_init_call_id="+str(r[4])+\
                " voip_resp_call_id="+str(r[5])+\
                " init2resp_lost_pkts="+str(r[6])+\
                " resp2init_lost_pkts="+str(r[7])+\
                " init2resp_avg_latency="+str(r[8])+\
                " init2resp_max_latency="+str(r[9])+\
                " resp2init_avg_latency="+str(r[10])+\
                " resp2init_max_latency="+str(r[11])
    return outString

def resolve_VPN(r):
    outString = "vpn_tunnel_name="+"\""+str(r[2])+"\""+\
                " vpn_local_gw="+ipv4_to_string(int(r[3]))+\
                " vpn_remote_gw="+ipv4_to_string(int(r[4]))+\
                " vpn_tunnel_iface_id="+str(r[5])+\
                " vpn_policy_type="+str(r[6])+\
                " vpn_protocol_type="+str(r[7])+\
                " vpn_encryption_type="+str(r[8])+\
                " vpn_authentication_type="+str(r[9])+\
                " start_time="+"\""+datetime.datetime.fromtimestamp(r[10]).strftime('%Y-%m-%d %H:%M:%S')+"\""
    if(r[11]!=0):
        outString = outString+" end_time="+"\""+datetime.datetime.fromtimestamp(r[11]).strftime('%Y-%m-%d %H:%M:%S')+"\""
    return outString

def resolve_AVT_SESSION_START(r): 
    outString = "session_token="+str(r[0])+\
                " username="+str(r[1])+\
                " realm="+str(r[2])+\
                " start_time="+"\""+datetime.datetime.fromtimestamp(r[3]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " remote_address="+str(r[4])+\
                " platform="+str(r[5])
    return outString

def resolve_AVT_SESSION_END(r):   
    outString = "session_token="+str(r[0])+\
                " end_time="+"\""+datetime.datetime.fromtimestamp(r[1]).strftime('%Y-%m-%d %H:%M:%S')+"\""
    return outString

def resolve_AVT_RESOUCRE(r):
    outString = "username="+str(r[0])+\
                " realm="+str(r[1])+\
                " resource_token="+str(r[2])+\
                " resource protocol="+str(r[3])+\
                " resource_name="+str(r[4])+\
                " access_method="+str(r[5])+\
                " request_method:"+str(r[6])+\
                " sent_bytes="+str(r[7])+\
                " receive_bytes="+str(r[8])+\
                " resource_port="+str(r[9])+\
                " start_time="+"\""+datetime.datetime.fromtimestamp(r[10]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " end_time="+"\""+datetime.datetime.fromtimestamp(r[11]).strftime('%Y-%m-%d %H:%M:%S')+"\""
    return outString

def resolve_IPV6_FLOW_EXTN(r):
    outString = "time_stamp="+"\""+datetime.datetime.fromtimestamp(r[0]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " flow_identifier="+str(r[1])+\
                " initiator_gw_MAC="+hex2string(r[2])+\
                " responder_gw_MAC="+hex2string(r[3])+\
                " initiator_IPv6_Addr="+ipv6_to_string(r[4])+\
                " responder_IPv6_Addr="+ipv6_to_string(r[5])+\
                " initiator_GW-IPv6_Addr="+ipv6_to_string(r[6])+\
                " responder_GW-IPv6_Addr="+ipv6_to_string(r[7])+\
                " initiator_iface="+str(r[8])+\
                " responder_iface="+str(r[9])+\
                " init_vpn_spi_out="+str(r[10])+\
                " resp_vpn_spi_out="+str(r[11])+\
                " initiator_port="+str(r[12])+\
                " responder_port="+str(r[13])+\
                " init_to_resp_pkts="+str(r[14]+r[18])+\
                " init_to_resp_octets="+str(r[15]+r[19])+\
                " resp_to_init_pkts="+str(r[16]+r[20])+\
                " resp_to_init_octets="+str(r[17]+r[21])+\
                " start_time="+"\""+datetime.datetime.fromtimestamp(r[22]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " end_time="+"\""+datetime.datetime.fromtimestamp(r[23]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " protocol_type="+str(r[25])+\
                " flow_block_reason="+str(r[26])+\
                " flow_to_application_id="+str(r[27])
    return outString

def resolve_IPV6_USER(r):
    outString = "user_index="+str(r[0])+\
                " user="+str(r[1])+\
                " user_domain_name="+str(r[2])+\
                " user_id="+str(r[3])+\
                " src="+str(r[4])+\
                " user_auth-type="+str(r[5])
    return outString

def resolve_IPV6_URL(r):
    outString = "session_id="+str(r[0])+\
                " first_time="+"\""+datetime.datetime.fromtimestamp(r[1]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " url="+str(r[2])
    return outString

def resolve_IPV6_LOCATION(r):
    outString = "location_ip="+str(r[0])+\
                " location_region-id="+str(r[1])+\
                " location_domain_name="+str(r[2])
    return outString

def resolve_IPV6_SPAM(r):
    outString = "event_id="+str(r[0])+\
                " spam_flow_id="+str(r[1])+\
                " spam_time_id="+str(r[2])+\
		" IPv6_orig_ip="+ipv6_to_string(r[3])+\
                " spam_spammer="+str(r[4])+\
                " spam_type="+str(r[5])+\
                " recipient="+str(r[6])+\
                " sender="+str(r[7])
    return outString

def resolve_IPV6_DEVICES(r):
    if(None == r[3]):
        return None
    outString = "src_int="+str(r[0])+\
                " dvc_ip="+ipv6_to_string(r[1])+\
                " dvc_mac="+hex2string(r[2])+\
                " dvc_host="+str(r[3])
    return outString

def resolve_IPV6_VPN_TUNNELS(r):
    outString = "vpn_in_spi-id="+str(r[0])+\
                " vpn_out_spi-id="+str(r[1])+\
                " vpn_tunnel_name="+str(r[2])+\
                " vpn_local_gw="+str(r[3])+\
                " vpn_remote_gw="+str(r[4])+\
                " vpn_tunnel_iface_id="+str(r[5])+\
                " vpn_policy_type="+str(r[6])+\
                " vpn_protocol_type="+str(r[7])+\
                " vpn_encryption_type="+str(r[8])+\
                " vpn_authentication_type="+str(r[9])+\
                " start_time="+"\""+datetime.datetime.fromtimestamp(r[10]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " end_time="+"\""+datetime.datetime.fromtimestamp(r[11]).strftime('%Y-%m-%d %H:%M:%S')+"\""
    return outString

def resolve_IPV6_IF_STAT(r):
    if(r[5]==0):
        return None
    if(r[6]==0):
        return None
    if(r[7]==0):
        return None
    if(r[10]==1):
        outString = "outbound_interface="+str(r[0])+\
                    " ipackets_in="+str(r[1])+\
                    " packets_out="+str(r[2])+\
                    " bytes_in="+str(r[3])+\
                    " bytes_out="+str(r[4])+\
                    " if-stat_in_pkt_size="+str(r[5])+\
                    " if-stat_out_pkt_size="+str(r[6])+\
                    " if-stat_conn_rate="+str(r[7])+\
                    " if-stat_if_type="+str(r[8])+\
                    " if-stat_if_mode="+str(r[9])+\
                    " if-stat_if_state="+str(r[10])+\
                    " if-stat_if_speed="+str(r[11])+\
                    " if-stat_if_name="+str(r[12])+\
                    " if-stat_if_mtu="+str(r[13])+\
                    " dvc_mac="+hex2string(r[14])+\
                    " dvc_ip="+str(r[15])+\
                    " if-stat_security_type="+str(r[16])+\
                    " if-stat_zone_name="+str(r[17])
        return outString
    return None

def resolve_IPV6_TOPAPPS(r):
    outString = "IPv6_sigId="+str(r[0])+\
                " appname="+"\""+str(r[1])+"\""+\
                " rate="+str(r[2])
    return outString
def resolve_FLOW_OPEN_TYPE_V2(r):
    outString = "session_id="+str(r[0])+\
                " start_time="+"\""+datetime.datetime.fromtimestamp(r[1]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " src_mac="+hex2string(r[2])+\
                " dest_mac="+hex2string(r[3])+\
                " src_ip="+ipv4_to_string(int(r[4]))+\
                " dest_ip="+ipv4_to_string(int(r[5]))+\
                " initiator_GW-IP_Addr="+ipv4_to_string(int(r[6]))+\
                " responder_GW-IP_Addr="+ipv4_to_string(int(r[7]))+\
                " init_if="+str(r[8])+\
                " resp_if="+str(r[9])+\
                " src_port="+str(r[10])+\
                " dest_port="+str(r[11])+\
                " protocol="+str(r[12])+\
                " app_id="+str(r[13])
    return outString

def resolve_IPV6_FLOW_OPEN_TYPE_V2(r):
    outString = "session_id="+str(r[0])+\
                " start_time="+"\""+datetime.datetime.fromtimestamp(r[1]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " src_mac="+hex2string(r[2])+\
                " dest_mac="+hex2string(r[3])+\
                " src_ip="+ipv6_to_string(r[4])+\
                " dest_ip="+ipv6_to_string(r[5])+\
                " initiator_GW-IPv6_Addr="+ipv6_to_string(r[6])+\
                " responder_GW-IPv6_Addr="+ipv6_to_string(r[7])+\
                " init_if="+str(r[8])+\
                " resp_if="+str(r[9])+\
                " src_port="+str(r[10])+\
                " dest_port="+str(r[11])+\
                " protocol="+str(r[12])+\
                " app_id="+str(r[13])
    return outString

def resolve_FLOW_CLOSE_TYPE_V2(r):
    outString = "session_id="+str(r[0])+\
                " init_to_resp_pkts="+str(r[2])+\
                " init_to_resp_octets="+str(r[3])+\
                " resp_to_init_pkts="+str(r[4])+\
                " resp_to_init_octets="+str(r[5])+\
                " end_time="+"\""+datetime.datetime.fromtimestamp(r[6]).strftime('%Y-%m-%d %H:%M:%S')+"\""
    if (r[8] != 0):
        outString = outString + " user_id="+str(r[8])
    if (r[9] != 0):
        outString = outString + " blocked_reason="+str(r[9])
    return outString

def resolve_THREAT_UPDATE_TYPE_V2(r):
    outString = "session_id="+str(r[0])+\
                " time_stamp="+"\""+datetime.datetime.fromtimestamp(r[1]).strftime('%Y-%m-%d %H:%M:%S')+"\""
    if(r[2]==1):
        outString = outString + " flow_to_ips_id="+str(r[3])
    if(r[2]==2):
        outString = outString + " flow_to_virus_id="+str(r[3])
    if(r[2]==3):
        outString = outString + " flow_to_spyware_id="+str(r[3])
        
    return outString

def resolve_VPN_UPDATE_TYPE_V2(r):
    outString = "session_id="+str(r[0])+\
                " time_stamp="+"\""+datetime.datetime.fromtimestamp(r[1]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " init_vpnOutIndex="+str(r[2])+\
                " resp_vpnOutIndex="+str(r[3])
    return outString

def resolve_USER_UPDATE_TYPE_V2(r):
    outString = "session_id="+str(r[0])+\
                " time_stamp="+"\""+datetime.datetime.fromtimestamp(r[1]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " user_id="+str(r[2])
    return outString

def resolve_APP_UPDATE_TYPE_V2(r):
    outString = "session_id="+str(r[0])+\
                " time_stamp="+"\""+datetime.datetime.fromtimestamp(r[1]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " app_id="+str(r[2])
    return outString

def resolve_BYTES_UPDATE_TYPE_V2(r):
    outString = "time_stamp="+"\""+datetime.datetime.fromtimestamp(r[0]).strftime('%Y-%m-%d %H:%M:%S')+"\""+\
                " session_id="+str(r[1])+\
                " init_vpnOutIndex="+str(r[2])+\
                " resp_vpnOutIndex="+str(r[3])+\
                " init_to_resp_pkts="+str(r[4])+\
                " init_to_resp_octets="+str(r[5])+\
                " resp_to_init_pkts="+str(r[6])+\
                " resp_to_init_octets="+str(r[7])+\
                " blocked_reason="+str(r[8])+\
                " app_id="+str(r[9])+\
                " user_id="+str(r[10])+\
                " ips_id="+str(r[11])+\
                " gav_id="+str(r[12])+\
                " aspy_id="+str(r[13])
    return outString

def ipv4_to_string(ipv4):
    try:
        ipv4_n = socket.htonl(ipv4)
        data = struct.pack('I', ipv4_n)
        ipv4_string = socket.inet_ntoa(data)
    except Exception as e:
        sys.error = "ipv4_to_string Error"
        return "null"
    return ipv4_string

def hex2string(mac):
    try:
        macstr = mac.encode('hex')
        macstr = str(macstr)
        outstr = macstr[0:2]+'-'+macstr[2:4]+'-'+macstr[4:6]+'-'+macstr[6:8]+'-'+macstr[8:10]+'-'+macstr[10:12]
        outstr = outstr.upper()
    except Exception as e:
        sys.error = "hex2string Error"
        return "null"
    return str(outstr)

def ipv6_to_string(ip):
    try:
        ipstr = ip.encode('hex')
        ipstr = str(ipstr)
        outstr = ipstr[0:4]+':'+ipstr[4:8]+':'+ipstr[8:12]+':'+ipstr[12:16]+':'+ipstr[16:20]+':'+ipstr[20:24]+':'+ipstr[24:28]+':'+ipstr[28:32]
        outstr = outstr.upper()
    except Exception as e:
        sys.error = "ipv6_to_string Error"
        return "null"
    return str(outstr)

if __name__ == "__main__":
    sys.exit(IPFIXCollector().run(sys.argv))

