__author__ = 'LesterP'
import re
import logging

# We'll use this function to grab the ESSID and the Wireless MAC address from iwconfig for all connected wifi devices!
def getiwconfigdata(iwconfig):
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
def getifconfigdata(ifconfig, wifiList):
    for wifi in wifiList.keys():
        # group 1 = interface MAC
        searchResults = re.findall(wifiList[wifi]['interface'] + '.*HWaddr (..:..:..:..:..:..)', ifconfig, re.M | re.I)

        if len(searchResults) > 0:
            wifiList[wifi]['client_mac'] = searchResults[0]
        else:
            wifiList[wifi]['client_mac'] = None

    return wifiList

# We'll use this function to grab the Encryption type from iwlist_scan for all connected wifi devices!
def getiwlistscandata(iwlist_scan, wifiList):
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
def getwifidata(ifconfig, iwconfig, iwlist_scan, wifiNumber=1):
    wifiList = getiwconfigdata(iwconfig)

    if len(wifiList) >= wifiNumber > 0:
        getifconfigdata(ifconfig, wifiList)
        getiwlistscandata(iwlist_scan, wifiList)

        ssid = wifiList[wifiNumber-1]['ssid']
        bssid = wifiList[wifiNumber-1]['wireless_mac']
        security_type = wifiList[wifiNumber-1]['security_type']
        wireless_mac_address = wifiList[wifiNumber-1]['client_mac']

        return {'ssid': ssid, 'bssid': bssid, 'security_type': security_type, 'client_mac': wireless_mac_address}

    else:
        logging.debug('No Wifi Data Found')
        return None

# print getwifidata(getFile('ifconfig.txt'), getFile('iwconfig.txt'), getFile('iwlist_scan.txt'))
