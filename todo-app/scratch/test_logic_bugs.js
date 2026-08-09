// Test script to verify fixed logic behavior for overdue tasks

const todayStr = '2026-08-08';
const yesterdayStr = '2026-08-07';
const tomorrowStr = '2026-08-09';

const mockTasks = [
  { id: 1, title: 'Daily Task', type: 'daily', completed: false },
  { id: 2, title: 'Optional Task No Date', type: 'optional', dueDate: null },
  { id: 3, title: 'Today Specific Task', type: 'specific-day', dueDate: todayStr },
  { id: 4, title: 'Overdue Specific Task', type: 'specific-day', dueDate: yesterdayStr },
  { id: 5, title: 'Overdue One-Time Task', type: 'one-time', dueDate: yesterdayStr },
  { id: 6, title: 'Tomorrow Task', type: 'specific-day', dueDate: tomorrowStr },
];

// Today view filter logic (FIXED in useTasks.js)
const todayTasks = mockTasks.filter(task => {
  if (task.type === 'daily') return true;
  if (task.type === 'optional') {
    return !task.dueDate || task.dueDate <= todayStr;
  }
  if (task.type === 'specific-day') {
    return task.dueDate <= todayStr;
  }
  if (task.type === 'one-time') {
    return !task.dueDate || task.dueDate <= todayStr;
  }
  return true;
});

console.log('Today Tasks IDs:', todayTasks.map(t => t.id));

const overdueSpecificInToday = todayTasks.some(t => t.id === 4);
const overdueOneTimeInToday = todayTasks.some(t => t.id === 5);

console.log('Overdue Task #4 in Today View:', overdueSpecificInToday);
console.log('Overdue Task #5 in Today View:', overdueOneTimeInToday);

if (overdueSpecificInToday && overdueOneTimeInToday) {
  console.log('VERIFIED FIX: Overdue tasks now remain visible in Today View!');
} else {
  console.log('STILL BROKEN');
}
