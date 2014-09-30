#!/usr/bin/python
import netifaces as ni
import urllib
from requests import get
from requests import post
import argparse

URL = 'https://pineapple-grapple.herokuapp.com'
ADD_RECORD_ENDPOINT = URL + '/api/ap/addRecord'
GET_RECORD_ENDPOINT = URL + '/api/ap/getRecord'
DNS_QUERY_ENDPOINT = URL + '/api/dns/query'
IP_QUERY_ENDPOINT = URL + '/api/ip/query'

parser = argparse.ArgumentParser(description="Detect MITM attacks.")
args = parser.parse_args()

# print ni.interfaces()
for interface in ni.interfaces():
    if interface == "lo0":
        continue
    addrs = ni.ifaddresses(interface)
    if ni.AF_INET in addrs:
        mac_address = addrs[ni.AF_LINK]
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
# TODO Get the SSID and access point MAC address that the client is connected to.
# payload = {"ssid": "", "apMac": "", "clientMac": mac_address}
# headers = {"content-type": "application/x-www-form-urlencoded"}
# post(ADD_RECORD_ENDPOINT, urllib.urlencode(payload), headers=headers)
