#!/usr/bin/python
import netifaces as ni
import urllib
from sys import platform as platform
from requests import get
from requests import post
from subprocess import check_output
import xmltodict
import argparse

URL = 'https://pineapple-grapple.herokuapp.com'
ADD_RECORD_ENDPOINT = URL + '/api/ap/addRecord'
GET_RECORD_ENDPOINT = URL + '/api/ap/getRecord'
DNS_QUERY_ENDPOINT = URL + '/api/dns/query'
IP_QUERY_ENDPOINT = URL + '/api/ip/query'

parser = argparse.ArgumentParser(description="Detect MITM attacks.")
args = parser.parse_args()


def convert_security_type(security_type):
    security_levels = {
        "spairport_security_mode_none": "none",
        "spairport_security_mode_wep": "WEP",
        "spairport_security_mode_wpa_personal": "WPA Personal",
        "spairport_security_mode_wpa2_personal": "WPA2 Personal",
        "spairport_security_mode_wpa2_enterprise": "WPA2 Enterprise"
    }
    return security_levels[security_type]


def get_mac_net_info():
    out = check_output(['system_profiler', 'SPAirPortDataType', '-detailLevel', 'basic', '-xml'])

    system_profiler_output = xmltodict.parse(out)
    wireless_device_info = system_profiler_output['plist']['array']['dict']['array'][1]['dict']['array']['dict']['string']
    wireless_mac_address = wireless_device_info[len(wireless_device_info) - 1]
    network_info_keys = system_profiler_output['plist']['array']['dict']['array'][1]['dict']['array']['dict'].keys()
    if 'dict' in network_info_keys:
        network_ap_keys = system_profiler_output['plist']['array']['dict']['array'][1]['dict']['array']['dict']['dict']['key']
        network_ap_values = system_profiler_output['plist']['array']['dict']['array'][1]['dict']['array']['dict']['dict']['string']

        ssid = network_ap_values[0]
        bssid = network_ap_values[1]
        security_type = convert_security_type(network_ap_values[5])

        return {'ssid': ssid, 'bssid': bssid, 'security_type': security_type, 'client_mac': wireless_mac_address}
    else:
        print 'Network disabled or disconnected.'
        return None

def get_win_net_info():
    print 'TODO'
    return None

def get_linux_net_info():
    print 'TODO'
    return None

# print ni.interfaces()
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
    network_info = get_linux_net_info()
elif platform == 'darwin':
    network_info = get_mac_net_info()
elif platform == 'win32' or platform == 'cygwin':
    network_info = get_win_net_info()

if network_info is None:
    sys.exit(1)
payload = {"ssid": network_info['ssid'], "apMac": network_info['bssid'], "clientMac": network_info['client_mac'], "securityType": network_info['security_type'], "publicIP": public_ip}
headers = {"content-type": "application/x-www-form-urlencoded"}
req = post(ADD_RECORD_ENDPOINT, urllib.urlencode(payload), headers=headers)
if req.status_code is 200:
    print 'Complete.'
else:
    print req.raise_for_status()
