#!/usr/bin/python
import dns.resolver
import re
import api
from requests import post
from netaddr import IPNetwork, IPAddress


class Lookup(object):
    """docstring for Lookup"""
    def __init__(self):
        self.api = api.API()
        pass

    def __str__(self):
        pass

    def get_soa_origin(self, domain):
        answers = dns.resolver.query(domain, 'SOA')
        for rdata in answers:
            soa_record = rdata.to_text()
            return soa_record.split('. ')[0]

    def get_local_spf(self, domain):
        RE_MODIFIER = re.compile(r'^([a-zA-Z]+)=')
        RESULTS = {'+': 'pass', '-': 'deny', '?': 'unknown', 'pass': 'pass', 'deny': 'deny', 'unknown': 'unknown'}
        resolver = dns.resolver.Resolver()
        soa = self.get_soa_origin(domain)
        resolver.nameservers = [soa]
        dns.resolver.override_system_resolver(resolver)
        answers = dns.resolver.query(domain, 'TXT')
        for rdata in answers:
            spf_record = rdata.to_text()
            return spf_record

    def get_spf(self, domain):
        return self.api.get_spf(domain)

    def get_ip_networks(self, spf_record):
        ip_network_list = []
        spf_record_list = spf_record.split(' ')[1:]
        if len(spf_record_list) is 0:
            return []
        print spf_record
        spf_record_list[len(spf_record_list) - 1] = spf_record_list[len(
            spf_record_list) - 1][0:-1]
        for spf_record in spf_record_list:
            if 'include' in spf_record:
                # TODO Recursively call the resolver on these to get their IP networks.
                print 'INCLUDE', spf_record.split('include:')[1]
            elif 'redirect' in spf_record:
                # TODO Recursively call the resolver on these to get their IP networks.
                print 'REDIRECT', spf_record.split('redirect=')[1]
            elif 'ip4' in spf_record:
                ip_network = spf_record.split('ip4:')[1]
                ip_network_list.append(ip_network)
            elif '~all' in spf_record or '-all' in spf_record or '+all' in spf_record:
                continue
        return ip_network_list
