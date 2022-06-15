
@ECHO OFF

SET SplunkApp=TA-peoplesoft_windows_app


C:\Windows\System32\find.exe /v ";" %ps_cfg_home%\appserv\pswinsrv.cfg |C:\Windows\System32\find.exe "Application Server Domains=" |"%SPLUNK_HOME%\etc\apps\%SplunkApp%\bin\sed" s/"Application Server Domains="//g | "%SPLUNK_HOME%\etc\apps\%SplunkApp%\bin\sed" s/,/\n/g > appserv.txt


FOR /F "tokens=*" %%a IN (appserv.txt) DO (
        echo Status of %%a
        %ps_home%\appserv\psadmin.exe -c sstatus -d %%a 2>NUL
        %ps_home%\appserv\psadmin.exe -c cstatus -d %%a 2>NUL
)



del appserv.txt
