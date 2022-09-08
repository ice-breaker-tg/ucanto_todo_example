import http from 'http';
import { TodoDB } from './todo/db.js';
const hostname = '0.0.0.0';
const port = 3000;

import { createServer, did } from './todo/server.js';
const todoServer = await createServer({ todoDB: new TodoDB() });

async function bodyToBuffer(req) {
  const data = [];

  for await (const chunk of req) {
    data.push(chunk);
  }

  return Buffer.concat(data);
}

async function handleWithUcanto(req, res) {
  const { headers, body } = await todoServer.request({
    headers: req.headers,
    body: await bodyToBuffer(req),
  });

  res.writeHead(200, headers);
  res.write(body);
  res.end();
}

async function handleOtherRequests(req, res) {
  if (req.url == '/version') {
    res.end(JSON.stringify({ did }));
  } else {
    res.end('hi');
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method == 'POST') {
    handleWithUcanto(req, res);
  } else {
    handleOtherRequests(req, res);
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
