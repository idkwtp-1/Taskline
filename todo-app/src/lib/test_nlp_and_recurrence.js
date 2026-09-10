import { parseNaturalLanguage } from './parseNaturalLanguage.js';
import { generateRecurrenceDates, addDays, daysBetween } from './dateUtils.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('=============================================');
console.log('🧪 RUNNING TASKLINE NLP & RECURRENCE TEST SUITE');
console.log('=============================================\n');

// 1. User Scenario 1: "today i need to do 50 push ups"
console.log('TEST GROUP 1: User Request Scenario 1');
{
  const res = parseNaturalLanguage('today i need to do 50 push ups', new Date(2026, 8, 10));
  assert(res.title === 'Do 50 push ups', `Clean title is "Do 50 push ups", got "${res.title}"`);
  assert(res.dueDate === '2026-09-10', `dueDate is 2026-09-10, got ${res.dueDate}`);
  assert(res.isRecurrenceTemplate === false, 'isRecurrenceTemplate is false');
}

// 2. User Scenario 2: "every two days from this date ,add that i need to do 50 crunches"
console.log('\nTEST GROUP 2: User Request Scenario 2 (Interval Recurrence)');
{
  const res = parseNaturalLanguage('every two days from this date ,add that i need to do 50 crunches', new Date(2026, 8, 10));
  assert(res.title === 'Do 50 crunches', `Clean title is "Do 50 crunches", got "${res.title}"`);
  assert(res.recurrenceType === 'interval', `recurrenceType is "interval", got ${res.recurrenceType}`);
  assert(res.recurrenceInterval === 2, `recurrenceInterval is 2, got ${res.recurrenceInterval}`);
  assert(res.isRecurrenceTemplate === true, 'isRecurrenceTemplate is true');
  assert(res.recurrenceStartDate === '2026-09-10', `recurrenceStartDate is 2026-09-10, got ${res.recurrenceStartDate}`);

  // Test date generation for this template
  const dates = generateRecurrenceDates(res, 8);
  assert(dates.length === 5, `Generates 5 dates in 8 days (day 0, 2, 4, 6, 8), got ${dates.length}`);
  assert(dates[0] === '2026-09-10', `First date is 2026-09-10, got ${dates[0]}`);
  assert(dates[1] === '2026-09-12', `Second date is 2026-09-12, got ${dates[1]}`);
  assert(dates[2] === '2026-09-14', `Third date is 2026-09-14, got ${dates[2]}`);
}

// 3. User Scenario 3: "15 october im invited to birthday party at 15:00"
console.log('\nTEST GROUP 3: User Request Scenario 3 (Specific Date + Time)');
{
  const res = parseNaturalLanguage('15 october im invited to birthday party at 15:00', new Date(2026, 8, 10));
  assert(res.title === 'Birthday party', `Clean title is "Birthday party", got "${res.title}"`);
  assert(res.dueDate === '2026-10-15', `dueDate is 2026-10-15, got ${res.dueDate}`);
  assert(res.dueTime === '15:00', `dueTime is 15:00, got ${res.dueTime}`);
}

// 4. Extended Scenarios: Durations, Priorities, Weekdays, Tags
console.log('\nTEST GROUP 4: Advanced Attributes & Modifiers');
{
  const res1 = parseNaturalLanguage('tomorrow gym at 8am for 1h #fitness', new Date(2026, 8, 10));
  assert(res1.title === 'Gym', `Title is "Gym", got "${res1.title}"`);
  assert(res1.dueTime === '08:00', `Time is 08:00, got ${res1.dueTime}`);
  assert(res1.duration === 60, `Duration is 60m, got ${res1.duration}`);
  assert(res1.category === 'fitness', `Category is "fitness", got "${res1.category}"`);

  const res2 = parseNaturalLanguage('urgent fix production database crash !high', new Date(2026, 8, 10));
  assert(res2.priority === 'high', `Priority is high, got ${res2.priority}`);
  assert(res2.title === 'Fix production database crash', `Title clean, got "${res2.title}"`);

  const res3 = parseNaturalLanguage('every weekday morning review at 9:00 for 30m', new Date(2026, 8, 10));
  assert(res3.recurrenceType === 'weekdays', `Recurrence is weekdays, got ${res3.recurrenceType}`);
  assert(res3.duration === 30, `Duration is 30m, got ${res3.duration}`);
}

// 5. Date math utilities
console.log('\nTEST GROUP 5: Pure Date Math');
{
  assert(addDays('2026-09-10', 5) === '2026-09-15', 'addDays across standard days');
  assert(addDays('2026-09-28', 5) === '2026-10-03', 'addDays across month boundaries');
  assert(daysBetween('2026-09-10', '2026-09-15') === 5, 'daysBetween correct');
}

// 6. DB Instance Sync and Idempotency
console.log('\nTEST GROUP 6: Recurrence Database Sync Engine');
{
  const { syncRecurrenceInstances } = await import('./dateUtils.js');

  const mockTasks = [
    {
      id: 42,
      title: 'Do 50 crunches',
      priority: 'medium',
      category: 'fitness',
      isRecurrenceTemplate: true,
      recurrenceType: 'interval',
      recurrenceInterval: 2,
      recurrenceStartDate: '2026-09-10',
      duration: 45,
    },
  ];

  const addedInstances = [];
  const mockDb = {
    tasks: {
      toArray: async () => [...mockTasks, ...addedInstances],
      bulkAdd: async (items) => {
        addedInstances.push(...items);
      },
    },
  };

  // First sync pass: should generate instances
  await syncRecurrenceInstances(mockDb, 6);
  assert(addedInstances.length === 4, `First sync generates 4 instances (day 0, 2, 4, 6), got ${addedInstances.length}`);
  assert(addedInstances[0].title === 'Do 50 crunches', 'Instance inherits template title');
  assert(addedInstances[0].recurrenceParentId === 42, 'Instance references template parent ID');
  assert(addedInstances[0].isRecurrenceTemplate === false, 'Generated instance is not a template');

  // Second sync pass immediately after: should be completely idempotent (0 duplicates added)
  const countBefore = addedInstances.length;
  await syncRecurrenceInstances(mockDb, 6);
  assert(addedInstances.length === countBefore, `Second sync is idempotent (no duplicates), count remained ${countBefore}`);
}

console.log('\n=============================================');
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('=============================================');

if (failed > 0) {
  process.exit(1);
}
