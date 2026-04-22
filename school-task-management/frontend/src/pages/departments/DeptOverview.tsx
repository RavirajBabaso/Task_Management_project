import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axios from 'axios';
import TaskStatusPieChart from '../../components/charts/TaskStatusPieChart';
import TaskTable from '../../components/tables/TaskTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import type { Task, TaskStatus } from '../../types/task.types';
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
    sentTo: string; // 'ALL' or department name
    date: string;
  }[];
  myTasksList: Task[];
}

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdate: (taskId: number, status: TaskStatus, comment: string) => void;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ isOpen, onClose, task, onUpdate }) => {
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (task) {
      onUpdate(task.id, status, comment);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Task Status"
      footer={
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Update</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DELAYED">Delayed</option>
            <option value="ESCALATED">Escalated</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Add a comment..."
          />
        </div>
      </div>
    </Modal>
  );
};

const DeptOverview: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['dept-dashboard', user?.department_id],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/dept/${user?.department_id}`);
      return response.data as DeptDashboardData;
    },
    enabled: !!user?.department_id,
  });

  const handleUpdateStatus = (taskId: number, status: TaskStatus, comment: string) => {
    // Implement API call to update status
    console.log('Update task', taskId, status, comment);
  };

  const getAnnouncementBorderColor = (sentTo: string) => {
    return sentTo === 'ALL' ? 'border-blue-500' : 'border-amber-500';
  };

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Department Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.name} - {user?.departmentName}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">My Tasks</h3>
          <p className="text-2xl font-bold text-gray-900">{data.myTasks.total}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-blue-600">{data.myTasks.pending}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
          <p className="text-2xl font-bold text-amber-600">{data.myTasks.inProgress}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-2xl font-bold text-green-600">{data.myTasks.completed}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Delayed</h3>
          <p className="text-2xl font-bold text-red-600">{data.myTasks.delayed}</p>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
          <TaskStatusPieChart data={data.taskStatusData} />
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-4">Recent Announcements</h3>
          <div className="space-y-3">
            {data.recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className={`border-l-4 pl-4 py-2 ${getAnnouncementBorderColor(announcement.sentTo)}`}>
                <p className="text-sm font-medium">{announcement.title}</p>
                <p className="text-xs text-gray-500">Sent to: {announcement.sentTo} • {announcement.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">My Tasks</h3>
        <TaskTable
          tasks={data.myTasksList}
          onRowClick={(task) => {
            setSelectedTask(task);
            setIsModalOpen(true);
          }}
        />
      </div>

      <UpdateStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onUpdate={handleUpdateStatus}
      />
    </div>
  );
};

export default DeptOverview;