/**
 * Client-Side Natural Language Task Parser for TaskLine
 * Extracts dates, times, durations, recurrence patterns, priority, category,
 * and cleans conversational filler into a crisp task title.
 */

import { getTodayString, addDays } from './dateUtils.js';

const NUMBER_WORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

const MONTHS = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

const WEEKDAYS = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

export function parseNaturalLanguage(rawInput, baseDate = new Date()) {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      title: '',
      type: 'one-time',
      priority: 'none',
      dueDate: null,
      dueTime: null,
      duration: 45,
      category: '',
      recurrenceType: 'none',
      recurrenceInterval: 1,
      recurrenceWeekdays: [],
      recurrenceStartDate: null,
      isRecurrenceTemplate: false,
    };
  }

  let text = rawInput.trim();
  const todayStr = getTodayString();

  let dueDate = null;
  let dueTime = null;
  let duration = 45;
  let priority = 'none';
  let category = '';
  let type = 'one-time';
  let recurrenceType = 'none';
  let recurrenceInterval = 1;
  let recurrenceWeekdays = [];
  let recurrenceStartDate = null;
  let isRecurrenceTemplate = false;

  // 1. Extract Category Tags (e.g. #work, #fitness)
  const tagMatch = text.match(/#([a-zA-Z0-9_-]+)/);
  if (tagMatch) {
    category = tagMatch[1];
    text = text.replace(tagMatch[0], ' ');
  }

  // 2. Extract Priority
  if (/(?:\b(urgent|critical|asap|high priority)\b|!high\b)/i.test(text)) {
    priority = 'high';
    text = text.replace(/(?:\b(urgent|critical|asap|high priority)\b|!high\b)/gi, ' ');
  } else if (/(?:\b(medium priority|medium)\b|!med\b)/i.test(text)) {
    priority = 'medium';
    text = text.replace(/(?:\b(medium priority|medium)\b|!med\b)/gi, ' ');
  } else if (/(?:\b(low priority|optional)\b|!low\b)/i.test(text)) {
    priority = 'low';
    type = 'optional';
    text = text.replace(/(?:\b(low priority|optional)\b|!low\b)/gi, ' ');
  }

  // 3. Extract Duration (e.g. "for 30m", "for 1h", "for 45 mins", "for 1.5h")
  const durationMatch = text.match(/\bfor\s+(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours?|m|min|mins|minutes?)\b/i);
  if (durationMatch) {
    const val = parseFloat(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    if (unit.startsWith('h')) {
      duration = Math.round(val * 60);
    } else {
      duration = Math.round(val);
    }
    text = text.replace(durationMatch[0], ' ');
  }

  // 4. Extract Recurrence Patterns
  // Pattern A: "every two days", "every 2 days", "every 3 days", "every other day"
  const intervalMatch = text.match(/\bevery\s+(two|three|four|five|six|seven|eight|nine|ten|\d+)\s+days?\b/i);
  const otherDayMatch = text.match(/\bevery\s+other\s+day\b/i);

  if (intervalMatch || otherDayMatch) {
    recurrenceType = 'interval';
    isRecurrenceTemplate = true;
    type = 'specific-day';

    if (otherDayMatch) {
      recurrenceInterval = 2;
      text = text.replace(otherDayMatch[0], ' ');
    } else {
      const numRaw = intervalMatch[1].toLowerCase();
      recurrenceInterval = NUMBER_WORDS[numRaw] || parseInt(numRaw, 10) || 2;
      text = text.replace(intervalMatch[0], ' ');
    }

    // Check starting anchor: "from this date", "from today", "starting from today"
    const fromStartMatch = text.match(/\b(?:from\s+this\s+date|from\s+today|starting\s+today|starting\s+from\s+this\s+date|from\s+now)\b/i);
    if (fromStartMatch) {
      recurrenceStartDate = todayStr;
      text = text.replace(fromStartMatch[0], ' ');
    } else {
      recurrenceStartDate = todayStr;
    }
  }

  // Pattern B: "every day" / "daily"
  if (recurrenceType === 'none') {
    const dailyMatch = text.match(/\b(every\s+day|daily|everyday)\b/i);
    if (dailyMatch) {
      type = 'daily';
      recurrenceType = 'daily';
      text = text.replace(dailyMatch[0], ' ');
    }
  }

  // Pattern C: "every weekday" / "on weekdays"
  if (recurrenceType === 'none') {
    const weekdayMatch = text.match(/\b(every\s+weekday|on\s+weekdays|weekdays)\b/i);
    if (weekdayMatch) {
      recurrenceType = 'weekdays';
      recurrenceWeekdays = [1, 2, 3, 4, 5];
      recurrenceStartDate = todayStr;
      isRecurrenceTemplate = true;
      type = 'specific-day';
      text = text.replace(weekdayMatch[0], ' ');
    }
  }

  // Pattern D: "every monday and wednesday", "every monday"
  if (recurrenceType === 'none') {
    const weeklyMatch = text.match(/\bevery\s+((?:(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s*(?:,|and)\s*)?)+)\b/i);
    if (weeklyMatch) {
      const dayTokens = weeklyMatch[1].toLowerCase().match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/g);
      if (dayTokens && dayTokens.length > 0) {
        recurrenceType = 'weekly';
        recurrenceWeekdays = dayTokens.map((d) => WEEKDAYS[d]);
        recurrenceStartDate = todayStr;
        isRecurrenceTemplate = true;
        type = 'specific-day';
        text = text.replace(weeklyMatch[0], ' ');
      }
    }
  }

  // 5. Extract Time
  // "at 15:00", "at 3pm", "at 3:30 pm", "15:00", "8am", "8:00am"
  const timeMatch = text.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) ||
                    text.match(/\b(?:at\s+)(\d{1,2}):(\d{2})\b/i);

  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridian = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      dueTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      text = text.replace(timeMatch[0], ' ');
    }
  }

  // 6. Extract Dates (if not already handled by recurrence)
  // "today", "tomorrow", "yesterday"
  if (/\btoday\b/i.test(text)) {
    dueDate = todayStr;
    if (type !== 'daily') type = 'specific-day';
    text = text.replace(/\btoday\b/gi, ' ');
  } else if (/\btomorrow\b/i.test(text)) {
    dueDate = addDays(todayStr, 1);
    type = 'specific-day';
    text = text.replace(/\btomorrow\b/gi, ' ');
  }

  // Specific Date: "15 october", "october 15", "15th october", "oct 15th", "15th of october"
  if (!dueDate) {
    const monthNames = Object.keys(MONTHS).join('|');
    const datePatternA = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${monthNames})\\b`, 'i');
    const datePatternB = new RegExp(`\\b(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, 'i');

    const matchA = text.match(datePatternA);
    const matchB = text.match(datePatternB);

    if (matchA) {
      const day = parseInt(matchA[1], 10);
      const month = MONTHS[matchA[2].toLowerCase()];
      const year = baseDate.getFullYear();
      dueDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      type = 'specific-day';
      text = text.replace(matchA[0], ' ');
    } else if (matchB) {
      const month = MONTHS[matchB[1].toLowerCase()];
      const day = parseInt(matchB[2], 10);
      const year = baseDate.getFullYear();
      dueDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      type = 'specific-day';
      text = text.replace(matchB[0], ' ');
    }
  }

  // Upcoming Day of Week: "next monday", "this friday", "on tuesday"
  if (!dueDate) {
    const weekdayNames = Object.keys(WEEKDAYS).join('|');
    const nextDayMatch = text.match(new RegExp(`\\b(?:next|this|on)?\\s*(${weekdayNames})\\b`, 'i'));
    if (nextDayMatch) {
      const targetDay = WEEKDAYS[nextDayMatch[1].toLowerCase()];
      const currentDay = baseDate.getDay();
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7; // Next occurrence
      dueDate = addDays(todayStr, diff);
      type = 'specific-day';
      text = text.replace(nextDayMatch[0], ' ');
    }
  }

  // If dueTime was set without a date, default to today
  if (dueTime && !dueDate && type !== 'daily') {
    dueDate = todayStr;
    type = 'specific-day';
  }

  // 7. Clean Conversational Filler Words from Title
  // e.g. "i need to", "add that i need to", "add", "im invited to", "remind me to"
  const fillerPatterns = [
    /^(?:add\s+that\s+i\s+need\s+to|add\s+i\s+need\s+to|add\s+that|add|please|remember\s+to|dont\s+forget\s+to|remind\s+me\s+to)\s+/i,
    /^(?:i\s+need\s+to|i\s+have\s+to|i\s+want\s+to|i\s+must|im\s+supposed\s+to)\s+/i,
    /\b(?:im\s+invited\s+to|invited\s+to)\b/i,
  ];

  let changed = true;
  while (changed) {
    changed = false;
    text = text.replace(/^[,.\s-]+|[,.\s-]+$/g, '').trim();
    for (const pattern of fillerPatterns) {
      if (pattern.test(text)) {
        text = text.replace(pattern, ' ').trim();
        changed = true;
      }
    }
  }

  // Clean trailing/leading punctuation and extra spaces
  let cleanedTitle = text
    .replace(/^[,.\s-]+|[,.\s-]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // If cleaned title starts with lowercase, capitalize first letter
  if (cleanedTitle.length > 0) {
    cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);
  } else {
    cleanedTitle = 'Untitled Task';
  }

  return {
    title: cleanedTitle,
    type,
    priority,
    category,
    dueDate,
    dueTime,
    duration,
    recurrenceType,
    recurrenceInterval,
    recurrenceWeekdays,
    recurrenceStartDate,
    isRecurrenceTemplate,
  };
}
