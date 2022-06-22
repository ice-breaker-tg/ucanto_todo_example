import { SigningAuthority, Authority } from '@ucanto/authority';

const HEADERS = Object.freeze({
  'content-type': 'application/json',
});

const decoder = new TextDecoder();
const encoder = new TextEncoder();

/**
 * Encodes invocation batch into an HTTPRequest.
 *
 * @template I
 * @param {I} result
 * @returns {API.HTTPResponse<I>}
 */
export const encode = (result) => {
  if (Array.isArray(result)) {
    for (var invocation of result) {
      if (invocation.issuer) {
        console.log('encoding', invocation);
        invocation.issuer = Array.from(
          new Uint8Array(invocation.issuer.buffer)
        );
        invocation.audience = Array.from(
          new Uint8Array(invocation.audience.buffer)
        );
      }
      //       invocation.issuer = btoa(invocation.issuer.bytes)
      //       invocation.audience = btoa(invocation.audience);
      //       console.log(
      //         'issuer',
      //       );
    }
  }

  console.log('encoded', JSON.stringify(result));

  return {
    headers: HEADERS,
    body: JSON.stringify(result),
  };
};

/**
 * Decodes HTTPRequest to an invocation batch.
 *
 * @template I
 * @param {API.HTTPResponse<I>} request
 * @returns {Promise<I>}
 */
export const decode = async ({ headers, body }) => {
  const contentType = headers['content-type'] || headers['Content-Type'];
  if (contentType !== 'application/json') {
    throw TypeError(
      `Only 'content-type: application/json' is supported, instead got '${contentType}'`
    );
  }

  const result = JSON.parse(body);
  for (var invocation of result) {
    const buffer = Buffer.from(invocation.issuer);
    invocation.issuer = {
      buffer,
      did: () => 'iss',
    };
    invocation.audience = {
      did: () => 'aud',
    };
  }

  console.log('wee', result);

  return result;
};
