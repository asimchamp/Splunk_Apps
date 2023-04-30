# Copyright (c) 2013, 2014 Splunk, Inc.  All rights reserved
import calendar
import datetime
from struct import unpack
from socket import AF_INET, AF_INET6

__all__ = ["socket_inet_ntop", "NtpTime", "unpack", "AF_INET", "AF_INET6"]


def ntop(address_family, address):
    """
    This function is the equivalent of socket.inet_ntop (for OSes where that's not available).
    """
    if address_family == AF_INET:
        data = ["%d" % (ord(a_char)) for a_char in address]
        ret_str = ".".join(data)
    else:  # socket.AF_INET6
        words = [(ord(address[cnt]) << 8) | ord(address[cnt + 1]) for cnt in xrange(0, 16, 2)]
        zeros = [index for index in xrange(0, 8) if words[index] == 0]
        begin_run = -1
        end_run = -1
        curr_value = -1
        for cnt, index in enumerate(zeros):
            if begin_run == -1 and cnt < len(zeros) - 1:
                if index + 1 == zeros[cnt + 1]:
                    begin_run = index
                curr_value = index
            else:
                if curr_value + 1 == index:
                    curr_value = index
                else:
                    end_run = index
        if end_run == -1 and begin_run != -1:
            end_run = curr_value
        if begin_run != -1:
            del words[begin_run:end_run]
            words[begin_run] = None
        str_words = ["%x" % a_word if a_word is not None else "" for a_word in words]
        ret_str = ":".join(str_words)
    return ret_str

# Windows does not support inet_ntop, so we need this try/except.
try:
    import socket
    socket_inet_ntop = socket.inet_ntop
except AttributeError:
    socket_inet_ntop = ntop


class NtpTime:
    """
    NTP timestamp is represented as a 64-bit unsigned fixed-point number, in
    seconds relative to 0h on 1 Jan 1900. The integer part is in the first 32
    bits and the fraction part in the last 32 bits.
    """

    ## NOTE: the epoch rolls sometimes in Feb 8 2036, we'll need to update this by then!
    ntp_epoch = datetime.datetime(year=1900, month=1, day=1)

    def __init__(self, seconds, fraction, scale=1e6):
        """Initialize NtpTime from seconds and fractions, optionally rounding off at scale.

        @param seconds: a timestamp in whole seconds since Jan 1 1900
        @param fraction: additional fractions of a second for accuracy
        @param scale: the actual accuracy at which the fraction will be trimmed. defaults to 1e6 (6 decimal places))
        """
        self.seconds = seconds
        self.fraction = fraction

        fraction /= (scale / 1e6)  # Scale scale to microseconds
        self.datetime = NtpTime.ntp_epoch + datetime.timedelta(
            seconds=seconds,
            microseconds=fraction
        )
        ## I'm leaving this here because it produces a different result, and I thought it was right, once:
        ## It's a matter of a second or so, if anyone can help me understand which is right.
        # self.datetime = datetime.datetime.utcfromtimestamp( seconds + (float(fraction) / scale) - 2208988800 )

    def __str__(self):
        """
        Force NtpTime to go to string in ISO format.
        @return: the string representation
        """
        return self.datetime.isoformat()

    def __float__(self):
        """Calculates the unix timestamp from this NtpTime object

        @return: the floating point unix timestamp
        """
        time = calendar.timegm(self.datetime.utctimetuple()) + (self.datetime.microsecond / 1000000.0)
        return time

    @staticmethod
    def from_bytes(data):
        """NTP timestamp is represented as 64bits:
        The first 32 bits are an integer specifying the datetime in seconds relative to 0h on 1 Jan 1900.
        The last 32 bits are the fractions of a second (overkill much?).

        @param data: an NTP timestamp in packed binary form
        @return: An NtpTime object
        """
        seconds = unpack("!I", data[0:4])[0]
        if len(data) >= 8:
            fraction = unpack("!I", data[4:8])[0]
        else:
            fraction = 0
        return NtpTime(seconds, fraction)

    @staticmethod
    def from_longlong(ntp_timestamp):
        """NTP timestamp is represented as a 64-bit unsigned fixed-point number,
        in seconds relative to 0h on 1 Jan 1900. The integer part is in the first 32 bits
        and the fraction part in the last 32 bits.

        @param ntp_timestamp: a timestamp in the NTP specified 64bit unsigned fixed-point representation
        @return: An NtpTime object
        """
        seconds = (ntp_timestamp >> 32) & 0xFFFFFFFF
        fraction = (ntp_timestamp & 0xFFFFFFFF)
        return NtpTime(seconds, fraction)
