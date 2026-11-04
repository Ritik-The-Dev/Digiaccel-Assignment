import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { TasksProvider } from './context/TasksContext';
import { TaskModalProvider } from './context/TaskModalContext';
import { ToastProvider } from './context/ToastContext';
import { AllTasks } from './pages/AllTasks';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Onboarding } from './pages/Onboarding';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <TasksProvider>
          <TaskModalProvider>
            <Routes>
              <Route path="/onboarding" element={<Onboarding />} />

              <Route element={<AppShell />}>
                <Route index element={<Home />} />
                <Route path="tasks" element={<AllTasks />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TaskModalProvider>
        </TasksProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
