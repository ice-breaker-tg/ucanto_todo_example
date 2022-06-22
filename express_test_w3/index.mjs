import * as HTTP from 'node:http';
import { server } from './store/src/lib.js';

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

    const fileServer = await server({
      transport: {},
      validation: {},
      context: {
        self: null,
        identity: null,
        accounting: null,
        signer: null,
        signerConfig: null,
      },
    });
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
