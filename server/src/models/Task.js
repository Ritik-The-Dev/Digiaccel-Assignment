import mongoose from 'mongoose';
import { startOfWeek } from '../utils/date.js';

/**
 * A single task.
 *
 * `weekStart` is derived from `dueDate` (Monday of that week) and stored on the
 * document so the API can group and filter by week with an indexed query
 * instead of scanning every task in JavaScript.
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title must be 120 characters or fewer'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description must be 1000 characters or fewer'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    // Calendar day, "YYYY-MM-DD" (see utils/date.js for why this is a string).
    dueDate: {
      type: String,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    weekStart: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

taskSchema.index({ dueDate: 1, startTime: 1 });
taskSchema.index({ completed: 1, weekStart: 1 });

// Keep weekStart in sync on every save, including completed-only updates.
taskSchema.pre('validate', function syncWeekStart(next) {
  if (this.dueDate) this.weekStart = startOfWeek(this.dueDate);
  next();
});

taskSchema.pre('save', function syncCompletedAt(next) {
  if (this.isModified('completed')) {
    this.completedAt = this.completed ? new Date() : null;
  }
  next();
});

export const Task = mongoose.model('Task', taskSchema);
