#!/usr/bin/python
import urllib
from requests import get
from requests import post

URL = 'https://pagrapple.com'
# URL = 'http://localhost:9000'
ADD_RECORD_ENDPOINT = URL + '/api/ap/addRecord'
GET_RECORD_ENDPOINT = URL + '/api/ap/getRecord'
DNS_QUERY_ENDPOINT = URL + '/api/dns/query'
WHOIS_ENDPOINT = URL + '/api/dns/whois'
VALIDATE_ENDPOINT = URL + '/api/dns/validate'
GET_SOA_ENDPOINT = URL + '/api/dns/soa'
GET_SPF_ENDPOINT = URL + '/api/dns/spf'
GET_COMMON_DOMAINS_ENDPOINT = URL + '/api/dns/commonDomains'
IP_QUERY_ENDPOINT = URL + '/api/ip/query'
WIGLE_LOCATION_ENDPOINT = URL = '/api/ap/wigle/location'


class API(object):
    """docstring for API"""
    def __init__(self):
        pass

    def __str__(self):
        pass

    def get_record(self, bssid):
        get_record_payload = {"apMac": bssid}
        headers = {"content-type": "application/x-www-form-urlencoded"}
        get_record_req = post(GET_RECORD_ENDPOINT, urllib.urlencode(
            get_record_payload, True), headers=headers)
        if get_record_req.status_code is 200:
            ap_record = get_record_req.json()
            return ap_record
        else:
            return None

    def get_public_ip(self):
        public_ip = get("https://api.ipify.org").text
        return public_ip

    def get_spf(self, domain):
        get_spf_payload = {"domain": domain}
        headers = {"content-type": "application/x-www-form-urlencoded"}
        get_spf_req = post(GET_SPF_ENDPOINT, urllib.urlencode(
            get_spf_payload, True), headers=headers)
        return get_spf_req

    def get_wigle_location(self, bssid):
        get_wigle_location_payload = {"apMac": bssid}
        headers = {"content-type": 'application/x-www-form-urlencoded'}
        get_wigle_location_req = post(WIGLE_LOCATION_ENDPOINT, urllib.urlencode(
            get_wigle_location_payload, True), headers=headers)
        return get_wigle_location_req

    def add_record(self, ssid, bssid, client_mac, security_type, public_ip, hops):
        add_record_payload = {
            "ssid": ssid,
            "apMac": bssid,
            "clientMac": client_mac,
            "securityType": security_type,
            "publicIP": public_ip,
            "hops": hops
        }
        headers = {"content-type": "application/x-www-form-urlencoded"}
        add_record_req = post(ADD_RECORD_ENDPOINT, urllib.urlencode(
            add_record_payload, True), headers=headers)
        return add_record_req

    def dns_query(self, domain):
        dns_check_payload = {"domain": domain}
        headers = {"content-type": "application/x-www-form-urlencoded"}
        dns_check_req = post(DNS_QUERY_ENDPOINT, urllib.urlencode(
            dns_check_payload, True), headers=headers)
        return dns_check_req

    def reverse_ip(self, ip):
        reverse_ip_payload = {"ip": ip}
        headers = {"content-type": "application/x-www-form-urlencoded"}
        reverse_ip_req = post(WHOIS_ENDPOINT, urllib.urlencode(
            reverse_ip_payload, True), headers=headers)
        return reverse_ip_req

    def get_common_domains(self):
        get_common_domains_req = post(GET_COMMON_DOMAINS_ENDPOINT)
        return get_common_domains_req

    def validate_ips(self, domain, ips):
        validate_ips_payload = {"domain": domain, "ips": ips}
        headers = {"content-type": "application/x-www-form-urlencoded"}
        validate_ips_req = post(VALIDATE_ENDPOINT, urllib.urlencode(
            validate_ips_payload, True), headers=headers)
        return validate_ips_req

    def get_local_common_domains(self):
        return ["google.com", "chase.com", "wellsfargo.com", "bankofamerica.com", "facebook.com", "twitter.com", "amazon.com"]
