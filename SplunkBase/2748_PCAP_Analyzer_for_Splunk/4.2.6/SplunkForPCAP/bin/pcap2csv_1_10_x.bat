@echo off
REM Daniel Schwartz
REM This script converts pcap files to a csv file using tshark 1.10.x
REM Version 1.6
REM Created: May 2015
REM Updated: 08.11.2017
REM Updated: 20.04.2020
REM Updated: 09.10.2020 - fixed custom path with a space in it

SETLOCAL ENABLEDELAYEDEXPANSION
for /f "tokens=*" %%a in ('findstr "path" "%SPLUNK_HOME%\etc\apps\SplunkForPCAP\local\inputs.conf"') do (
set "z=%%a"
set b=!z:~7,200!
for /f %%f in ('dir /b "!b!\*.pcap"') do (
set "f=%%f"
"%programfiles%\Wireshark\tshark" -o tcp.calculate_timestamps:TRUE -r "!b!\!f!" -T fields -e frame.time -e tcp.stream -e frame.number -e ip.src -e ip.dst -e col.Protocol -e tcp.srcport -e tcp.dstport -e tcp.len -e tcp.window_size -e tcp.flags.syn -e tcp.flags.ack -e tcp.flags.push -e tcp.flags.fin -e tcp.flags.reset -e ip.ttl -e col.Info -e tcp.analysis.ack_rtt -e vlan.id  -e eth.src -e eth.dst -e http.time -e dns.time -e rpc.time -e smb2.time -e smb.time -e tcp.time_delta -e tcp.time_relative > "%SPLUNK_HOME%\etc\apps\SplunkForPCAP\PCAPcsv\!f!.csv"
move  "!b!\!f!" "%SPLUNK_HOME%\etc\apps\SplunkForPCAP\PCAPConverted\" >nul 2>&1
))
