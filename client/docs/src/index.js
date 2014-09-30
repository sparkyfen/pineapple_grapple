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
 * @apiParam {String} domain The FQDN to query.
 *
 * @apiExample CURL example:
 *      curl -X POST 'http://pineapple-grapple.herokuapp.com/api/dns/query' -d 'domain=google.com'
 *
 * @apiSuccess {String[]} IPs The list of IPv4 addresses for the requested domain.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     ["74.125.228.103","74.125.228.104","74.125.228.105","74.125.228.110","74.125.228.96","74.125.228.97","74.125.228.98","74.125.228.99","74.125.228.100","74.125.228.101","74.125.228.102"]
 *
 * @apiError (Bad Request 400) MissingDomain The domain was not in the request.
 * @apiError (Bad Request 400) InvalidDomain The domain is not a valid domain.
 * @apiError (Internal Server Error 500) ServerError There was an issue on the server serving the request.
 *
 * @apiErrorExample Error-Response (Missing Domain)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Missing domain."}
 *
 * @apiErrorExample Error-Response (Invalid Domain)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid domain."}
 *
 * @apiErrorExample Error-Response (Internal Server Error)
 *     HTTP/1.1 500 Internal Server Error
 *     {"message":"Could not lookup the requested domain."}
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
 *      curl -X POST 'http://pineapple-grapple.herokuapp.com/api/ip/query' -d 'ip=74.125.228.103'
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
 * @apiErrorExample Error-Response (Missing IP)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Missing IP address."}
 *
 * @apiErrorExample Error-Response (Invalid IP)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid IP v4 address."}
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
 *
 * @apiExample CURL example:
 *      curl -X POST 'http://pineapple-grapple.herokuapp.com/api/ap/addRecord' -d 'ssid=foobar&apMac=xx:xx:xx:xx:xx:xx&clientMac=xx:xx:xx:xx:xx:xx'
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
 * @apiError (Bad Request 400) InvalidSSID The ssid provided is not valid.
 * @apiError (Bad Request 400) InvalidAPMac The access point mac address provided is not valid.
 * @apiError (Bad Request 400) InvalidClientMac The client mac address provided is not valid.
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
 * @apiErrorExample Error-Response (Invalid AP Mac)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid AP Mac address."}
 *
 * @apiErrorExample Error-Response (Invalid Client Mac)
 *     HTTP/1.1 400 Bad Request
 *     {"message":"Invalid client Mac address."}
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
 * @apiParam {String} clientMac The client MAC address.
 *
 * @apiExample CURL example:
 *      curl -X POST 'http://pineapple-grapple.herokuapp.com/api/ap/getRecord' -d 'apMac=xx:xx:xx:xx:xx:xx'
 *
 * @apiSuccess {Object} node The record from the database
 * @apiSuccess {Number[]} node.updateTime The list of times the record has been updated. Each value is in millisecond UTC.
 * @apiSuccess {String[]} node.clientMac The list of client mac addresses who have updated this record.
 * @apiSuccess {String} node.apMac The access point mac address.
 * @apiSuccess {String} node.ssid The SSID of the access point.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {"updateTime":[1412020518442],"clientMac":["xx:xx:xx:xx:xx:xx"],"apMac":"xx:xx:xx:xx:xx:xx","ssid":"mySSIDisSoCool"}
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
