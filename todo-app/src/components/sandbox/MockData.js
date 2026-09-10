// Mock data fixtures for UI Sandbox component previews
import { getTodayString } from '../../lib/dateUtils';

const today = getTodayString();

export const MOCK_TASK_HIGH = {
  id: 1,
  title: 'Client Sprint Review & Architecture Demo',
  type: 'specific-day',
  priority: 'high',
  category: 'Work',
  completed: false,
  completedAt: null,
  dueDate: today,
  dueTime: '10:00',
  duration: 60,
  createdAt: new Date().toISOString(),
  notes: 'Present the new Day-Blocker calendar agenda and PWA offline capabilities.',
};

export const MOCK_TASK_MEDIUM = {
  id: 2,
  title: 'Gym Workout - Upper Body & Core',
  type: 'daily',
  priority: 'medium',
  category: 'Fitness',
  completed: false,
  completedAt: null,
  dueDate: today,
  dueTime: '14:30',
  duration: 45,
  createdAt: new Date().toISOString(),
  notes: '4 sets bench press, pull-ups, 50 crunches.',
};

export const MOCK_TASK_OPTIONAL = {
  id: 3,
  title: 'Read 2 chapters of System Design Interview',
  type: 'optional',
  priority: 'low',
  category: 'Learning',
  completed: false,
  completedAt: null,
  dueDate: today,
  dueTime: null,
  duration: 30,
  createdAt: new Date().toISOString(),
  notes: 'Focus on distributed caching and rate limiting patterns.',
};

export const MOCK_TASK_COMPLETED = {
  id: 4,
  title: 'Morning 50 push-ups & hydration',
  type: 'daily',
  priority: 'medium',
  category: 'Health',
  completed: true,
  completedAt: new Date().toISOString(),
  dueDate: today,
  dueTime: '08:00',
  duration: 20,
  createdAt: new Date().toISOString(),
  notes: 'Completed right after waking up.',
};

export const MOCK_TASK_LONG_TEXT = {
  id: 5,
  title: 'Conduct thorough multi-device responsiveness audit across iPhone 15 Pro, iPad Air, and ultra-wide monitor screens to eliminate edge-case clipping',
  type: 'specific-day',
  priority: 'high',
  category: 'Engineering',
  completed: false,
  completedAt: null,
  dueDate: today,
  dueTime: '16:00',
  duration: 90,
  createdAt: new Date().toISOString(),
  notes: 'Pay close attention to safe area padding, touch target sizes (>44px), and sticky navigation collisions.',
};

export const MOCK_TASK_EVENING = {
  id: 6,
  title: 'Grocery shopping & meal prep',
  type: 'specific-day',
  priority: 'low',
  category: 'Personal',
  completed: false,
  completedAt: null,
  dueDate: today,
  dueTime: '19:00',
  duration: 45,
  createdAt: new Date().toISOString(),
  notes: 'Chicken breast, broccoli, eggs, greek yogurt.',
};

export const MOCK_TASK_UNSCHEDULED = {
  id: 7,
  title: 'Organize desktop and download folder archives',
  type: 'optional',
  priority: 'none',
  category: 'Misc',
  completed: false,
  completedAt: null,
  dueDate: today,
  dueTime: null,
  duration: 30,
  createdAt: new Date().toISOString(),
  notes: 'Move screenshots into design folder.',
};

export const MOCK_UPCOMING_TASK = {
  id: 8,
  title: 'Doctor annual checkup',
  type: 'specific-day',
  priority: 'high',
  category: 'Health',
  completed: false,
  completedAt: null,
  dueDate: '2026-10-15',
  dueTime: '11:00',
  duration: 60,
  createdAt: new Date().toISOString(),
  notes: 'Downtown medical center, room 402.',
};

export const MOCK_ALL_TASKS = [
  MOCK_TASK_COMPLETED,
  MOCK_TASK_HIGH,
  MOCK_TASK_MEDIUM,
  MOCK_TASK_OPTIONAL,
  MOCK_TASK_LONG_TEXT,
  MOCK_TASK_UNSCHEDULED,
  MOCK_TASK_EVENING,
  MOCK_UPCOMING_TASK,
];

export const MOCK_TODAY_PRIORITY = [
  MOCK_TASK_COMPLETED,
  MOCK_TASK_HIGH,
  MOCK_TASK_MEDIUM,
  MOCK_TASK_LONG_TEXT,
  MOCK_TASK_EVENING,
];

export const MOCK_TODAY_OPTIONAL = [
  MOCK_TASK_OPTIONAL,
  MOCK_TASK_UNSCHEDULED,
];
