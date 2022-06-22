// import fetch from 'node-fetch';
// import { CID } from 'multiformats/cid';
// import * as json from 'multiformats/codecs/json';
// import { sha256 } from 'multiformats/hashes/sha2';
import * as Client from '@ucanto/client';
import { SigningAuthority, Authority } from '@ucanto/authority';
import * as Transports from '@ucanto/transport';
import * as Server from '@ucanto/server';
import * as Validators from '@ucanto/validator';

export default {
  createConnection: Client.connect,
  createInvocation: Client.invoke,

  createServer: Server.create,
  createCapability: Server.capability,
  createCapabilityProvider: Server.provide,

  generateIssuer: SigningAuthority.derive,
  createUCANSigner: SigningAuthority.parse,
  createAudience: Authority.parse,

  Validators,
  Server,
  Transports,
};
