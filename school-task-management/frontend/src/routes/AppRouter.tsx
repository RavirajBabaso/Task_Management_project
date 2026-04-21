import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DEPARTMENT_HEAD_ROLES, ROLES } from '../constants/roles';
import ChangePassword from '../pages/auth/ChangePassword';
import Login from '../pages/auth/Login';
import ChairmanDashboard from '../pages/chairman/ChairmanDashboard';
import DeptDashboard from '../pages/departments/DeptDashboard';
import DirectorDashboard from '../pages/director/DirectorDashboard';
import ProtectedRoute from './ProtectedRoute';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/director/*" element={<DirectorDashboard />} />
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
