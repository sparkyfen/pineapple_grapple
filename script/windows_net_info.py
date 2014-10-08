"""
This script is designed for use in Windows systems.
It will do the following:
1. Execute the command "netsh wlan show interfaces" in the command prompt (cmd)
2. Store the ouput into the file netinfo.txt
3. Parse the gerenated 
"""

import subprocess


def get_net_info(x):
    return x.split(': ')[1].rstrip()


f = open("netinfo.txt", 'w')

#subprocess.Popen(['cmd.exe', '/c', 'netsh wlan show interfaces \> text.txt'])
p = subprocess.Popen(['cmd.exe', '/c', 'netsh wlan show interfaces'], stdout=f)
p.wait(100)

f.close()

network_info = ''
physical_addr = ''
ssid = ''
bssid = ''
authentication = ''

f2 = open("netinfo.txt", 'r')
for line in f2:
    line = line.upper().lstrip()
    #print(l2)
    if line.startswith("PHYSICAL ADDRESS"):
        network_info += line
        physical_addr = get_net_info(line)
    if line.startswith("SSID"):
        network_info += line
        ssid = get_net_info(line)
    if line.startswith("BSSID"):
        network_info += line
        bssid = get_net_info(line)
    if line.startswith("AUTHENTICATION"):
        network_info += line
        authentication = get_net_info(line)

f2.close()

print(network_info)
print()
print()
print("CLIENT MAC ADDRESS: " + physical_addr)
print("SSID: " + ssid)
print("BSSID: " + bssid)
print("AUTHENTICATION: " + authentication)




