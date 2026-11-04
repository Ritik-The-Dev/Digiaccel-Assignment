import type { Task, TaskInput } from '../types';


const ORIGIN = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/+$/, '');
const apiUrl = (path: string) => `${ORIGIN}/api${path}`;

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(apiUrl(path), {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the API is running.', 0);
  }

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; errors?: Record<string, string> }
    | null;

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}`,
      response.status,
      payload?.errors
    );
  }

  return payload as T;
}

export const tasksApi = {
  list: () => request<{ count: number; tasks: Task[] }>('/tasks'),

  create: (input: TaskInput) =>
    request<{ task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, patch: Partial<TaskInput> & { completed?: boolean }) =>
    request<{ task: Task }>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  remove: (id: string) => request<{ id: string }>(`/tasks/${id}`, { method: 'DELETE' }),
};

/** Turns any thrown value into something safe to show in a toast. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
