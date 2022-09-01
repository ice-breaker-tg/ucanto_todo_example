import * as Server from '@ucanto/server';
import {
  todoAdd,
  todoUpdate,
  todoList,
  todoRemove,
} from '../shared/capabilities.js';

export function provider({ todoDB }) {
  return {
    todo: {
      add: Server.provide(
        todoAdd,
        async ({ capability, context, invocation }) => {
          const user = capability.with;
          const { title } = capability.caveats;
          const added = todoDB.add(user, { title });
          return added || new Server.Failure(`${title} already exists.`);
        }
      ),
      list: Server.provide(
        todoList,
        async ({ capability, context, invocation }) => {
          const user = capability.with;
          return todoDB.list(user);
        }
      ),
      update: Server.provide(
        todoUpdate,
        async ({ capability, context, invocation }) => {
          const user = capability.with;
          const { title, done } = capability.caveats;
          const updated = todoDB.update(user, { title, done });
          return updated || new Server.Failure(`${title} does not exist.`);
        }
      ),
      remove: Server.provide(todoRemove, async ({ capability }) => {
        const user = capability.with;
        const { title } = capability.caveats;
        const removed = todoDB.remove(user, { title });
        return removed
          ? `${title} removed.`
          : new Server.Failure(`${title} does not exist.`);
      }),
    },
  };
}
