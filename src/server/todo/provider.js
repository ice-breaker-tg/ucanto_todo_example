import * as Server from '@ucanto/server';
import {
  todoAdd,
  todoUpdate,
  todoList,
  todoRemove,
  todoAll,
} from '../../shared/capabilities.js';

export function provider({ todoDB }) {
  return {
    todo: {
      '*': Server.provide(
        todoAll,
        async ({ capability, context, invocation }) => {
          console.log('All invoked, is NOOP.');
          return null;
        }
      ),
      add: Server.provide(
        todoAdd,
        async ({ capability, context, invocation }) => {
          const user = capability.with;
          const { title } = capability.caveats;
          const added = todoDB.add(user, { title });
          console.log(`adding ${user}/${title}`);
          return (
            added || new Server.Failure(`${user}/${title} already exists.`)
          );
        }
      ),
      list: Server.provide(
        todoList,
        async ({ capability, context, invocation }) => {
          const user = capability.with;
          console.log(`listing: ${user}`);
          return todoDB.list(user);
        }
      ),
      update: Server.provide(
        todoUpdate,
        async ({ capability, context, invocation }) => {
          const user = capability.with;
          const { title, done } = capability.caveats;
          console.log(`updating: ${user}/${title} to done:${done}`);
          const updated = todoDB.update(user, { title, done });
          return updated || new Server.Failure(`${title} does not exist.`);
        }
      ),
      remove: Server.provide(todoRemove, async ({ capability }) => {
        const user = capability.with;
        const { title } = capability.caveats;
        const removed = todoDB.remove(user, { title });
        return removed
          ? `${user}/${title} removed.`
          : new Server.Failure(`${user}/${title} does not exist.`);
      }),
    },
  };
}
