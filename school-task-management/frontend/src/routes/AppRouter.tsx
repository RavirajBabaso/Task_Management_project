import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { DEPARTMENT_HEAD_ROLES, ROLES } from '../constants/roles';
import { useSocket } from '../hooks/useSocket';
import ChangePassword from '../pages/auth/ChangePassword';
import Login from '../pages/auth/Login';
import NotificationsPage from '../pages/NotificationsPage';
import ChairmanDashboard from '../pages/chairman/ChairmanDashboard';
import TaskDetail from '../pages/chairman/TaskDetail';
import DeptDashboard from '../pages/departments/DeptDashboard';
import DirectorDashboard from '../pages/director/DirectorDashboard';
import ProtectedRoute from './ProtectedRoute';

function NotificationsLayout() {
  useSocket();

  return (
    <div className="flex min-h-screen bg-[#F1F4F9] text-[#1E293B]">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Navbar title="Notifications" />
        <NotificationsPage />
      </main>
    </div>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/director/*" element={<DirectorDashboard />} />
          <Route path="/notifications" element={<NotificationsLayout />} />
          <Route path="/task/:id" element={<TaskDetail />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.CHAIRMAN]} />}>
          <Route path="/chairman/*" element={<ChairmanDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={DEPARTMENT_HEAD_ROLES} />}>
          <Route path="/department/*" element={<DeptDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
