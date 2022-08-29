import * as API from '@ucanto/interface';
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

export const withMinLength = (length) => ({
  decode: (input) => {
    if (input.length < length) {
      throw `String should be longer than: ${length}`;
    }
    return input;
  },
});

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
