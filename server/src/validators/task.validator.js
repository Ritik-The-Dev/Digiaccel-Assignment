import { z } from 'zod';
import { isRealDateKey, isValidTime } from '../utils/date.js';

const timeField = z
  .string()
  .refine(isValidTime, 'Use a 24h time like 09:30');

const taskShape = {
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be 120 characters or fewer'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be 1000 characters or fewer')
    .optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Priority must be low, medium or high' }),
  }).optional(),
  dueDate: z
    .string({ required_error: 'Date is required' })
    .refine(isRealDateKey, 'Use a valid date (YYYY-MM-DD)'),
  startTime: timeField,
  endTime: z
    .union([timeField, z.literal('')])
    .optional(),
  completed: z.boolean().optional(),
};

const endAfterStart = (data) =>
  !data.startTime || !data.endTime || data.endTime > data.startTime;

export const createTaskSchema = z
  .object(taskShape)
  .refine(endAfterStart, {
    message: 'End time must be later than start time',
    path: ['endTime'],
  });

export const updateTaskSchema = z
  .object(taskShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  })
  .refine(endAfterStart, {
    message: 'End time must be later than start time',
    path: ['endTime'],
  });

export const listQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.enum(['all', 'open', 'completed']).optional(),
  week: z.string().optional(), // any date inside the week
  from: z.string().optional(),
  to: z.string().optional(),
});
