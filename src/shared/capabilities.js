import { Link, Failure, capability, URI } from '@ucanto/server';

import { canDelegateURI, derives, equalWith } from './capabilities-utils.js';
import * as STRING from './decoder/string.js';
import BOOL from './decoder/bool.js';

export const todoAdd = capability({
  can: 'todo/add',
  with: URI.match({ protocol: 'did:' }),
  caveats: {
    title: STRING.withMinLength(4),
  },
  derives,
});

export const todoList = capability({
  can: 'todo/list',
  with: URI.match({ protocol: 'did:' }),
  derives,
});

export const todoUpdate = capability({
  can: 'todo/update',
  with: URI.match({ protocol: 'did:' }),
  caveats: {
    title: STRING.withMinLength(4),
    done: BOOL,
  },
  derives,
});

export const todoRemove = capability({
  can: 'todo/remove',
  with: URI.match({ protocol: 'did:' }),
  caveats: {
    title: STRING.withMinLength(4),
  },
  derives,
});

export const todo = todoAdd.or(todoUpdate).or(todoRemove);
