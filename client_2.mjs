import fetch from 'node-fetch';
import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import { sha256 } from 'multiformats/hashes/sha2';
import * as Client from '@ucanto/client';
import { SigningAuthority, Authority } from '@ucanto/authority';
import * as Transports from '@ucanto/transport';

const SERVICE_URL = 'http://localhost:12345';
const SERVICE_DID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const MY_KEYPAIR =
  'MgCZT5vOnYZoVAeyjnzuJIVY9J4LNtJ+f8Js0cTPuKUpFne0BVEDJjEu6quFIU8yp91/TY/+MYK8GvlKoTDnqOCovCVM=';

const bytes = json.encode({ hello: 'world' });
const hash = await sha256.digest(bytes);
const cid = CID.create(1, json.code, hash);

const UCanto = {
  createConnection: Client.connect,
  createInvocation: Client.invoke,
  generateIssuer: SigningAuthority.derive,
  Transports,
};

const connection = UCanto.createConnection({
  encoder: UCanto.Transports.CAR, // encode as CAR because server decodes from car
  decoder: UCanto.Transports.CBOR, // decode as CBOR because server encodes as CBOR
  channel: UCanto.Transports.HTTP.open({
    fetch,
    url: new URL(SERVICE_URL),
  }),
});

// Client keypair
const issuer = SigningAuthority.parse(MY_KEYPAIR);

// the audience is the service we are trying to talk to
const audience = Authority.parse(SERVICE_DID);

const runClient = async (connection) => {
  // TODO: This is just some test car we are building.
  const car = await UCanto.Transports.CAR.codec.write({
    roots: [await UCanto.Transports.CBOR.codec.write({ hello: 'world' })],
  });

  // with the key prefix, it is an invalid URI, does this need to be encoded?
  const didonly = issuer.did().replace('did:key:', '');

  // Build a single request to the server to execute.
  const invocation = await Client.invoke({
    issuer: issuer,
    audience,
    capability: {
      can: 'file/link',
      with: `file://${didonly}/me/about`,
      link: car.cid,
    },
  });

  const result = await connection.execute(invocation);

  // Handle result.
  if (result.error) {
    console.error('oops', result);
  } else {
    console.log('file got linked', result);
  }
};

runClient(connection);
