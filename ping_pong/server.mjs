import * as HTTP from 'node:http';

import UCanto from './ucanto.mjs';
import JSONTransport from './jsontransport.mjs';

// Setup a Uint8Array to hold the secret.
// const SERVICE_SECRET = new Uint8Array(btoa('1234561234561234561234').split(''));

const SERVICE_DID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';

const ensureTrailingDelimiter = (uri) => (uri.endsWith('/') ? uri : `${uri}/`);

const pingCapability = UCanto.createCapability({
  can: 'test/ping',
  with: UCanto.Validators.URI.match({ protocol: 'http:' }),
  derives: (claimed, delegated) => {
    console.log('claimed: ' + claimed);
    console.log('delegated: ' + delegated);
    return true;
  },
});

const ping = UCanto.createCapabilityProvider(pingCapability, (stuff) => {
  console.log('ping', stuff);
});

async function createPingPongServer() {
  return UCanto.createServer({
    id: await UCanto.createAudience(SERVICE_DID),
    service: {
      test: {
        ping,
        //         ping: async (stuff) => {
        //           console.log('ping', stuff);
        //           return { status: 'hi' };
        //         },
      },
    },
    encoder: JSONTransport,
    decoder: JSONTransport,
    canIssue: (capability, issuer) => {
      console.log('can issue called', capability);
      console.log('can issue called', issuer);
      return true;
    },
  });
}

const listen = ({ port } = { port: 12345 }) => {
  // Setup an http server, that passes the request body to the
  // server, which decodes it from the given decoder and calls the providers.
  HTTP.createServer(async (request, response) => {
    const fileServer = await createPingPongServer();

    let data = '';
    request.on('data', (chunk) => (data += chunk));
    request.on('end', async () => {
      //       console.log('headers: ' + JSON.stringify(request.headers));
      //       console.log('body: ' + data);
      const { headers, body } = await fileServer.request({
        headers: request.headers,
        body: data,
      });

      response.writeHead(200, headers);
      response.write(body);
      response.end();
    });
  }).listen(port);
};

listen();
