import * as API from '@ucanto/interface';
import { Failure } from '@ucanto/server';
// import { Failure } from '../error.js';

export const decode = (input, { protocol } = {}) => {
  //   if (typeof input !== 'string' && !(input instanceof URL)) {
  //     return new Failure(`Expected URI but got ${typeof input}`);
  //   }
  //
  //   try {
  //     const url = new URL(String(input));
  //     if (protocol != null && url.protocol !== protocol) {
  //       return new Failure(`Expected ${protocol} URI instead got ${url.href}`);
  //     } else {
  //       return [>* @type {API.URI<Protocol>} <] (url);
  //     }
  //   } catch (_) {
  //     return new Failure(`Invalid URI`);
  //   }
};

export const match = (options) => ({
  decode: (input) => {
    console.log('string match decode', input);
    return input;
  },
  //   decode: (input) => decode(input, options),
});

export function withMinLength(length = 0) {
  /**
   * @param {string} input
   * @returns {import('@ucanto/server').Result<string, Failure>}
   */
  function minLength(input) {
    const inputLength = input?.length || 0;
    if (inputLength < length) {
      return new Failure(`String should be longer than: ${length}`);
    }
    return input || '';
  }
  return {
    decode: minLength,
  };
}

/**
 * @template {`${string}:`} Protocol
 * @typedef {`${Protocol}${string}`} URIString
 */

/**
 * @template {string} Schema
 * @param {{protocol?: API.Protocol<Schema>}} [options]
 * @returns {API.Decoder<unknown, `${Schema}:${string}`, API.Failure>}
 */
export const string = (options) => ({
  decode: (input) => {
    const result = decode(input, options);
    return result.error ? result : result.href;
  },
});
