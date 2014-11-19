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
        ifconfig = Popen(['ifconfig','']).communicate()[0]
        iwconfig = Popen(['iwconfig','']).communicate()[0]
        iwlist_scan = Popen(['iwlist_scan','']).communicate()[0]
        return_value = self.getwifidata(ifconfig, iwconfig, iwlist_scan)
        logging.debug(return_value)
        return return_value

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

    # We'll use this function to grab the ESSID and the Wireless MAC address from iwconfig for all connected wifi devices!
    def getiwconfigdata(self, iwconfig):
        wifiList = {}
        # group 1 = interface
        # group 2 = ssid
        # group 3 = wireless MAC
        searchResults = re.findall('(\w*\d\d*).*ESSID:"(.*)".*\n.*Access Point: (..:..:..:..:..:..)', iwconfig, re.M | re.I)

        count = 0
        for result in searchResults:
            wifi = {}
            wifi['interface'] = result[0]
            wifi['ssid'] = result[1]
            wifi['wireless_mac'] = result[2]
            wifiList[count] = wifi
            count += 1

        return wifiList

    # We'll use this function to grab the Client MAC address from ifconfig for all connected wifi devices!
    def getifconfigdata(self, ifconfig, wifiList):
        for wifi in wifiList.keys():
            # group 1 = interface MAC
            searchResults = re.findall(wifiList[wifi]['interface'] + '.*HWaddr (..:..:..:..:..:..)', ifconfig, re.M | re.I)

            if len(searchResults) > 0:
                wifiList[wifi]['client_mac'] = searchResults[0]
            else:
                wifiList[wifi]['client_mac'] = None

        return wifiList

    # We'll use this function to grab the Encryption type from iwlist_scan for all connected wifi devices!
    def getiwlistscandata(self, iwlist_scan, wifiList):
        # group 0 = wireless mac
        # group 1 = encryption enabled --> 'on' for yes blank for off
        # group 2 = ssid
        # group 3 = encryption type 1
        # group 4 = encryption type 1 Extended (802.1x or PSK)
        # group 5 = encryption type 2
        # group 6 = encryption type 2 Extended (802.1x or PSK)
        searchResults = re.findall('Address: (..:..:..:..:..:..)\n'
                                   '(?:.*\n)*?'
                                   '\s*Encryption key:(on)*.*\n'
                                   '\s*ESSID:"(.*)"\n'
                                   '(?:.*\n)*?'
                                   '\s*Extra: .*\n'
                                   '(?:.*IE:.*\n)*?'
                                   '(?(2)(?:'  #IF encryption is on look for up to 2 possible encryption types:
                                   '.*IE:.*(WPA2|WPA|WEP).*\n\s*Group.*\n.*\n.*: (.*)\n'  #This one will always exist
                                   '(?:.*IE:.*\n)*?' #there may be a line separating them
                                   '(?:.*IE:.*(WPA2|WPA|WEP).*\n\s*Group.*\n.*\n.*: (.*)\n)?'  #This one may not exist
                                   '))',
                                   iwlist_scan,
                                   re.M | re.I)

        # we need to look through all the available wifis and find the one that matches our ssid and bssid
        for availableWifi in searchResults:
            for wifi in wifiList.keys():
                if wifiList[wifi]['wireless_mac'] == availableWifi[0] and wifiList[wifi]['ssid'] == availableWifi[2]:
                    if availableWifi[1] == 'on':
                        if (availableWifi[3] == 'WPA2' and availableWifi[4] == '802.1x') or \
                           (availableWifi[5] == 'WPA2' and availableWifi[6] == '802.1x'):
                            wifiList[wifi]['security_type'] = 'WPA2 Enterprise'
                        elif (availableWifi[3] == 'WPA2' and availableWifi[4] == 'PSK') or \
                             (availableWifi[5] == 'WPA2' and availableWifi[6] == 'PSK'):
                            wifiList[wifi]['security_type'] = 'WPA2 Personal'
                        elif (availableWifi[3] == 'WPA' and availableWifi[4] == '802.1x') or \
                           (availableWifi[5] == 'WPA' and availableWifi[6] == '802.1x'):
                            wifiList[wifi]['security_type'] = 'WPA Enterprise'
                        elif (availableWifi[3] == 'WPA' and availableWifi[4] == 'PSK') or \
                             (availableWifi[5] == 'WPA' and availableWifi[6] == 'PSK'):
                            wifiList[wifi]['security_type'] = 'WPA Personal'
                        elif availableWifi[3] == 'WEP' or availableWifi[5] == 'WEP':
                            wifiList[wifi]['security_type'] = 'WPA Personal'
                        else:
                            wifiList[wifi]['security_type'] = None
                            logging.debug('Security Type for ' + wifiList[wifi]['ssid'] + ' unknown')
                    else:
                        wifiList[wifi]['security_type'] = None

        return wifiList

    # there could be more than 1 wifi connected - I've added the optional parameter wifiNumber
    # if omitted we just grab the first one
    def getwifidata(self, ifconfig, iwconfig, iwlist_scan, wifiNumber=1):
        wifiList = self.getiwconfigdata(iwconfig)

        if len(wifiList) >= wifiNumber > 0:
            self.getifconfigdata(ifconfig, wifiList)
            self.getiwlistscandata(iwlist_scan, wifiList)

            ssid = wifiList[wifiNumber-1]['ssid']
            bssid = wifiList[wifiNumber-1]['wireless_mac']
            security_type = wifiList[wifiNumber-1]['security_type']
            wireless_mac_address = wifiList[wifiNumber-1]['client_mac']

            return {'ssid': ssid, 'bssid': bssid, 'security_type': security_type, 'client_mac': wireless_mac_address}

        else:
            logging.debug('No Wifi Data Found')
            return None