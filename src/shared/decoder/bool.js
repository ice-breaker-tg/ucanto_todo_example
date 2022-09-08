import { Failure } from '@ucanto/server';

/**
 * @param {boolean} input - The input value.
 * @returns {import('@ucanto/server').Result<boolean, Failure>}
 */
function decode(input) {
  if (typeof input == 'boolean') {
    return input;
  }

  return new Failure('Expected a boolean.');
}

export default {
  decode,
};
