import { Authority } from '@ucanto/authority';
import * as Client from '@ucanto/client';
import * as CAR from '@ucanto/transport/car';
import * as CBOR from '@ucanto/transport/cbor';
import * as HTTP from '@ucanto/transport/http';
import _fetch from 'cross-fetch';

import {
  todoAdd,
  todoList,
  todoUpdate,
  todoRemove,
} from '../shared/capabilities.js';

const SERVICE_DID = 'did:key:z6Mkiir3a7AGKZw1Jwbe9FyJU6Smeo7EZcXV6TAYvZnCQ2FG';
const SERVICE_URL = new URL('http://localhost:3000');

/**
 * @param {{id : Identity, url?: URL, fetch?: HTTPFetcher}} opts
 * @returns {Connection}
 */
function connection({ id, url, fetch = _fetch }) {
  return Client.connect({
    id,
    encoder: CAR,
    decoder: CBOR,
    channel: HTTP.open({
      url: url || SERVICE_URL,
      method: 'POST',
      fetch,
    }),
  });
}

/**
 * @param {CapabilityOptions} opts
 */
export async function add(opts) {
  return todoAdd
    .invoke(useDelegatedAccount(opts))
    .execute(connection({ id: opts.issuer }))
    .then(errorCheck);
}

/**
 * @param {CapabilityOptions} opts
 */
export async function list(opts) {
  return todoList
    .invoke(useDelegatedAccount(opts))
    .execute(connection({ id: opts.issuer }))
    .then(errorCheck);
}

/**
 * @param {CapabilityOptions} opts
 */
export async function update(opts) {
  return todoUpdate
    .invoke(useDelegatedAccount(opts))
    .execute(connection({ id: opts.issuer }))
    .then(errorCheck);
}

/**
 * @param {CapabilityOptions} opts
 */
export async function remove(opts) {
  return todoRemove
    .invoke(useDelegatedAccount(opts))
    .execute(connection({ id: opts.issuer }))
    .then(errorCheck);
}

/**
 * @param {ServerResult} response
 * @returns Result
 */
function errorCheck(response) {
  if (response?.error) {
    throw response;
  }

  return response;
}

/**
 * @param {any} opts
 * @returnss {CapabilityOptions} opts
 */
function useDelegatedAccount(opts) {
  opts.audience = Authority.parse(opts.audience || SERVICE_DID);

  if (opts?.proofs?.length > 0) {
    opts.with = opts.proofs[0].issuer.did();
  } else {
    opts.with = opts.issuer.did();
  }

  return opts;
}

/** @typedef {import('@ipld/dag-ucan').Identity} Identity */
/** @typedef {import('@ucanto/transport').HTTP.Fetcher} HTTPFetcher */
/** @typedef {any} Service */
/** @typedef {import('@ucanto/interface').ConnectionView<Service>} Connection */
/** @typedef {import('@ucanto/server').InvokeCapabilityOptions<any, any>} CapabilityOptions */
/** @typedef {import('@ucanto/client').Failure} Failure */
/** @typedef {import('@ucanto/server').Result<string, Failure>} ServerResult */
