#!/usr/bin/python
import netifaces as ni
import urllib
import logging
from sys import platform as platform
from requests import get
from requests import post
import argparse
import network_info

URL = 'https://pineapple-grapple.herokuapp.com'
ADD_RECORD_ENDPOINT = URL + '/api/ap/addRecord'
GET_RECORD_ENDPOINT = URL + '/api/ap/getRecord'
DNS_QUERY_ENDPOINT = URL + '/api/dns/query'
IP_QUERY_ENDPOINT = URL + '/api/ip/query'

parser = argparse.ArgumentParser(description='Detect MITM attacks.')
parser.add_argument('-v', '--verbose', help='Enable a more verbose output.')
args = parser.parse_args()

if args.verbose:
    logging.basicConfig(level=logging.DEBUG)

net_info = network_info.NetworkInfo()

for interface in ni.interfaces():
    if interface == "lo0":
        continue
    addrs = ni.ifaddresses(interface)
    if ni.AF_INET in addrs:
        mac_address = addrs[ni.AF_LINK][0]["addr"]
        internal_address = addrs[ni.AF_INET][0]["addr"]
        broadcast_address = addrs[ni.AF_INET][0]["broadcast"]
        subnet_mask = addrs[ni.AF_INET][0]["netmask"]
        print 'mac_address', mac_address
        print 'internal_address', internal_address
        print 'broadcast_address', broadcast_address
        print 'subnet_mask', subnet_mask
        print 'interface', interface
        print "\n"

# TODO Switch this to SSL when the new certificate is in place.
# https://github.com/rdegges/ipify-api/issues/1
public_ip = get("http://api.ipify.org").text
print 'public_ip', public_ip

if platform == 'linux' or platform == 'linux2':
    network_info = net_info.get_linux_net_info()
elif platform == 'darwin':
    network_info = net_info.get_mac_net_info()
elif platform == 'win32' or platform == 'cygwin':
    network_info = net_info.get_win_net_info()

if network_info is None:
    sys.exit(1)
payload = {"ssid": network_info['ssid'], "apMac": network_info['bssid'], "clientMac": network_info['client_mac'], "securityType": network_info['security_type'], "publicIP": public_ip}
headers = {"content-type": "application/x-www-form-urlencoded"}
req = post(ADD_RECORD_ENDPOINT, urllib.urlencode(payload), headers=headers)
if req.status_code is 200:
    print 'Complete.'
else:
    print req.raise_for_status()
