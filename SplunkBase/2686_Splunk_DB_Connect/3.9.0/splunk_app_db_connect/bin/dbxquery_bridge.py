import socket
import sys
import threading
import os.path as op
import re

def parse_dbxquery_server_port():
    appdir = op.dirname(op.dirname(op.abspath(__file__)))

    # DBX-5515：read jars/dbxquery.vmopts file first for customized port
    query_vmopts_path = op.join(appdir, 'jars', 'dbxquery.vmopts')
    if op.exists(query_vmopts_path):
        with open(query_vmopts_path, 'r') as f:
            cont = f.read()
            ports = re.findall(r'-Dport\s*=\s*(\d+)', cont, re.IGNORECASE)
            if ports:
                return int(ports[0])

    # read dbxquery_server.yml
    folders = ['local', 'config']
    pat = re.compile(r'port:\s+(\d+)')
    for folder in folders:
        yml = op.join(appdir, folder, 'dbxquery_server.yml')
        if not op.exists(yml):
            continue

        with open(yml) as f:
            for lin in f:
                m = pat.search(lin)
                if m:
                    return int(m.group(1))

    return 9999

# read from stdin. when length=None, read first line(header) only
# DBX-5233: in Python3, stdin.read() reads strings rather than bytes,
# then string length does not match bytes length in chunk header,
# which may cause search hanging
def read_stdin(length=None):
    if sys.version_info[0] < 3: # python 2
        if length:
            return sys.stdin.read(length)
        return sys.stdin.readline()
    else: # python 3
        data = sys.stdin.buffer.read(length) if length else sys.stdin.buffer.readline()
        return data.decode("utf-8")

# write bytes instead of strings
# DBX-5169: search expects bytes.
# Decode message to string may break the decoding boudaries
def write_stdout(data):
    if sys.version_info[0] < 3: # python 2
        sys.stdout.write(data)
    else: # python 3
        sys.stdout.buffer.write(data)
    sys.stdout.flush()


class DbxQueryBridge(object):

    def __init__(self, args):
        self.args = args
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        port = parse_dbxquery_server_port()
        self.sock.connect(('localhost', port))

    def connect(self):
        th = threading.Thread(
            target=self.read_from_stdin_write_to_dbxquery_server)
        th.start()
        self.read_from_dbxquery_server_write_to_stdout()
        th.join()

    def read_from_stdin_write_to_dbxquery_server(self):
        while True:
            head = read_stdin()
            if not head:
                self.sock.close()
                break

            head_fields = head.split(',')
            meta_len = int(head_fields[1])
            data_len = int(head_fields[2])
            meta_data = read_stdin(meta_len)

            data = ''
            if data_len:
                data = read_stdin(data_len)

            data = head + meta_data + data
            self.sock.sendall(data.encode('utf-8'))

    def read_from_dbxquery_server_write_to_stdout(self):
        # DBX-4889, in windows, text mode stdout write will generate one more
        # carrige return '\r' which corrupts the data.
        if sys.platform == "win32":
            if sys.version_info[0] < 3: # Python 2
                import os
                import msvcrt
                msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)
            else: # Python 3
                sys.stdout = stdout = open(sys.__stdout__.fileno(),
                                            mode=sys.__stdout__.mode,
                                            buffering=1,
                                            encoding=sys.__stdout__.encoding,
                                            errors=sys.__stdout__.errors,
                                            newline='\n',
                                            closefd=False)

        recv = self.sock.recv

        while True:
            data = recv(1024 * 1024)
            if not data:
                sys.stdin.close()
                break

            write_stdout(data)

def main():
    bridge = DbxQueryBridge(sys.argv)
    bridge.connect()

if __name__ == '__main__':
    main()


