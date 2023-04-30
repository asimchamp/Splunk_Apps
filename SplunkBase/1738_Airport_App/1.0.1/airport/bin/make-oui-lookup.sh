#!/bin/sh

# download oui.txt and make a new lookup:

# curl the file down 
curl --silent -o oui.txt http://standards.ieee.org/develop/regauth/oui/oui.txt

# make a header row:
echo "src_mac_prefix,src_mac_vendor" > airport-mac-vendorname.csv

# chop it down to the stuff we need
grep "base 16" oui.txt | awk '{printf("%s:%s:%s\n",tolower(substr($1,1,2)),tolower(substr($1,3,2)),tolower(substr($1,5,2)))};{print",",substr($0,index($0,$4))}' | sed 'N;s/\n/ /' | sed 's/ , /,/' >> airport-mac-vendorname.csv  

# add a catchall
echo "*,UNKNOWN" >> airport-mac-vendorname.csv

