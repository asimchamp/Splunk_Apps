#All of these commands can be found and referenced on http://www.pool.ntp.org/en/use.html


#Windows 2003 and newer, use this script.  

w32tm /config /syncfromflags:manual /manualpeerlist:0.pool.ntp.org,1.pool.ntp.org,2.pool.ntp.org,3.pool.ntp.org


#older than windows 2003, uncomment this command:
#net time /setsntp:"0.pool.ntp.org 1.pool.ntp.org 2.pool.ntp.org"
