#!/usr/bin/python
import xmltodict
import logging
import socket
from subprocess import check_output, Popen, PIPE
import re
import api
from sys import platform as platform


class NetworkInfo(object):
    """Parses network information for a requested OS to retreive the
        SSID, BSSID, Security Type, Client Mac Address"""
    def __init__(self):
        self.icmp = socket.getprotobyname('icmp')
        self.udp = socket.getprotobyname('udp')
        self.api = api.API()
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
            security_types = self._get_security_types()
            security_type = None
            for index, ap_value in enumerate(network_ap_values):
                if ap_value in security_types:
                    security_type = self._convert_security_type(ap_value)
            if security_type is None:
                logging.error('Could not find security type in network information.')
                return None
            else:
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
        # Open a cmd process to execute cmd command.
        p1 = Popen(["cmd", "/C", "netsh wlan show interfaces"], stdout=PIPE)
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
                # Standardize Security type
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
        logging.debug(return_value)
        return return_value

    def get_linux_net_info(self):
        logging.error('TODO')
        return None

    def calculate_hops(self):
        if platform == 'linux' or platform == 'linux2':
            logging.error('TODO')
        elif platform == 'darwin':
            hops = self.get_mac_hops()
        elif platform == 'win32' or platform == 'cygwin':
            hops = self.get_win_hops()
        return hops

    def get_mac_hops(self):
        ttl = 1
        hops = []
        while ttl < 4:
            logging.debug('Start traceroute hop ' + str(ttl))
            recv_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, self.icmp)
            send_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, self.udp)
            send_socket.setsockopt(socket.SOL_IP, socket.IP_TTL, ttl)
            recv_socket.bind(("", 33434))
            send_socket.sendto("", ('8.8.8.8', 33434))
            curr_addr = None
            curr_name = None
            try:
                # socket.recvfrom() gives back (data, address), but we
                # only care about the latter.
                _, curr_addr = recv_socket.recvfrom(512)
                curr_addr = curr_addr[0]  # address is given as tuple
                try:
                    curr_name = socket.gethostbyaddr(curr_addr)[0]
                except socket.error:
                    curr_name = curr_addr
            except socket.error:
                pass
            finally:
                send_socket.close()
                recv_socket.close()
            if curr_addr is not None:
                curr_host = curr_addr
            else:
                curr_host = None
            ttl += 1
            hops.append(curr_host)
        return hops

    def get_win_hops(self):
        # Open a cmd process to execute cmd command.
        max_hops = 3
        p1 = Popen(["cmd", "/C", "tracert -d -h " + str(max_hops) + "  8.8.8.8"], stdout=PIPE)
        raw_tracert_info = p1.communicate()[0]

        # split ouput from netsh command into array of individual lines.
        str_array = raw_tracert_info.splitlines()[3:3+max_hops]

        hops = []
        for line in str_array:
            curr_host = None
            re_pattern = re.compile("\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}")
            re_matches = re_pattern.search(line)
            if re_matches is not None:
                curr_host = re_matches.group(0)
            hops.append(curr_host)

        return hops

    def lookup_domains(self):
        domains_req = self.api.get_common_domains()
        domains = domains_req.json()
        address_list = []
        for domain in domains:
            addr_info = socket.gethostbyname_ex(domain)
            address_info_list = addr_info[2]
            address_list.append({"domain": domain, "addresses": address_info_list})
        return address_list

    def _get_security_types(self):
        return {
            "spairport_security_mode_none": "none",
            "spairport_security_mode_wep": "WEP",
            "spairport_security_mode_wpa_personal": "WPA Personal",
            "spairport_security_mode_wpa2_personal": "WPA2 Personal",
            "spairport_security_mode_wpa2_enterprise": "WPA2 Enterprise"
        }

    def _convert_security_type(self, security_type):
        security_levels = self._get_security_types()
        return security_levels[security_type]
