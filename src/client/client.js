import { Authority } from '@ucanto/authority';
import * as Client from '@ucanto/client';
import * as CAR from '@ucanto/transport/car';
import * as CBOR from '@ucanto/transport/cbor';
import * as HTTP from '@ucanto/transport/http';
import _fetch from '@web-std/fetch';

import {
  todoAdd,
  todoList,
  todoUpdate,
  todoRemove,
} from '../shared/capabilities.js';

const SERVICE_DID = 'did:key:z6Mkiir3a7AGKZw1Jwbe9FyJU6Smeo7EZcXV6TAYvZnCQ2FG';
const SERVICE_URL = new URL('http://localhost:3000');

/**
 * @param {{id : import('@ipld/dag-ucan').Identity; url?: URL, fetch?: import('@ucanto/transport').HTTP.Fetcher}} opts
 * @returns {import('@ucanto/interface').ConnectionView<import('./types').Service>}
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

export async function add(opts) {
  const conn = connection({ id: opts.issuer });

  const out = await todoAdd
    .invoke({
      audience: Authority.parse(opts.audience || SERVICE_DID),
      issuer: opts.issuer,
      with: opts.issuer.did(),
      caveats: { ...opts.caveats },
    })
    .execute(conn);

  if (out?.error) {
    throw out;
  }

  return out;
}

export async function list(opts) {
  const conn = connection({ id: opts.issuer });

  const out = await todoList
    .invoke({
      audience: Authority.parse(opts.audience || SERVICE_DID),
      issuer: opts.issuer,
      with: opts.issuer.did(),
      caveats: { ...opts.caveats },
    })
    .execute(conn);

  if (out?.error) {
    throw out;
  }

  return out;
}

export async function update(opts) {
  const conn = connection({ id: opts.issuer });

  const out = await todoUpdate
    .invoke({
      audience: Authority.parse(opts.audience || SERVICE_DID),
      issuer: opts.issuer,
      with: opts.issuer.did(),
      caveats: { ...opts.caveats },
    })
    .execute(conn);

  if (out?.error) {
    throw out;
  }

  return out;
}

export async function remove(opts) {
  const conn = connection({ id: opts.issuer });

  const out = await todoRemove
    .invoke({
      audience: Authority.parse(opts.audience || SERVICE_DID),
      issuer: opts.issuer,
      with: opts.issuer.did(),
      caveats: { ...opts.caveats },
    })
    .execute(conn);

  if (out?.error) {
    throw out;
  }
  return out;
}
