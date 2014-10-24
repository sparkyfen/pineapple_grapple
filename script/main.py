#!/usr/bin/python
# Steps the script takes:
# 1. Get record of current connected AP.
# 2. Check security against the security on file.
# 3. Calculate first 3 hops.
# 4. DNS Lookups on known sites.
# 5. Validate cetificates for well known sites.
import netifaces as ni
import api
import logging
from sys import platform as platform
import argparse
import network_info
from operator import itemgetter
import json

parser = argparse.ArgumentParser(description='Detect MITM attacks.')
parser.add_argument('-v', '--verbose', help='Enable a more verbose output.')
args = parser.parse_args()

if args.verbose:
    logging.basicConfig(level=logging.DEBUG)

net_info = network_info.NetworkInfo()
api = api.API()

public_ip = api.get_public_ip()
logging.debug('public_ip: ' + public_ip)

if platform == 'linux' or platform == 'linux2':
    network_info = net_info.get_linux_net_info()
elif platform == 'darwin':
    network_info = net_info.get_mac_net_info()
elif platform == 'win32' or platform == 'cygwin':
    network_info = net_info.get_win_net_info()

if network_info is None:
    sys.exit(1)
ap_record = api.get_record(network_info['bssid'])
if ap_record is not None:
    if ap_record['securityType'] != network_info['security_type']:
        print 'Security types of known network are different.'
        print 'Current type is ' + network_info['security_type'] + ' and recorded type is ' + ap_record['securityType']
    elif ap_record['publicIP'] != public_ip:
        print 'Public IPs of known network are different.'
        print 'Current IP address is ' + public_ip + ' and recorded address is ' + ap_record['publicIP']
    else:
        hops = net_info.calculate_hops()
        hop_difference = []
        for x in hops:
            if x not in ap_record['hops']:
                hop_difference.append(x)
        if len(hop_difference) is not 0:
            print 'Traceroute hops are different.'
            print 'Current hops are ' + hops + ' and recorded hops are ' + ap_record['hops']
        else:
            dns_check_req = api.dns_query(net_info.get_common_domains())
            if dns_check_req.status_code is 200:
                # TODO Compare each domain with their addresses.
                address_list = dns_check_req.json()
                print json.dumps(address_list)
                local_address_list = net_info.lookup_domains()
                print json.dumps(local_address_list)
            else:
                print dns_check_req.json()['message']
                print dns_check_req.raise_for_status()
else:
    hops = net_info.calculate_hops()
    # TODO No record in DB so we need to do DNS lookups and cert validation.
    add_record_req = api.add_record(
        network_info['ssid'], network_info['bssid'],
        network_info['client_mac'],
        network_info['security_type'],
        public_ip, hops)
    if add_record_req.status_code is 200:
        print 'Complete.'
    else:
        print add_record_req.json()['message']
        print add_record_req.raise_for_status()
