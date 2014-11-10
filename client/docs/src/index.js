/**
 * @apiDefinePermission public This information is publicly accessible.
 * No authentication is required.
 *
 * @apiVersion 1.0.0
 */

/**
 * @api {post} /api/dns/query Query
 * @apiVersion 1.0.0
 * @apiName Query
 * @apiGroup DNS
 * @apiPermission public
 *
 * @apiDescription Queries the IPv4 addresses of a given domain.
 *
 * @apiParam {String[]} domain The FQDN to query.
 *
 * @apiExample CURL example:
 *      curl -X POST 'https://pagrapple.com/api/dns/query' -d 'domain=google.com'
 *
 * @apiSuccess {Array} domainList The records for the requested domains.
 * @apiSuccess {Array} domainList.addresses The list of IPv4 addresses for the requested domain.
 * @apiSuccess {String} domainList.domain The domain requested.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [{"domain": "google.com", addresses: ["74.125.228.103","74.125.228.104","74.125.228.105","74.125.228.110","74.125.228.96","74.125.228.97","74.125.228.98","74.125.228.99","74.125.228.100","74.125.228.101","74.125.228.102"]}]
 *
 * @apiError (Bad Request 400) MissingDomains The domain(s) was not in the request.
 * @apiError (Bad Request 400) InvalidDomain The domain is not a valid domain.
 * @apiError (Internal Server Error 500) ServerError There was an issue on the server serving the request.
 *
 * @apiErrorExample Error-Response (Missing Domain(s))
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Missing domain(s)."}
 *
 * @apiErrorExample Error-Response (Invalid Domain)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid domain."}
 *
 * @apiErrorExample Error-Response (Invalid Domain(s))
 *     HTTP/1.1 400 Bad Request
 *    {"message": "One or more domains is invalid."}
 *
 * @apiErrorExample Error-Response (Internal Server Error)
 *     HTTP/1.1 500 Internal Server Error
 *     {"message":"Could not lookup the requested domain."}
 *
 */

/**
 * @api {post} /api/dns/spf SPF
 * @apiVersion 1.0.0
 * @apiName SPF
 * @apiGroup DNS
 * @apiPermission public
 *
 * @apiDescription Queries the requested domain and returns the SPF.
 *
 * @apiParam {String} domain The FQDN to query.
 *
 * @apiExample CURL example:
 *      curl -X POST 'https://pagrapple.com/api/dns/query' -d 'domain=google.com'
 *
 * @apiSuccess {String} spf The SPF of the requested domain.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {"spf":"v=spf1 include:_spf.google.com ip4:216.73.93.70/31 ip4:216.73.93.72/31 ~all"}
 *
 * @apiError (Bad Request 400) MissingDomains The domain(s) was not in the request.
 * @apiError (Bad Request 400) InvalidDomain The domain is not a valid domain.
 * @apiError (Internal Server Error 500) ServerError There was an issue on the server serving the request.
 *
 * @apiErrorExample Error-Response (Missing Domain(s))
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Missing domain from request."}
 *
 * @apiErrorExample Error-Response (Invalid Domain)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid domain in request."}
 *
 * @apiErrorExample Error-Response (Invalid Domain(s))
 *     HTTP/1.1 400 Bad Request
 *    {"message": "One or more domains is invalid."}
 *
 * @apiErrorExample Error-Response (Internal Server Error)
 *     HTTP/1.1 500 Internal Server Error
 *     {"message":"An error occured querying the DNS record."}
 *
 */


/**
 * @api {post} /api/dns/soa SOA
 * @apiVersion 1.0.0
 * @apiName SOA
 * @apiGroup DNS
 * @apiPermission public
 *
 * @apiDescription Queries the requested domain and returns the SOA.
 *
 * @apiParam {String} domain The FQDN to query.
 *
 * @apiExample CURL example:
 *      curl -X POST 'https://pagrapple.com/api/dns/query' -d 'domain=google.com'
 *
 * @apiSuccess {String} name The domain name.
 * @apiSuccess {Number} type The domain type.
 * @apiSuccess {Number} class The domain class.
 * @apiSuccess {Number} ttl The request TTL.
 * @apiSuccess {String} primary The primary authoritative nameserver for the domain.
 * @apiSuccess {String} admin The administrative domain.
 * @apiSuccess {Number} serial The revision number of this zone file
 * @apiSuccess {Number} refresh The time, in seconds, a secondary DNS server waits before querying the primary DNS server's SOA record to check for changes.
 * @apiSuccess {Number} retry The time, in seconds, a secondary server waits before retrying a failed zone transfer. Normally, the retry time is less than the refresh time. The default value is 600.
 * @apiSuccess {Number} expiration The time, in seconds, that a secondary server will keep trying to complete a zone transfer. If this time expires prior to a successful zone transfer, the secondary server will expire its zone file. The default value is 86,400.
 * @apiSuccess {Number} minimum The minimum time-to-live value applies to all resource records in the zone file. The default value is 3,600.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {"name":"google.com","type":6,"class":1,"ttl":21599,"primary":"ns1.google.com","admin":"dns-admin.google.com","serial":2014101500,"refresh":7200,"retry":1800,"expiration":1209600,"minimum":300}
 *
 * @apiError (Bad Request 400) MissingDomains The domain(s) was not in the request.
 * @apiError (Bad Request 400) InvalidDomain The domain is not a valid domain.
 * @apiError (Internal Server Error 500) DNSTimedOut The DNS request timed out.
 * @apiError (Internal Server Error 500) ServerError There was an issue on the server serving the request.
 *
 * @apiErrorExample Error-Response (Missing Domain(s))
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Missing domain from request."}
 *
 * @apiErrorExample Error-Response (Invalid Domain)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid domain in request."}
 *
 * @apiErrorExample Error-Response (Invalid Domain(s))
 *     HTTP/1.1 400 Bad Request
 *    {"message": "One or more domains is invalid."}
 *
 * @apiErrorExample Error-Response (DNS Request Timed Out)
 *     HTTP/1.1 500 Internal Server Error
 *     {"message":"DNS request timed out."}
 *
 * @apiErrorExample Error-Response (Internal Server Error)
 *     HTTP/1.1 500 Internal Server Error
 *     {"message":"An error occured querying the DNS record."}
 */

/**
 * @api {post} /api/dns/commonDomains CommonDomains
 * @apiVersion 1.0.0
 * @apiName CommonDomains
 * @apiGroup DNS
 * @apiPermission public
 *
 * @apiDescription Returns a list of common domains used to check for MITM attacks.
 *
 * @apiExample CURL example:
 *      curl -X POST 'https://pagrapple.com/api/dns/commonDomains'
 *
 * @apiSuccess {String[]} domains The list of common domains.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     ["google.com", "chase.com", "wellsfargo.com", "bankofamerica.com", "facebook.com", "twitter.com", "amazon.com"]
 *
 */

/**
 * @api {post} /api/dns/validate Validate
 * @apiVersion 1.0.0
 * @apiName Validate
 * @apiGroup DNS
 * @apiPermission public
 *
 * @apiDescription Validates the requested IP addresses with the given domain.
 *
 * @apiParam {String} domain The FQDN validate against.
 * @apiParam {String[]} ips The list of one or more IP addresses.
 *
 * @apiExample CURL example:
 *      curl -X POST 'https://pagrapple.com/api/dns/validate' -d 'domain=google.com&ips=208.117.233.84'
 *
 * @apiSuccess {String} message The successful message response.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {"message":"IP address(es) is/are valid."}
 *
 * @apiError (Bad Request 400) MissingDomain The domain was not in the request.
 * @apiError (Bad Request 400) MissingIPAddressList The list of IP addresses was not in the request.
 * @apiError (Bad Request 400) InvalidIPListType The list of IP addresses must be a string of one of an array of more than one.
 * @apiError (Bad Request 400) TooManyIPs The list of IP addresses is longer than 50.
 * @apiError (Bad Request 400) InvalidDomain The domain is not a valid domain.
 * @apiError (Bad Request 400) InvalidIPs One of more IP addresses was not a valid IP v4 address.
 * @apiError (Bad Request 400) PrivateOrLoopbackIP One of more IP addresses was either a private IP address or a loopback address.
 * @apiError (Bad Request 400) IPNotInRange One of more IP addresses was not in the range found for the requested domain.
 * @apiError (Bad Request 400) DomainNotInList The requested domain is not on the allowed list.
 * @apiError (Bad Request 400) DomainNetworkOwnerMismatch The requested domain and the domain owner found do not match what was expected.
 * @apiError (Internal Server Error 500) ServerError There was an issue on the server serving the request.
 *
 * @apiErrorExample Error-Response (Missing Domain)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Missing domain name."}
 *
 * @apiErrorExample Error-Response (Missing IP Address List)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Missing IP address list."}
 *
 * @apiErrorExample Error-Response (Invalid Domain)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid domain name."}
 *
 * @apiErrorExample Error-Response (Invalid IP List Type)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"IP addresses must be a list or string."}
 *
 * @apiErrorExample Error-Response (Too Many IPs)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Too many IP addresses to check."}
 *
 * @apiErrorExample Error-Response (Invalid IPs)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"One or more IP addresses was invalid."}
 *
 * @apiErrorExample Error-Response (Private Or Loopback IP)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"One or more IP addresses requested is a private/loopback IP address."}
 *
 * @apiErrorExample Error-Response (IP Not In Range)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"One IP address was not in the list of ip ranges allowed."}
 *
 * @apiErrorExample Error-Response (Domain Not In List)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"The requested domain is not in the allowed list."}
 *
 * @apiErrorExample Error-Response (Domain Network Owner Mismatch)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"The domain and network owner do not match."}
 *
 * @apiErrorExample Error-Response (Internal Server Error)
 *     HTTP/1.1 500 Internal Server Error
 *     {"message":"Issue validating IP addresses."}
 *
 */

/**
 * @api {post} /api/ip/query Query
 * @apiVersion 1.0.0
 * @apiName Query
 * @apiGroup IP
 * @apiPermission public
 *
 * @apiDescription Queries the domain of a given IPv4 address.
 *
 * @apiParam {String} ip The IP v4 address.
 *
 * @apiExample CURL example:
 *      curl -X POST 'https://pagrapple.com/api/ip/query' -d 'ip=74.125.228.103'
 *
 * @apiSuccess {String[]} Domains The list of domains for a requested IPv4 address.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     ["lax02s19-in-f6.1e100.net"]
 *
 * @apiError (Bad Request 400) MissingIP The IP address was not in the request.
 * @apiError (Bad Request 400) InvalidIP The IP address is not a valid IP address.
 * @apiError (Internal Server Error 500) ServerError There was an issue on the server serving the request.
 *
 * @apiErrorExample Error-Response (Missing IP(s))
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Missing IP address(es)."}
 *
 * @apiErrorExample Error-Response (Invalid IP)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid IP v4 address."}
 *
 * @apiErrorExample Error-Response (Invalid IP(s))
 *     HTTP/1.1 400 Bad Request
 *    {"message": "One or more IP addresses is invalid."}
 *
 * @apiErrorExample Error-Response (Internal Server Error)
 *     HTTP/1.1 500 Internal Server Error
 *     {"message":"Could not lookup the requested IP address."}
 *
 */

/**
 * @api {post} /api/ap/addRecord AddRecord
 * @apiVersion 1.0.0
 * @apiName AddRecord
 * @apiGroup AP
 * @apiPermission public
 *
 * @apiDescription Adds an access point record to the database.
 *
 * @apiParam {String} ssid The SSID of the access point.
 * @apiParam {String} apMac The access point MAC address.
 * @apiParam {String} clientMac The client MAC address.
 * @apiParam {String} securityType The type of access point security.
 * @apiParam {String} publicIP The public IP of the client.
 * @apiParam {String[]} hops The traceroute list of IPs to 8.8.8.8.
 *
 * @apiExample CURL example:
 *      curl -X POST 'https://pagrapple.com/api/ap/addRecord' -d 'ssid=foobar&apMac=xx:xx:xx:xx:xx:xx&clientMac=xx:xx:xx:xx:xx:xx&securityType=WPA2%20Personal&publicIP=xxx.xxx.xxx.xxx&hops=xxx.xxx.xxx.xxx&hops=xxx.xxx.xxx.xxx'
 *
 * @apiSuccess {Object} response The success response
 * @apiSuccess {String} response.message The success response message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {"message": "Record added."}
 *
 * @apiError (Bad Request 400) MissingSSID The ssid was not in the request.
 * @apiError (Bad Request 400) MissingAPMac The access point mac address was not in the request.
 * @apiError (Bad Request 400) MissingClientMac The client mac address was not in the request.
 * @apiError (Bad Request 400) MissingSecurityType The security type was not in the request.
 * @apiError (Bad Request 400) MissingPublicIP The public IP of the client was not in the request.
 * @apiError (Bad Request 400) MissingTracerouteHops The list of traceroute hops was not in the request.
 * @apiError (Bad Request 400) InvalidSSID The ssid provided is not valid.
 * @apiError (Bad Request 400) InvalidAPMac The access point mac address provided is not valid.
 * @apiError (Bad Request 400) InvalidClientMac The client mac address provided is not valid.
 * @apiError (Bad Request 400) InvalidPublicIP The public IP of the client provided is not valid.
 * @apiError (Bad Request 400) InvalidTracerouteHops The list of traceroute hops is not valid.
 * @apiError (Bad Request 400) UpdatesTooQuick The request for a particular access point mac address is too often.
 * @apiError (Internal Server Error 500) ServerError There was an issue on the server serving the request.
 *
 * @apiErrorExample Error-Response (Missing SSID)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"SSID is missing."}
 *
 * @apiErrorExample Error-Response (Missing AP Mac)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"AP Mac address is missing."}
 *
 * @apiErrorExample Error-Response (Missing Client Mac)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Client MAC address is missing."}
 *
 * @apiErrorExample Error-Response (Missing Security Type)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Security type is missing."}
 *
 * @apiErrorExample Error-Response (Missing Public IP)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Public IP address is missing."}
 *
 * @apiErrorExample Error-Response (Missing Traceroute Hops)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Traceroute hops is missing."}
 *
 * @apiErrorExample Error-Response (Invalid AP Mac)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid AP Mac address."}
 *
 * @apiErrorExample Error-Response (Invalid Client Mac)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid client Mac address."}
 *
 * @apiErrorExample Error-Response (Invalid Public IP)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid public IP address."}
 *
 * @apiErrorExample Error-Response (Invalid Traceroute Hops)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid Traceroute hops list."}
 *
 * @apiErrorExample Error-Response (Updates Too Quick)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Record has been updated too recently, try again later."}
 *
 * @apiErrorExample Error-Response (Internal Server Error)
 *     HTTP/1.1 500 Internal Server Error
 *     {"message":"Could not add record."}
 *
 */

/**
 * @api {post} /api/ap/getRecord GetRecord
 * @apiVersion 1.0.0
 * @apiName GetRecord
 * @apiGroup AP
 * @apiPermission public
 *
 * @apiDescription Gets an access point record from the database given it's MAC.
 *
 * @apiParam {String} apMac The access point MAC address.
 *
 * @apiExample CURL example:
 *      curl -X POST 'https://pagrapple.com/api/ap/getRecord' -d 'apMac=xx:xx:xx:xx:xx:xx'
 *
 * @apiSuccess {Object} node The record from the database
 * @apiSuccess {Number[]} node.updateTime The list of times the record has been updated. Each value is in millisecond UTC.
 * @apiSuccess {String[]} node.clientMac The list of client mac addresses who have updated this record.
 * @apiSuccess {String} node.apMac The access point mac address.
 * @apiSuccess {String} node.ssid The SSID of the access point.
 * @apiSuccess {String} node.securityType The type of access point security.
 * @apiSuccess {String} node.publicIP The public IP of the client.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {"updateTime":[1412020518442],"clientMac":["xx:xx:xx:xx:xx:xx"],"apMac":"xx:xx:xx:xx:xx:xx","ssid":"mySSIDisSoCool", "securityType": "WPA2 Enterprise", "publicIP": "xxx.xxx.xxx.xxx"}
 *
 * @apiError (Bad Request 400) MissingAPMac The access point mac address was not in the request.
 * @apiError (Bad Request 400) InvalidAPMac The access point mac address provided is not valid.
 * @apiError (Bad Request 400) RecordMissing The requested access point mac address is not in the database.
 * @apiError (Internal Server Error 500) ServerError There was an issue on the server serving the request.
 *
 * @apiErrorExample Error-Response (Missing AP Mac)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"AP Mac address is missing."}
 *
 * @apiErrorExample Error-Response (Invalid AP Mac)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid AP Mac address."}
 *
 * @apiErrorExample Error-Response (Record Missing)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Record does not exist."}
 *
 * @apiErrorExample Error-Response (Internal Server Error)
 *     HTTP/1.1 500 Internal Server Error
 *     {"message":"Could not add record."}
 *
 */
