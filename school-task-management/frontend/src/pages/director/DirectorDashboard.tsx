import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axios from 'axios';
import TaskStatusPieChart from '../../components/charts/TaskStatusPieChart';
import TaskTable from '../../components/tables/TaskTable';
import Badge from '../../components/common/Badge';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import type { Task } from '../../types/task.types';
import type { RootState } from '../../store';

interface DeptDashboardData {
  myTasks: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    delayed: number;
  };
  taskStatusData: { name: string; value: number; color: string }[];
  recentAnnouncements: {
    id: number;
    title: string;
    sentTo: string;
    date: string;
  }[];
  myTasksList: Task[];
}

interface ChairmanDashboardData {
  departments: { name: string; completionPct: number; healthColor: string }[];
}

function DirectorDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: deptData, isLoading: deptLoading } = useQuery({
    queryKey: ['dept-dashboard', user?.department_id],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/dept/${user?.department_id}`);
      return response.data as DeptDashboardData;
    },
    enabled: !!user?.department_id,
  });

  const { data: chairmanData, isLoading: chairmanLoading } = useQuery({
    queryKey: ['chairman-dashboard-summary'],
    queryFn: async () => {
      const response = await axios.get('/api/dashboard/chairman');
      return response.data as ChairmanDashboardData;
    },
  });

  if (deptLoading || chairmanLoading || !deptData || !chairmanData) {
    return (
      <div className="flex min-h-screen bg-[#F1F4F9] text-[#1E293B]">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Navbar />
          <div className="p-6">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F1F4F9] text-[#1E293B]">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Navbar />
        <div className="p-6 space-y-6">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">Director Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name} - Director</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">My Tasks</h3>
              <p className="text-2xl font-bold text-gray-900">{deptData.myTasks.total}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="text-2xl font-bold text-blue-600">{deptData.myTasks.pending}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
              <p className="text-2xl font-bold text-amber-600">{deptData.myTasks.inProgress}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="text-2xl font-bold text-green-600">{deptData.myTasks.completed}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Delayed</h3>
              <p className="text-2xl font-bold text-red-600">{deptData.myTasks.delayed}</p>
            </div>
          </div>

          {/* Middle row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Pie Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
              <TaskStatusPieChart data={deptData.taskStatusData} />
            </div>

            {/* Recent Announcements */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-4">Recent Announcements</h3>
              <div className="space-y-3">
                {deptData.recentAnnouncements.map((announcement) => (
                  <div key={announcement.id} className={`border-l-4 pl-4 py-2 ${announcement.sentTo === 'ALL' ? 'border-blue-500' : 'border-amber-500'}`}>
                    <p className="text-sm font-medium">{announcement.title}</p>
                    <p className="text-xs text-gray-500">Sent to: {announcement.sentTo} • {announcement.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* School-wide Task Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-4">School-wide Task Summary</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chairmanData.departments.map((dept, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.completionPct}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: dept.healthColor }}
                        ></div>
                        <span className="text-sm text-gray-500">
                          {dept.completionPct >= 75 ? 'Good' : dept.completionPct >= 50 ? 'Fair' : 'Poor'}
                        </span>
                      </div>
                    </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Task List */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-4">My Tasks</h3>
            <TaskTable tasks={deptData.myTasksList} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default DirectorDashboard;
