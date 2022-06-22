import * as Server from '@ucanto/server';
import * as Validators from '@ucanto/validator';
import * as CAR from '@ucanto/transport/car';
import * as CBOR from '@ucanto/transport/cbor';
import { SigningAuthority } from '@ucanto/authority';
import * as HTTP from 'node:http';
// import * as JSONTransport from './transports/json.mjs';

// Setup a Uint8Array to hold the secret.
const SERVICE_SECRET = new Uint8Array(btoa('1234561234561234561234').split(''));

const ensureTrailingDelimiter = (uri) => (uri.endsWith('/') ? uri : `${uri}/`);

// Build a capability that allows a 'user' to link a CID to their DID:KEY
// A capability is a resolver.
//
// This should be createCapability or ?
const fileLink = Server.capability({
  can: 'file/link', // The name of the capability / route / invocation.
  with: Validators.URI.match({ protocol: 'file:' }), // why does this have a file: protocol?
  caveats: { link: Validators.Link }, // define an optional parameter called link, validated by passed object
  // What is this even doing?
  // what does this mean?
  derives: (claimed, delegated) => {
    // Can be derived if claimed capability path is contained in the delegated
    // capability path.
    return (
      claimed.uri.href.startsWith(
        ensureTrailingDelimiter(delegated.uri.href)
      ) ||
      new Server.Failure(
        `Notebook ${claimed.uri} is not included in ${delegated.uri}`
      )
    );
  },
});

const service = ({ db }) => {
  // setup a request handler.
  const linkHandler = ({ capability, invocation }) => {
    // On success, set the uri to the link, which is the CID?
    db.set(capability.uri.href, capability.caveats.link);

    // Return from resolver/request handler.
    return {
      with: capability.with,
      link: capability.caveats.link,
    };
  };

  // this should be createProvider or etc.
  const link = Server.provide(fileLink, linkHandler);

  return { file: { link } };
};

export const server = async (context = { db: new Map() }) => {
  // This should be createServer
  return Server.create({
    id: await SigningAuthority.derive(SERVICE_SECRET),
    service: service(context),
    decoder: CAR, // client sends a car file.
    encoder: CBOR, // server returns CBOR

    // We tell server that capability can be self-issued by a drive owner
    canIssue: (capability, issuer) => {
      if (capability.uri.protocol === 'file:') {
        const [did] = capability.uri.pathname.split('/');
        return did === issuer;
      }
      return false;
    },
  });
};

const listen = (
  { port, context } = { port: 12345, context: { db: new Map() } }
) => {
  // Setup an http server, that passes the request body to the
  // server, which decodes it from the given decoder and calls the providers.
  HTTP.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }

    const fileServer = await server(context);
    const { headers, body } = await fileServer.request({
      headers: request.headers,
      body: Buffer.concat(chunks),
    });

    response.writeHead(200, headers);
    response.write(body);
    response.end();
  }).listen(port);
};

listen();
