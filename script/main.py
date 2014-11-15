#!/usr/bin/python
import netifaces as ni
import api
import logging
from sys import platform as platform
import argparse
import network_info
from operator import itemgetter
import json
import sys
from netaddr import IPAddress
from colorama import init
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
ENDC = '\033[0m'
init()

# Arg parse
parser = argparse.ArgumentParser(description='Detect MITM attacks.')
parser.add_argument('-v', '--verbose', action='store_true', help='Enable a more verbose output.')
args = parser.parse_args()

# Enable verbosity
if args.verbose:
    logging.basicConfig(level=logging.DEBUG)

print r'''

                                               .NN,
                                    .cxxdl'    xMMO    'cdxxl'
                                      .c0WMNk;,NMMW:,xXMMKo.
                                      ...:KMMMWMMMMWMMMXc...           .
                         ,        .l0NMMMNXMMMMMMMMMMMMXNMMMWKl'      xWd
                       ,0Wd         .':xNMMMMMMMMMMMMMMMMNkc'.        ;KM0'
                      lWMo            .;dNMMMMMMMMMMMMMMWx:.      .l.   dMWc
                     :WWo   oNd   .;xKWMMMMMMMMMMMMMMMMMMMMWXx:.  dWX:   dMW;
                    ,NWo   oMW:   .. ..,lOXWMMMMMMMMMMWN0o;.. ..   cWMl   dMN'
                   .XMx   oWN;   lc     .loooolcooclooool.    cXl   oMWc   kMK.
                   oMW'  ,WMl   cMW:   lWMW0d:;cdd:;:o0WMWl   lMW:   OMW'  ,WMl
                   0M0   xMX.  .XMd   .lo:.,dXMMMMMMXd,.:ol.   kMK.  'NMd   KMO
                   NMd   KMk   lMN.  .;:xOxollccddcclloxOx:;.  'WM:   OM0   xMX
                   WMo  .XMx   dMK   oNMMMMWOc;;ol;;cOWMMMMNo  .XMl   kMK   dMN
                   NMx   0MO   :Kd. .lllcl;.:0WMMMMW0:.;lclll. .xK;   0MO   kMX
                                   .:W0;,oxl:::oOOo:::lxo,;0W:   _   .ONo   KMk
                                   ;cKMMMMWk:.;,.;kWMMMMKc;.               .OX:
   ___ _                              _          ___                       _
  / _ (_)_ __   ___  __ _ _ __  _ __ | | ___    / _ \_ __ __ _ _ __  _ __ | | ___
 / /_)/ | '_ \ / _ \/ _` | '_ \| '_ \| |/ _ \  / /_\/ '__/ _` | '_ \| '_ \| |/ _ \
/ ___/| | | | |  __/ (_| | |_) | |_) | |  __/ / /_\\| | | (_| | |_) | |_) | |  __/
\/    |_|_| |_|\___|\__,_| .__/| .__/|_|\___| \____/|_|  \__,_| .__/| .__/|_|\___|
                         |_|   |_|                            |_|   |_|

'''

print RED + 'This is a proof of concept application. We are not responsible for any harm that may come from you or your computing devices by connecting to a network or using this software.' + ENDC

# Initialize constructors
net_info = network_info.NetworkInfo()
api = api.API()

# Get public IP address.
print 'Determining public IP address.'
public_ip = api.get_public_ip()
logging.debug(GREEN + 'public_ip: ' + public_ip + ENDC)

# Get network information depending on the Operating Systems
print 'Determining access point information.'
if platform == 'linux' or platform == 'linux2':
    network_info = net_info.get_linux_net_info()
elif platform == 'darwin':
    network_info = net_info.get_mac_net_info()
elif platform == 'win32' or platform == 'cygwin':
    network_info = net_info.get_win_net_info()

# If we don't have any network information, we just exit out,
# we showed an error when we checked for the network information.
if network_info is None:
    sys.exit(1)

# Calculate Traceroute hops to 8.8.8.8
print 'Calculating traceroute hops.'
hops = net_info.calculate_hops()
router_ip = hops[0]

# Validate DNS records to check for DNS spoofing
print 'Calculating DNS records.'
address_list = net_info.lookup_domains()

# Get the record from the database.
print 'Requested known access point record.'
ap_record = api.get_record(network_info['bssid'])
if ap_record is not None:
    print GREEN + 'Record found.' + ENDC
    # Checking security type against the record
    print 'Checking security type against record.'
    if ap_record['securityType'] != network_info['security_type']:
        # TODO Weight here
        print RED + 'Security type of known network is different.' + ENDC
        print RED + 'Current type is ' + network_info['security_type'] + ' and recorded type is ' + ap_record['securityType'] + ENDC
    # Checking SSID against the record
    print 'Checking SSID against record.'
    if ap_record['ssid'] != network_info['ssid']:
        # TODO Weight here
        print RED + 'ESSID of known network is different.' + ENDC
        print RED + 'Current ESSID is ' + network_info['ssid'] + ' and the recorded type is ' + ap_record['ssid'] + ENDC
    # Check the public IP address against the records
    print 'Checking public IP address against records'
    for public_ip_record in ap_record['publicIP']:
        if public_ip_record != public_ip:
            # TODO Weight here
            print RED + 'Public IPs of the known network are different.' + ENDC
            print RED + 'Current IP address is ' + public_ip + ' and recorded address that differs is ' + public_ip_record + ENDC
            # Check if IP address is listed under a known U.S. wireless carrier
            print 'Checking public IP address to see if listed under a known U.S. wireless carrier'
            reverse_ip_lookup_req = api.reverse_ip(public_ip)
            reverse_ip_lookup = reverse_ip_lookup_req.json()
            if(reverse_ip_lookup['isWirelessProvider']):
                # TODO Weight here
                print RED + 'Current IP address owner is ' + reverse_ip_lookup['org'] + ' and they ARE a US cellphone wireless provider.' + ENDC
                print RED + 'This connection could potentially be routed through a 3g/4g SIM card.' + ENDC
            else:
                print YELLOW + 'Current IP address owner is ' + reverse_ip_lookup['org'] + ' and they are not a US cellphone wireless provider.' + ENDC
    # Check traceroute hops against the records
    print 'Checking traceroute hops against records'
    hop_difference = []
    for record_hops in ap_record['hops']:
        for x in hops:
            if x not in record_hops:
                hop_difference.append(x)
            if len(hop_difference) is not 0:
                # TODO Weight here
                print RED + 'Traceroute hops are different.' + ENDC
                print RED + 'Current hops are ' + ','.join(hops) + ' and recorded hops are ' + ','.join(record_hops) + ENDC
    # Checking DNS results with server.
    print 'Checking DNS results with server.'
    for address_dict in address_list:
        logging.debug('Checking domain: ' + address_dict["domain"])
        logging.debug('IP addresses being checked: ' + ','.join(address_dict["addresses"]))

        validate_ips_req = api.validate_ips(address_dict["domain"], address_dict["addresses"])
        if validate_ips_req.status_code is not 200:
            # TODO Weight here
            print RED + validate_ips.json()["message"] + ENDC
else:
    # No record in database, check Wigle
    print YELLOW + 'No record in database, checking Wigle.net for a secondary record.' + ENDC
    get_wigle_location_req = api.get_wigle_location(network_info['bssid'])
    wigle_location = get_wigle_location_req.json()
    logging.debug('Wigle Data:')
    logging.debug(wigle_location)
    if get_wigle_location_req.status_code is 200:
        # We have a Wigle record, check the SSID and security type.
        if network_info['ssid'] != wigle_location['ssid']:
            # TODO Weight here
            print RED + 'ESSID of known network is different.' + ENDC
            print RED + 'Current ESSID is ' + network_info['ssid'] + ' and the recorded type is ' + ap_record['ssid'] + ENDC
        if network_info['security_type'] != wigle_location['securityType']:
            # TODO Weight here
            print RED + 'Security type of known network is different.' + ENDC
            print RED + 'Current type is ' + network_info['security_type'] + ' and recorded type is ' + ap_record['securityType'] + ENDC
    else:
        # We don't have a Wigle record
        # TODO Weight here
        print YELLOW + get_wigle_location_req.json()['message'] + ENDC
    # Checking DNS results with server.
    print 'Checking DNS results with server.'
    for address_dict in address_list:
        logging.debug('Checking domain: ' + address_dict["domain"])
        logging.debug('IP addresses being checked: ' + ','.join(address_dict["addresses"]))

        validate_ips_req = api.validate_ips(address_dict["domain"], address_dict["addresses"])
        if validate_ips_req.status_code is not 200:
            # TODO Weight here
            print RED + validate_ips_req.json()["message"] + ENDC
    print 'Checking public IP address to see if listed under a known U.S. wireless carrier'
    reverse_ip_lookup_req = api.reverse_ip(public_ip)
    reverse_ip_lookup = reverse_ip_lookup_req.json()
    if reverse_ip_lookup['isWirelessProvider']:
        # TODO Weight here
        print RED + 'Current IP address owner is ' + reverse_ip_lookup['org'] + ' and they ARE a US cellphone wireless provider.' + ENDC
        print RED + 'This connection could potentially be routed through a 3g/4g SIM card.' + ENDC
    else:
        print YELLOW + 'Current IP address owner is ' + reverse_ip_lookup['org'] + ' and they are not a US cellphone wireless provider.' + ENDC
    if router_ip is '172.16.42.1':
        # TODO Weight here
        print YELLOW + 'Router IP address is a known default IP address of a Wi-Fi Pineapple.' + ENDC
print 'Adding record into database.'
add_record_req = api.add_record(
    network_info['ssid'], network_info['bssid'],
    network_info['client_mac'],
    network_info['security_type'],
    public_ip, hops)
if add_record_req.status_code is 200:
    print add_record_req.json()['message']
    print 'Complete.'
else:
    print RED + add_record_req.json()['message'] + ENDC
