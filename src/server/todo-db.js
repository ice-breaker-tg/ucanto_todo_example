export class TodoDB {
  constructor() {
    this.db = new Map();
  }
  add(user, { title }) {
    let todos = [{ title, done: false }];

    if (this.db.has(user)) {
      var existing = this.db.get(user);
      if (!existing.find((x) => x.title == title)) {
        this.db.set(user, [...existing, ...todos]);
      }
    } else {
      this.db.set(user, todos);
    }
  }
  list(user) {
    return this.db.has(user) ? this.db.get(user) : [];
  }
  update(user, { title, done }) {
    if (this.db.has(user)) {
      const todos = this.db.get(user);
      const todo = todos.find((x) => x.title == title);
      if (todo) {
        const updated = { ...todo, done };
        this.db.set(user, [...todos.filter((x) => x.title != title), updated]);
      }
    }
  }
  remove(user, todo) {
    if (this.db.has(user)) {
      this.db.set(
        user,
        this.db.get(user).filter((x) => x.title != todo.title)
      );
    }
  }
}
