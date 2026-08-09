import Dexie from 'dexie';

export const db = new Dexie('TaskLineDB');

db.version(1).stores({
  tasks: '++id, type, priority, category, completed, dueDate, createdAt'
});
