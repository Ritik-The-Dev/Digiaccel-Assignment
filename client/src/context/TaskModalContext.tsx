import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { TaskModal } from '../components/TaskModal';
import type { Task } from '../types';

type ModalState =
  | { mode: 'create'; date: string }
  | { mode: 'edit'; task: Task }
  | null;

interface TaskModalContextValue {
  openCreateTask: (date: string) => void;
  openEditTask: (task: Task) => void;
  closeTaskModal: () => void;
}

const TaskModalContext = createContext<TaskModalContextValue | null>(null);

export function TaskModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>(null);

  const openCreateTask = useCallback((date: string) => setModal({ mode: 'create', date }), []);
  const openEditTask = useCallback((task: Task) => setModal({ mode: 'edit', task }), []);
  const closeTaskModal = useCallback(() => setModal(null), []);

  const value = useMemo(
    () => ({ openCreateTask, openEditTask, closeTaskModal }),
    [openCreateTask, openEditTask, closeTaskModal]
  );

  return (
    <TaskModalContext.Provider value={value}>
      {children}
      {modal && (
        <TaskModal
          mode={modal.mode}
          task={modal.mode === 'edit' ? modal.task : undefined}
          initialDate={modal.mode === 'create' ? modal.date : undefined}
          onClose={closeTaskModal}
        />
      )}
    </TaskModalContext.Provider>
  );
}

export function useTaskModal() {
  const context = useContext(TaskModalContext);
  if (!context) throw new Error('useTaskModal must be used inside <TaskModalProvider>');
  return context;
}
