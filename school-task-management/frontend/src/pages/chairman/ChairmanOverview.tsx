import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import DepartmentHealthBar from '../../components/charts/DepartmentHealthBar';
import TaskTable from '../../components/tables/TaskTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import type { Task } from '../../types/task.types';

interface DashboardData {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  delayedTasks: number;
  pendingApprovals: number;
  departments: { name: string; completionPct: number; healthColor: string }[];
  alerts: { id: number; title: string; subLabel: string; severity: 'Critical' | 'Warning' | 'Delay' | 'Escalated' }[];
  recentTasks: Task[];
  pendingApprovalsList: { id: number; title: string; submitter: string; amount: string; department: string }[];
}

const ChairmanOverview: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['chairman-dashboard'],
    queryFn: async () => {
      const response = await axios.get('/api/dashboard/chairman');
      return response.data as DashboardData;
    },
    refetchInterval: 30000,
  });

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
      case 'Escalated':
        return 'red';
      case 'Warning':
      case 'Delay':
        return 'amber';
      default:
        return 'gray';
    }
  };

  const getSeverityIcon = (severity: string) => {
    // Placeholder icons, replace with actual icons
    return '⚠️';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Tab bar */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button className="pb-2 border-b-2 border-blue-500 text-blue-600 font-medium">Overview</button>
        <button className="pb-2 text-gray-500">Tasks</button>
        <button className="pb-2 text-gray-500">Approvals</button>
        <button className="pb-2 text-gray-500">Reports</button>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Total tasks</h3>
          <p className="text-2xl font-bold text-blue-600">{data.totalTasks}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-2xl font-bold text-green-600">{data.completedTasks} ({data.completionPercentage}%)</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Delayed</h3>
          <p className="text-2xl font-bold text-red-600">{data.delayedTasks}</p>
          <p className="text-xs text-red-500">Needs action</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Pending approvals</h3>
          <p className="text-2xl font-bold text-amber-600">{data.pendingApprovals}</p>
          <p className="text-xs text-amber-500">Awaiting you</p>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Health */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Department Health</h3>
            <button className="text-xs text-blue-600 bg-transparent">Full report</button>
          </div>
          <DepartmentHealthBar departments={data.departments} />
        </div>

        {/* Active Alerts */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
          <div className="space-y-3">
            {data.alerts.map((alert) => (
              <div key={alert.id} className="flex items-center space-x-3">
                <div className="text-lg">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-gray-500">{alert.subLabel}</p>
                </div>
                <Badge variant={getSeverityColor(alert.severity) as any}>{alert.severity}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent task assignments */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent task assignments</h3>
            <Button size="sm">Assign task +</Button>
          </div>
          <TaskTable tasks={data.recentTasks.slice(0, 5)} />
        </div>

        {/* Pending approvals */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-4">Pending approvals</h3>
          <div className="space-y-3">
            {data.pendingApprovalsList.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                    {approval.submitter.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{approval.title}</p>
                    <p className="text-xs text-gray-500">{approval.submitter} • {approval.amount}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="primary">Approve</Button>
                  <Button size="sm" variant="danger">Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChairmanOverview;