import { SigningAuthority, Authority } from '@ucanto/authority';
import * as client from './client.js';
import _fetch from 'cross-fetch';
import yargs from 'yargs';

import Conf from 'conf';
import * as CBOR from '@ucanto/transport/cbor';
import { Delegation } from '@ucanto/server';
import { createDelegation, delegated } from './utils.js';

const serialize = ({ ...data }) =>
  Buffer.from(CBOR.codec.encode(data)).toString('binary');

/** @param {string} text - Serialized data. */
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

  const configDelegation = config.get('delegation');
  const delegation = configDelegation
    ? Delegation.import([configDelegation.root])
    : null;

  return {
    issuer: id,
    audience,
    delegation,
  };
};

yargs(process.argv.slice(2))
  .command(
    'id',
    'generate id and write to file',
    () => {},
    async () => {
      let id;
      if (!config.has('id')) {
        id = await SigningAuthority.generate();
      } else {
        id = SigningAuthority.decode(config.get('id'));
      }
      console.log('generate id and write to file');
      config.set('id', SigningAuthority.encode(id));
      console.log('id: ' + id.did());
    }
  )
  .command(
    'import-delegation <carfile>',
    'import a delegation ucan stored in a car.',
    () => {},
    async ({ carfile }) => {
      const imported = await delegated(carfile);
      console.log('imported delegation from: ' + imported.issuer.did());
      config.set('delegation', imported);
    }
  )
  .command(
    'whoami',
    'list information on user / account',
    () => {},
    async () => {
      const { issuer, audience, delegation } = await setup();
      console.log(`agent: ${issuer.did()}`);
      console.log(`account: ${delegation?.issuer?.did() || issuer.did()}`);
    }
  )
  .command(
    'add <title>',
    'create a new todo',
    () => {},
    async ({ title }) => {
      const { issuer, audience, delegation } = await setup();
      try {
        const response = await client.add({
          issuer,
          audience,
          caveats: {
            title,
          },
          proofs: delegation ? [delegation] : [],
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
      const { issuer, audience, delegation } = await setup();
      try {
        const response = await client.update({
          issuer,
          audience,
          caveats: {
            title,
            done: true,
          },
          proofs: delegation ? [delegation] : [],
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
      const { issuer, audience, delegation } = await setup();
      try {
        const response = await client.update({
          issuer,
          audience,
          caveats: {
            title,
            done: false,
          },
          proofs: delegation ? [delegation] : [],
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
      const { issuer, audience, delegation } = await setup();
      try {
        const response = await client.remove({
          issuer,
          audience,
          caveats: {
            title,
          },
          proofs: delegation ? [delegation] : [],
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
    async () => {
      const { issuer, audience, delegation } = await setup();
      const response = await client.list({
        issuer,
        audience,
        proofs: delegation ? [delegation] : [],
      });
      console.log('response', JSON.stringify(response, null, 2));
    }
  )
  .command(
    'delegate <did>',
    'delegate',
    () => {},
    async ({ did }) => {
      const { issuer, audience, delegation } = await setup();
      const response = await createDelegation({
        issuer,
        audience,
        did,
        proofs: delegation ? [delegation] : [],
      });
      console.log('response', JSON.stringify(response, null, 2));
    }
  )

  .demandCommand(1)
  .help().argv;
