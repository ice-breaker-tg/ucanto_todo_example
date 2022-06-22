import * as Server from '@ucanto/server';
import * as Validators from '@ucanto/validator';
import * as Transports from '@ucanto/transport';
import { SigningAuthority } from '@ucanto/authority';
import * as HTTP from 'node:http';

const UCanto = {
  createServer: Server.create,
  createCapability: Server.capability,
  createCapabilityProvider: Server.provide,
  generateIssuer: SigningAuthority.derive,
  Transports,
};

// Setup a Uint8Array to hold the secret.
const SERVICE_SECRET = new Uint8Array(btoa('1234561234561234561234').split(''));

const ensureTrailingDelimiter = (uri) => (uri.endsWith('/') ? uri : `${uri}/`);

// Build a capability that allows a 'user' to link a CID to their DID:KEY
// A capability is a resolver.
const fileLinkCapability = UCanto.createCapability({
  // The name of the capability / route / invocation.
  can: 'file/link',
  // define an required parameter, validated by passed object
  with: Validators.URI.match({ protocol: 'file:' }),
  // define an optional parameter called link, validated by passed object
  caveats: { link: Validators.Link },
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

async function createFileService({ db }) {
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
  const link = UCanto.createCapabilityProvider(fileLinkCapability, linkHandler);

  return { file: { link } };
}

async function createFileServer(context = { db: new Map() }) {
  // This should be createServer
  return UCanto.createServer({
    id: await UCanto.generateIssuer(SERVICE_SECRET),
    service: createFileService(context),
    decoder: UCanto.Transports.CAR, // client sends a car file.
    encoder: UCanto.Transports.CBOR, // server returns CBOR

    // We tell server that capability can be self-issued by a drive owner
    // this should be middleware like / plugin or something?
    canIssue: (capability, issuer) => {
      if (capability.uri.protocol === 'file:') {
        const [did] = capability.uri.pathname.split('/');
        return did === issuer;
      }
      return false;
    },
  });
}

async function requestToBuffer(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

const listen = (
  { port, context } = { port: 12345, context: { db: new Map() } }
) => {
  // Setup an http server, that passes the request body to the
  // server, which decodes it from the given decoder and calls the providers.
  HTTP.createServer(async (request, response) => {
    const fileServer = await createFileServer(context);

    const { headers, body } = await fileServer.request({
      headers: request.headers,
      body: await requestToBuffer(request),
    });

    response.writeHead(200, headers);
    response.write(body);
    response.end();
  }).listen(port);
};

listen();
