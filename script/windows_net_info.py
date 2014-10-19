#!/usr/bin/python
"""
This script is designed for use in Windows systems.
It will do the following:
1. Execute the command "netsh wlan show interfaces" in the command prompt (cmd)
2. Retrieve the output
3. Parse the gerenated output and return an object containing information regarding the network the device is connected to.
"""

import subprocess

def myFunction():
    # Open a cmd process to execute cmd command.
    p1 = subprocess.Popen(["cmd", "/C", "netsh wlan show interfaces"], stdout=subprocess.PIPE)
    raw_network_info = p1.communicate()[0]

    # split ouput from netsh command into array of individual lines.
    str_array = raw_network_info.splitlines()

    client_mac = ''
    ssid = ''
    bssid = ''
    security_type = ''

    # Loop through each line of output. Extract relevant data
    for line in str_array:
        line = line.lower().lstrip()
        if line.startswith("physical address"):
            client_mac = line.split(': ')[1].rstrip()
        if line.startswith("ssid"):
            ssid = line.split(': ')[1].rstrip()
        if line.startswith("bssid"):
            bssid = line.split(': ')[1].rstrip()
        if line.startswith("authentication"):
            security_type = line.split(': ')[1].rstrip()
            #Standardize Security type
            if security_type == 'wpa2-enterprise':
                security_type = 'WPA2 Enterprise'
            elif security_type == 'wpa2-personal':
                security_type = 'WPA2 Personal'
            elif security_type == 'wpa-enterprise':
                security_type = 'WPA Enterprise'
            elif security_type == 'wpa-personal':
                security_type = 'WPA Personal'
            elif security_type == 'wep':
                security_type = 'WEP'
            elif security_type == 'open':
                security_type = 'None'

    return_value = {'ssid': ssid, 'bssid': bssid, 'security_type': security_type, 'client_mac': client_mac}
    #if (Verbose_Output):
        #print(return_value)
    return return_value

print(myFunction())
