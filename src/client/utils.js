import { CarBufferWriter, CarReader } from '@ipld/car';
import { Authority } from '@ucanto/authority';
import { Delegation } from '@ucanto/server';
import fs from 'fs';
import { todoAll } from '../shared/capabilities.js';

async function writeDelegationUCANtoCar(delegation) {
  const carWriter = CarBufferWriter.createWriter(Buffer.alloc(1024));
  const delegationBlocks = delegation.export();

  for (const block of delegationBlocks) {
    carWriter.write(block);
    carWriter.addRoot(block.cid, { resize: true });
  }

  const bytes = carWriter.close({ resize: true });
  await fs.promises.writeFile('delegation.car', bytes, { encoding: 'binary' });
}

export async function createDelegation(opts) {
  const userBeingDelegatedTo = Authority.parse(opts.did);
  const todoAllWithUser = todoAll.create({ with: opts.issuer.did() });

  const todoAllDelegated = await Delegation.delegate({
    issuer: opts.issuer,
    audience: userBeingDelegatedTo,
    capabilities: [todoAllWithUser],
    expiration: Date.now() + 60000,
  });

  await writeDelegationUCANtoCar(todoAllDelegated);
  return 'wrote delegation to delegation.car';
}

export async function delegated(fileName) {
  const fileBytes = await fs.promises.readFile(fileName);
  const reader = await CarReader.fromBytes(fileBytes);
  const roots = await reader.getRoots();

  const ucan = await reader.get(roots[0]);
  const imported = Delegation.import([ucan]);
  return imported;
}
