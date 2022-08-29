import * as Server from '@ucanto/server';
import * as CAR from '@ucanto/transport/car';
import * as CBOR from '@ucanto/transport/cbor';
import { SigningAuthority } from '@ucanto/authority';
import { provider } from './todo-provider.js';

const secret = await SigningAuthority.generate();
export const did = await secret.did();

export async function createServer(context) {
  return Server.create({
    id: secret,
    service: provider(context),
    decoder: CAR,
    encoder: CBOR,
    canIssue: (capability, issuer) => {
      if (capability.uri.protocol === 'did:') {
        const did = capability.uri.toString();
        return did === issuer;
      }
      return false;
    },
  });
}
