import fetch from 'node-fetch';
import UCanto from './ucanto.mjs';
import JSONTransport from './jsontransport.mjs';

const SERVICE_URL = 'http://localhost:12345';
const SERVICE_DID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const MY_KEYPAIR =
  'MgCZT5vOnYZoVAeyjnzuJIVY9J4LNtJ+f8Js0cTPuKUpFne0BVEDJjEu6quFIU8yp91/TY/+MYK8GvlKoTDnqOCovCVM=';

const connection = UCanto.createConnection({
  encoder: JSONTransport,
  decoder: JSONTransport,
  channel: UCanto.Transports.HTTP.open({
    fetch,
    url: new URL(SERVICE_URL),
  }),
});

const issuer = UCanto.createUCANSigner(MY_KEYPAIR);
const audience = UCanto.createAudience(SERVICE_DID);

issuer._did = issuer.did();
audience._did = audience.did();

const runClient = async (connection) => {
  // Build a single request to the server to execute.
  const invocation = await UCanto.createInvocation({
    issuer: issuer,
    audience,
    capability: {
      can: 'test/ping',
      with: `http://test/ping`,
    },
  });

  const result = await connection.execute(invocation);

  // Handle result.
  if (result.error) {
    console.error('error', result);
  } else {
    console.log('success', result);
  }
};

runClient(connection);
