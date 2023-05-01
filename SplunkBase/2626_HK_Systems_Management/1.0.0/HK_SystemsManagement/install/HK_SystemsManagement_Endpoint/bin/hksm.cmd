@echo off

::
:: HK Systems Management: main script
:: Copyright (C) 2015 Helge Klein
::
:: Description:
::
:: - This script is invoked once when Universal Forwarder is restarted and from then on every 30 minutes
:: - This script runs all scripts in the user scripts subdirectory
:: - If a user script's name ends with "-runonce" successful execution is stored in the system profile's %LocalAppData% directory and the script is not run again
:: - All output is sent to the index "hksm" with source "hksm"
:: - This script's output is sent to the local splunkd.log and also to Splunk with sourcetype "hksm:main"
:: - The output of user scripts is sent to Splunk with the name of the user script as sourcetype
:: - Multiline output from user scripts is captured as a single Splunk event
::

::
:: Variables
::

:: Script directory (including trainling backslash!)
set ScriptDir=%~dp0

:: Subdirectory with user-supplied scripts which we execute
set UserScriptDir=UserScripts
set UserScriptPath=%ScriptDir%%UserScriptDir%
if not exist "%UserScriptPath%" (
	set ErrMsg=User script directory %UserScriptPath% does not exist!
	goto ExitOnError
)

:: Splunk index
set SplunkIndex=hksm

:: Splunk source
set SplunkSource=hksm

:: Splunk sourcetype (for messages from this main script; the sourcetype for the user scripts is set to each user script's name)
set SplunkSourcetype=hksm:main

:: Archive directory: we list executed scripts here 
set ArchiveDir=%LocalAppData%\HK Systems Management\Executed Scripts
if not exist "%ArchiveDir%" (
   md "%ArchiveDir%"
)

::
:: Start of script
::

call :LogMessage INFO "Starting"

set MatchingExtension=cmd
set MatchingFiles=%UserScriptPath%\*.%MatchingExtension%
if not exist "%MatchingFiles%" (
   call :LogMessage INFO "No scripts to process"
   goto ExitOnSuccess
)

:: Loop over all batch files in the user script directory
for /f "delims=" %%i in ('dir /b "%MatchingFiles%"') do call :ProcessUserScript "%UserScriptPath%\%%i"

:: Done
goto ExitOnSuccess

:::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
:: Subroutine:	Process a single user script
:: Parameters:
::		1: Full path to the script
::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::

:ProcessUserScript

:: All variables created here are to be local
setlocal

:: Store parameters (no quotes on purpose!)
set UserScriptFullPath=%~1
set UserScriptName=%~n1
set UserScriptNameExtension=%~nx1

call :LogMessage INFO "Starting to process script: %UserScriptName%"

:: Check if a file with the script's name exists in the archive directory
set ArchiveScriptPath=%ArchiveDir%\%UserScriptNameExtension%
if exist "%ArchiveScriptPath%" (
   call :LogMessage INFO "Ignoring script because it has been run before (exists in the archive directory): %UserScriptName%"
   goto :eof
)

:: Run the user script
echo ***SPLUNK*** index=%SplunkIndex% source="%SplunkSource%" sourcetype="%UserScriptName%"
call "%UserScriptFullPath%"

:: Check if the script should run only once (its name ends with -runonce, e.g.: test-runonce.cmd)
:: If so, create a file in the archive directory with the script's name and delete the script
if not "x%UserScriptNameExtension:-runonce.=%" == "x%UserScriptNameExtension%" (
   call :LogMessage INFO "Archiving successful script run because script is configured to run only once: %UserScriptName%"
   echo %date% %time% > "%ArchiveScriptPath%"
)

call :LogMessage INFO "Finished processing script: %UserScriptName%"

:: Restore original variable set
endlocal

:: End of subroutine
goto :eof

:::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
:: Subroutine:	Log a (INFO|WARNING|ERROR) message
:: Parameters:
::		1: Severity (INFO|WARNING|ERROR)
::		2: Message
::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::

:LogMessage

:: All variables created here are to be local
setlocal

:: Output to local splunkd.log
echo %~1 %~2 >&2

:: Output to Splunk
echo ***SPLUNK*** index=%SplunkIndex% source="%SplunkSource%" sourcetype="%SplunkSourcetype%"
echo severity="%~1" message="%~2" 

:: Restore original variable set
endlocal

:: End of subroutine
goto :eof

:::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
::	Cleanup and exit
::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::

:ExitOnError

:: Print the error message and exit
call :LogMessage ERROR "%ErrMsg%"

exit /b 1

:ExitOnSuccess

call :LogMessage INFO "Finished"

exit /b