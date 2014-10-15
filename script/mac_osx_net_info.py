#!/usr/bin/python
from subprocess import check_output
import xmltodict


def convert_security_type(security_type):
    security_levels = {
        "spairport_security_mode_none": "none",
        "spairport_security_mode_wep": "WEP",
        "spairport_security_mode_wpa_personal": "WPA Personal",
        "spairport_security_mode_wpa2_personal": "WPA2 Personal",
        "spairport_security_mode_wpa2_enterprise": "WPA2 Enterprise"
    }
    return security_levels[security_type]

out = check_output(['system_profiler', 'SPAirPortDataType', '-detailLevel', 'basic', '-xml'])

system_profiler_output = xmltodict.parse(out)
network_info_keys = system_profiler_output['plist']['array']['dict']['array'][1]['dict']['array']['dict'].keys()
if 'dict' in network_info_keys:
    network_ap_keys = system_profiler_output['plist']['array']['dict']['array'][1]['dict']['array']['dict']['dict']['key']
    network_ap_values = system_profiler_output['plist']['array']['dict']['array'][1]['dict']['array']['dict']['dict']['string']

    ssid = network_ap_values[0]
    bssid = network_ap_values[1]
    security_type = convert_security_type(network_ap_values[5])

    print ssid
    print bssid
    print security_type
else:
    print 'Network disabled or disconnected.'
