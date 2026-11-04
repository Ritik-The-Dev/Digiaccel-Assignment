import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { errorMessage, tasksApi } from '../lib/api';
import type { Task, TaskInput } from '../types';
import { useToast } from './ToastContext';

interface TasksContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTask: (input: TaskInput) => Promise<Task>;
  updateTask: (id: string, patch: Partial<TaskInput>) => Promise<Task>;
  toggleTask: (task: Task) => Promise<void>;
  deleteTask: (task: Task) => Promise<void>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { tasks: nextTasks } = await tasksApi.list();
      setTasks(nextTasks);
      setError(null);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createTask = useCallback(async (input: TaskInput) => {
    const { task } = await tasksApi.create(input);
    setTasks((current) => [...current, task]);
    return task;
  }, []);

  const updateTask = useCallback(async (id: string, patch: Partial<TaskInput>) => {
    const { task } = await tasksApi.update(id, patch);
    setTasks((current) => current.map((item) => (item.id === task.id ? task : item)));
    return task;
  }, []);

  /**
   * Completion is toggled optimistically: the checkbox flips instantly, then
   * the server response replaces the task. On failure we roll back.
   */
  const toggleTask = useCallback(
    async (task: Task) => {
      const completed = !task.completed;
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? { ...item, completed } : item))
      );

      try {
        const { task: updated } = await tasksApi.update(task.id, { completed });
        setTasks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } catch (requestError) {
        setTasks((current) => current.map((item) => (item.id === task.id ? task : item)));
        showToast(errorMessage(requestError), 'error');
      }
    },
    [showToast]
  );

  const deleteTask = useCallback(
    async (task: Task) => {
      const snapshot = tasks;
      setTasks((current) => current.filter((item) => item.id !== task.id));

      try {
        await tasksApi.remove(task.id);
        showToast('Task deleted');
      } catch (requestError) {
        setTasks(snapshot);
        showToast(errorMessage(requestError), 'error');
      }
    },
    [showToast, tasks]
  );

  const value = useMemo(
    () => ({ tasks, loading, error, refresh, createTask, updateTask, toggleTask, deleteTask }),
    [tasks, loading, error, refresh, createTask, updateTask, toggleTask, deleteTask]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) throw new Error('useTasks must be used inside <TasksProvider>');
  return context;
}
