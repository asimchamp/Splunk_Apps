@echo off
REM Daniel Schwartz
REM This script aims to check which tshark script to execute
REM Version 1.2
REM Created: December 2016
REM Updated: 08.11.2017 - Monitored folders moved to app directory.

for /f "delims=" %%i in ('"%programfiles%\Wireshark\tshark" -v ^| findstr /r \(v') do set "TS=%%i"
			set T=%TS:~9,2%
			set H=%TS:~7,1%

for /f "delims=" %%a in ('"%programfiles%\Wireshark\tshark" -v ^| findstr /r \(v ^|findstr /r v2') do set "V2="%%a""
IF NOT [%V2%] ==[] (
	CALL "%SPLUNK_HOME%\etc\apps\SplunkForPCAP\bin\pcap2csv_1_11_x_1_12_x.bat"
	) ELSE (
		IF %H% LSS 2 IF %T% LEQ 10 (
		CALL "%SPLUNK_HOME%\etc\apps\SplunkForPCAP\bin\pcap2csv_1_10_x.bat"
		) ELSE (
		CALL "%SPLUNK_HOME%\etc\apps\SplunkForPCAP\bin\pcap2csv_1_11_x_1_12_x.bat"
		)
	)
