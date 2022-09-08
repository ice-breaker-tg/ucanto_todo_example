import { Link, Failure, capability, URI } from '@ucanto/server';

import { derives } from './capabilities-utils.js';
import * as STRING from './decoder/string.js';
import BOOL from './decoder/bool.js';

export const todoAll = capability({
  can: 'todo/*',
  with: URI.match({ protocol: 'did:' }),
  derives,
});

export const todoAdd = todoAll.derive({
  to: capability({
    can: 'todo/add',
    with: URI.match({ protocol: 'did:' }),
    caveats: {
      title: STRING.withMinLength(4),
    },
  }),
  derives,
});

export const todoList = todoAll.derive({
  to: capability({
    can: 'todo/list',
    with: URI.match({ protocol: 'did:' }),
  }),
  derives,
});

export const todoUpdate = todoAll.derive({
  to: capability({
    can: 'todo/update',
    with: URI.match({ protocol: 'did:' }),
    caveats: {
      title: STRING.withMinLength(4),
      done: BOOL,
    },
  }),
  derives,
});

export const todoRemove = todoAll.derive({
  to: capability({
    can: 'todo/remove',
    with: URI.match({ protocol: 'did:' }),
    caveats: {
      title: STRING.withMinLength(4),
    },
  }),
  derives,
});

// export const todo = todoAdd.or(todoUpdate).or(todoRemove).or(todoList);
