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
          todoDB.add(user, { title });
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
          todoDB.update(user, { title, done });
        }
      ),
      remove: Server.provide(todoRemove, async ({ capability }) => {
        const user = capability.with;
        const { title } = capability.caveats;
        todoDB.remove(user, { title });
      }),
    },
  };
}
