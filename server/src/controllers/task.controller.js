import { ApiError, asyncHandler } from '../middleware/error.js';
import { Task } from '../models/Task.js';
import { isRealDateKey, startOfWeek } from '../utils/date.js';
import {
  createTaskSchema,
  listQuerySchema,
  updateTaskSchema,
} from '../validators/task.validator.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** GET /api/tasks — supports ?search= ?status= ?week= ?from= ?to= */
export const listTasks = asyncHandler(async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const filter = {};

  if (query.status === 'open') filter.completed = false;
  if (query.status === 'completed') filter.completed = true;

  if (query.week) {
    if (!isRealDateKey(query.week)) {
      throw new ApiError(400, 'week must be a valid date (YYYY-MM-DD)');
    }
    filter.weekStart = startOfWeek(query.week);
  }

  if (query.from || query.to) {
    filter.dueDate = {};
    if (query.from) filter.dueDate.$gte = query.from;
    if (query.to) filter.dueDate.$lte = query.to;
  }

  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  const tasks = await Task.find(filter).sort({ dueDate: 1, startTime: 1, createdAt: 1 });
  res.json({ count: tasks.length, tasks });
});

/** GET /api/tasks/:id */
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  res.json({ task });
});

/** POST /api/tasks */
export const createTask = asyncHandler(async (req, res) => {
  const data = createTaskSchema.parse(req.body);
  const task = await Task.create(data);
  res.status(201).json({ task });
});

/** PATCH /api/tasks/:id — partial update, also used for completion toggles. */
export const updateTask = asyncHandler(async (req, res) => {
  const data = updateTaskSchema.parse(req.body);

  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  Object.assign(task, data);
  await task.save();

  res.json({ task });
});

/** DELETE /api/tasks/:id */
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  res.json({ id: String(task._id) });
});
