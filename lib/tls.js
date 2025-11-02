const { load } = require('koffi');

const lib = load('./bin/tls-client-linux-ubuntu-amd64-1.11.2.so');

// Define FFI functions
const tlsClient = {
  request: lib.func('string request(string)'),
  getCookiesFromSession: lib.func('string getCookiesFromSession(string)'),
  addCookiesToSession: lib.func('string addCookiesToSession(string)'),
  freeMemory: lib.func('void freeMemory(string)'),
  destroyAll: lib.func('string destroyAll()'),
  destroySession: lib.func('string destroySession(string)')
};

function request(options = {}) {
  const {
    url,
    method = 'GET',
    headers = {},
    body = '',
    sessionId = `session-${Date.now()}`,
    tlsClientIdentifier = 'chrome_103',
    followRedirects = true,
    timeoutSeconds = 30,
    proxyUrl = '',
    cookies = []
  } = options;

  const requestPayload = {
    tlsClientIdentifier,
    followRedirects,
    insecureSkipVerify: false,
    withoutCookieJar: false,
    withDefaultCookieJar: false,
    isByteRequest: false,
    catchPanics: false,
    withDebug: false,
    forceHttp1: false,
    withRandomTLSExtensionOrder: false,
    timeoutSeconds,
    timeoutMilliseconds: 0,
    sessionId,
    proxyUrl,
    isRotatingProxy: false,
    certificatePinningHosts: {},
    headers,
    headerOrder: Object.keys(headers),
    requestUrl: url,
    requestMethod: method.toUpperCase(),
    requestBody: body,
    requestCookies: cookies
  };

  const response = tlsClient.request(JSON.stringify(requestPayload));
  const responseObject = JSON.parse(response);
  
  // Free memory after parsing response
  if (responseObject.id) {
    tlsClient.freeMemory(responseObject.id);
  }

  return {response: responseObject, destroy: () => destroySession(sessionId) };
}

function getCookies(sessionId, url) {
  const payload = { sessionId, url };
  const response = tlsClient.getCookiesFromSession(JSON.stringify(payload));
  return JSON.parse(response);
}

function addCookies(sessionId, url, cookies) {
  const payload = { sessionId, url, cookies };
  const response = tlsClient.addCookiesToSession(JSON.stringify(payload));
  return JSON.parse(response);
}

function destroySession(sessionId) {
  const payload = { sessionId };
  const response = tlsClient.destroySession(JSON.stringify(payload));
  return JSON.parse(response);
}

function destroyAll() {
  const response = tlsClient.destroyAll();
  return JSON.parse(response);
}

module.exports = {
  request,
  getCookies,
  addCookies,
  destroySession,
  destroyAll
};