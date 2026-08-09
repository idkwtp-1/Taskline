import { getTodayString, formatDisplayDate, formatShortDate, formatDisplayTime, isBeforeToday } from '../src/lib/dateUtils.js';

console.log('--- Testing dateUtils.js ---');

// 1. getTodayString
const todayStr = getTodayString();
console.log('getTodayString():', todayStr);
console.assert(/^\d{4}-\d{2}-\d{2}$/.test(todayStr), 'getTodayString should return YYYY-MM-DD');

// 2. formatDisplayDate
console.log('formatDisplayDate("2026-08-08"):', formatDisplayDate('2026-08-08'));
console.assert(formatDisplayDate('2026-08-08') === 'Saturday, August 8', 'Format display date failed');

// 3. formatShortDate
console.log('formatShortDate("2026-08-08"):', formatShortDate('2026-08-08'));
console.assert(formatShortDate('2026-08-08') === 'Sat, Aug 8', 'Format short date failed');

// 4. formatDisplayTime
console.log('formatDisplayTime("14:30"):', formatDisplayTime('14:30'));
console.assert(formatDisplayTime('14:30') === '2:30 PM', 'Format display time 14:30 failed');
console.log('formatDisplayTime("00:05"):', formatDisplayTime('00:05'));
console.assert(formatDisplayTime('00:05') === '12:05 AM', 'Format display time 00:05 failed');

// 5. isBeforeToday
console.log('isBeforeToday("2026-08-07"):', isBeforeToday('2026-08-07'));
console.assert(isBeforeToday('2026-08-07') === true, 'isBeforeToday for past date failed');
console.log('isBeforeToday("2099-01-01"):', isBeforeToday('2099-01-01'));
console.assert(isBeforeToday('2099-01-01') === false, 'isBeforeToday for future date failed');

console.log('--- Date Utils Tests Passed ---');
