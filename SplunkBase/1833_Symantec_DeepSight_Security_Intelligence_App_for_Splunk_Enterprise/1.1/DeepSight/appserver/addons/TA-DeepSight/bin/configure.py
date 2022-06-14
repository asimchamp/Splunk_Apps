import os, sys, platform

def clear_screen():
    if (curr_platform == "Windows"):
        os.system('cls')
    else:
        os.system('clear')

def createPathFile(filename,username,password):
    f = open(filename,'w')
    f.write('USERNAME=\'{0}\' \n'.format(username))
    f.write('PASSWORD=\'{0}\''.format(password))
    f.close()


if __name__ == '__main__':
    global curr_platform
    curr_platform = platform.system()
    clear_screen()
    print("==========================================================================")
    print("Welcome to the configuration utility for the Symantec DeepSight Security Intelligence App.")
    print("Please enter your DeepSight login information.")
    username = raw_input("Username: ")
    password = raw_input("Password: ")
    print("Thank you. This script will now configure the Splunk inputs appropriately.")
    print("==========================================================================")
    
    print("Creating Credentials File...")
    createPathFile("credentials",username,password)
