
@ECHO OFF

SET SplunkApp=TA-peoplesoft_windows_psched

C:\Windows\System32\find.exe /v ";" %ps_cfg_home%\appserv\pswinsrv.cfg |C:\Windows\System32\find.exe "Process Scheduler Databases=" |"%SPLUNK_HOME%\etc\apps\%SplunkApp%\bin\sed" s/"Process Scheduler Databases="//g | "%SPLUNK_HOME%\etc\apps\%SplunkApp%\bin\sed" s/,/\n/g > %temp%\prcserv.txt

FOR /F "tokens=*" %%a IN (%temp%\prcserv.txt) DO (
	echo Status of %%a
	%ps_home%\appserv\psadmin.exe -p sstatus -d %%a 2>NUL
	%ps_home%\appserv\psadmin.exe -p cstatus -d %%a 2>NUL
)


del %temp%\prcserv.txt

