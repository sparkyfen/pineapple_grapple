#!/usr/bin/python
import xmltodict
import logging
from subprocess import check_output


class NetworkInfo(object):
    """Parses network information for a requested OS to retreive the
        SSID, BSSID, Security Type, Client Mac Address"""
    def __init__(self):
        pass

    def __str__(self):
        pass

    def get_mac_net_info(self):
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
            security_type = self._convert_security_type(network_ap_values[5])

            return {
                'ssid': ssid,
                'bssid': bssid,
                'security_type': security_type,
                'client_mac': wireless_mac_address
            }
        else:
            logging.error('Network disabled or disconnected.')
            return None

    def get_win_net_info(self):
        logging.error('TODO')
        return None

    def get_linux_net_info(self):
        logging.error('TODO')
        return None

    def _convert_security_type(self, security_type):
        security_levels = {
            "spairport_security_mode_none": "none",
            "spairport_security_mode_wep": "WEP",
            "spairport_security_mode_wpa_personal": "WPA Personal",
            "spairport_security_mode_wpa2_personal": "WPA2 Personal",
            "spairport_security_mode_wpa2_enterprise": "WPA2 Enterprise"
        }
        return security_levels[security_type]
