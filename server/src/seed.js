import { pathToFileURL } from 'node:url';
import { Task } from './models/Task.js';
import { addDays, startOfWeek, toDateKey } from './utils/date.js';

/**
 * Demo tasks, anchored to the current week so the app is never empty on a
 * fresh clone. Day offsets are relative to Monday of this week.
 */
function buildDemoTasks() {
  const monday = startOfWeek(toDateKey());
  const day = (weekOffset, dayIndex) => addDays(monday, weekOffset * 7 + dayIndex);

  return [
    // ── Current week ─────────────────────────────────────────────
    {
      title: 'Finishing Wireframe',
      description: 'Close the last two screens of the onboarding flow.',
      priority: 'high',
      dueDate: day(0, 0),
      startTime: '09:00',
      endTime: '10:30',
      completed: true,
    },
    {
      title: 'Meeting with team',
      description: 'Weekly sync — review the sprint board and blockers.',
      priority: 'medium',
      dueDate: day(0, 0),
      startTime: '11:00',
      endTime: '11:45',
    },
    {
      title: 'Buy a cat food',
      priority: 'low',
      dueDate: day(0, 0),
      startTime: '18:00',
      endTime: '18:30',
      completed: true,
    },
    {
      title: 'Finishing daily commission',
      description: 'Invoice the two illustration commissions from Instagram.',
      priority: 'medium',
      dueDate: day(0, 0),
      startTime: '20:00',
      endTime: '21:00',
      completed: true,
    },
    {
      title: 'Doing Homework',
      description: 'Chapter 4 exercises — data structures.',
      priority: 'high',
      dueDate: day(0, 1),
      startTime: '16:00',
      endTime: '18:00',
    },
    {
      title: 'Design review with client',
      description: 'Walk through the mobile dashboard and collect feedback.',
      priority: 'high',
      dueDate: day(0, 2),
      startTime: '14:00',
      endTime: '15:00',
    },
    {
      title: 'Gym session',
      priority: 'low',
      dueDate: day(0, 3),
      startTime: '07:00',
      endTime: '08:00',
    },
    {
      title: 'Submit weekly report',
      description: 'Summarise progress and next steps for the team.',
      priority: 'medium',
      dueDate: day(0, 4),
      startTime: '17:00',
      endTime: '17:30',
    },

    // ── Last week (mostly done) ──────────────────────────────────
    {
      title: 'Plan the sprint',
      priority: 'medium',
      dueDate: day(-1, 0),
      startTime: '10:00',
      endTime: '11:00',
      completed: true,
    },
    {
      title: 'Update portfolio',
      description: 'Add the latest case study and refresh the hero section.',
      priority: 'low',
      dueDate: day(-1, 2),
      startTime: '19:00',
      endTime: '20:00',
      completed: true,
    },
    {
      title: 'Read 20 pages',
      priority: 'low',
      dueDate: day(-1, 5),
      startTime: '21:00',
      endTime: '21:30',
    },

    // ── Next week ────────────────────────────────────────────────
    {
      title: 'Prototype the weekly view',
      description: 'Build the expandable week cards in Figma first.',
      priority: 'high',
      dueDate: day(1, 1),
      startTime: '09:30',
      endTime: '12:00',
    },
    {
      title: 'Grocery shopping',
      priority: 'low',
      dueDate: day(1, 5),
      startTime: '11:00',
      endTime: '12:00',
    },
  ];
}

/** Inserts demo tasks only when the collection is completely empty. */
export async function seedIfEmpty() {
  const count = await Task.estimatedDocumentCount();
  if (count > 0) return 0;

  const created = await Task.create(buildDemoTasks());
  console.log(`[seed] inserted ${created.length} demo tasks`);
  return created.length;
}

// `npm run seed` in the server workspace runs this file directly.
const isDirectRun =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun) {
  const { connectDatabase, disconnectDatabase } = await import('./config/db.js');
  await connectDatabase();

  const existing = await Task.estimatedDocumentCount();
  if (existing > 0) {
    console.log(`[seed] database already has ${existing} tasks — nothing to do.`);
  } else {
    await seedIfEmpty();
  }

  await disconnectDatabase();
  process.exit(0);
}
