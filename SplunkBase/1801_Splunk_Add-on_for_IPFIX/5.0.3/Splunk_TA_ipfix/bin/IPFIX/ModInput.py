import logging
from splunklib.modularinput import Script, Scheme, Argument, EventWriter, Event

__author__ = 'JBennett'


class ModInput(Script):
    def get_scheme(self):
        """Splunk SDK uses a class for outputting the scheme xml instead of having us just write the XML ourselves.
        get_scheme must return a Scheme object representing the configuration we expect.

        @return: scheme, a Scheme object
        """
        scheme = Scheme("IPFIX")
        scheme.description = "Listens for IPFIX data and decodes it for Splunk."
        # I'm not sure why external validation defaults to true
        scheme.use_external_validation = False

        scheme.add_argument(
            Argument("address", "The interface to listen on, 0.0.0.0 to listen on all addresses",
                     data_type=Argument.data_type_string))  # Really it's an ip address ...

        scheme.add_argument(
            Argument("port", "The UDP port to listen on for incoming IPFIX traffic",
                     validation="is_avail_udp_port(port)",
                     data_type=Argument.data_type_number))

        scheme.add_argument(
            Argument("buffer", "The size to force the network buffer to (should be large enough to protect against flooding)",
                     validation="is_pos_int(port)",
                     data_type=Argument.data_type_number))

        return scheme

    def handle_message(self, data, address, stanza, writer):
        from struct import unpack
        from IPFIX import Parser, DataSource

        log = logging.getLogger("ipfix")

        # Read the version, and then parse the rest of the header based on that
        (version,) = unpack("!H", data[:2])
        # Currently, anything other than IPFIX 10 is unsupported
        if version != 10:
            log.log(EventWriter.ERROR, "Unsupported version! IPFIX version %s is not supported.", version)
            return


        # For each version of IPFIX, we need to fully parse the header, and then call an appropriate parser:
        (length, timestamp, sequence, observer_id) = unpack("!HIII", data[2:16])
        source = DataSource(address[0], address[1], observer_id)

        log.log(EventWriter.INFO,
                "Version: %s; FullLength: %s; Timestamp: %s; FlowSequence: %s; %s"
                , version, length, timestamp, sequence, ":".join([str(v) for v in source]))

        ipfix = Parser(source, data[16:], length - 16)

        # And finally, if the message contained data (versus templates) send it to splunk
        if not ipfix.data: return

        for data_set in ipfix.data:
            if not data_set.length:
                writer.write_event(Event(
                    data=('Sequence="%s"; Template="%s"; ParseError="Template not known (yet).";' % (sequence, data_set.template_id)),
                    stanza=stanza,
                    time=timestamp,
                    source=":".join([str(v) for v in source])))
                return

            for record in data_set:
                log.log(EventWriter.DEBUG, str(record))
                writer.write_event(Event(
                    data=('Sequence="%s"; Template="%s"; %s' % (sequence, data_set.template_id, record)),
                    stanza=stanza,
                    time=timestamp,
                    source=":".join([str(v) for v in source])))

    def stream_events(self, inputs, writer):
        """The main event: splunk.modularinput.Script parses the streaming XML and passes inputs to stream_events

        @param inputs: The InputDefinition for this modular input
        @param writer: an EventWriter object for streaming output to
        """
        import socket

        stanza, config = inputs.inputs.popitem()

        bind_host = "0.0.0.0" if config["address"] is None else str(config["address"])
        bind_port = int(config["port"])
        socket_buffer = int(config["buffer"])

        log = logging.getLogger("ipfix")

        log.log(EventWriter.INFO, "IPFIX CONFIG %s", config)

        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, socket_buffer)
        except Exception as e:
            log.log(EventWriter.WARN, "Unable to set socket buffer size, data may be lost")
            pass

        try:
            s.bind((bind_host, bind_port))
        except Exception as e:
            log.log(EventWriter.FATAL, "Unable to bind [%s] %s:%s", stanza, bind_host, bind_port)
            raise

        while True:
            #    The IPFIX Message Header 16-bit Length field limits the length of an
            #    IPFIX Message to 65535 octets, including the header.  A Collecting
            #    Process MUST be able to handle IPFIX Message lengths of up to 65535
            #    octets.
            data, address = s.recvfrom(65535)

            self.handle_message(data, address, stanza, writer)
