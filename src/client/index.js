import { SigningAuthority, Authority } from '@ucanto/authority';
import * as client from './client.js';
import _fetch from '@web-std/fetch';
import yargs from 'yargs';

import Conf from 'conf';
import * as CBOR from '@ucanto/transport/cbor';

const serialize = ({ ...data }) =>
  Buffer.from(CBOR.codec.encode(data)).toString('binary');
const deserialize = (text) => CBOR.codec.decode(Buffer.from(text, 'binary'));

// @ts-ignore
export const config = new Conf({
  projectName: 'ucanto-todo',
  fileExtension: 'cbor',
  serialize,
  deserialize,
});

const setup = async () => {
  const id = SigningAuthority.decode(config.get('id'));
  const res = await _fetch('http://localhost:3000/version');
  const json = await res.json();
  const audience = json.did;
  return {
    issuer: id,
    audience,
  };
};

yargs(process.argv.slice(2))
  .command(
    'id',
    'generate id and write to file',
    () => {},
    async () => {
      const id = await SigningAuthority.generate();
      console.log('generate id and write to file');
      config.set('id', SigningAuthority.encode(id));
    }
  )
  .command(
    'add <title>',
    'create a new todo',
    () => {},
    async ({ title }) => {
      const { issuer, audience } = await setup();
      try {
        const response = await client.add({
          issuer,
          audience,
          caveats: {
            title,
          },
        });
        console.log('response', response);
      } catch (error) {
        console.error(error?.cause?.message);
      }
    }
  )
  .command(
    'complete <title>',
    'complete a todo',
    () => {},
    async ({ title }) => {
      const { issuer, audience } = await setup();
      try {
        const response = await client.update({
          issuer,
          audience,
          caveats: {
            title,
            done: true,
          },
        });
        console.log('response', response);
      } catch (error) {
        console.error(error?.cause?.message);
      }
    }
  )
  .command(
    'notdone <title>',
    'mark a todo as not done',
    () => {},
    async ({ title }) => {
      const { issuer, audience } = await setup();
      try {
        const response = await client.update({
          issuer,
          audience,
          caveats: {
            title,
            done: false,
          },
        });
        console.log('response', response);
      } catch (error) {
        console.error(error?.cause?.message);
      }
    }
  )
  .command(
    'remove <title>',
    'remove a todo',
    () => {},
    async ({ title }) => {
      const { issuer, audience } = await setup();
      try {
        const response = await client.remove({
          issuer,
          audience,
          caveats: {
            title,
          },
        });
        console.log('response', response);
      } catch (error) {
        console.error(error?.cause?.message);
      }
    }
  )
  .command(
    'list',
    'list all todos',
    () => {},
    async ({ title }) => {
      const { issuer, audience } = await setup();
      const response = await client.list({
        issuer,
        audience,
      });
      console.log('response', JSON.stringify(response, null, 2));
    }
  )
  .demandCommand(1)
  .help().argv;
