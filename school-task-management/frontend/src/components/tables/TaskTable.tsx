import type { Task, TaskCadence, TaskPriority, TaskStatus } from '../../types/task.types';
import Badge from '../common/Badge';

interface TaskTableProps {
  emptyMessage?: string;
  onRowClick?: (task: Task) => void;
  tasks: Task[];
}

const priorityStripe: Record<TaskPriority, string> = {
  HIGH: 'before:bg-[#D64545]',
  MEDIUM: 'before:bg-[#D89B17]',
  LOW: 'before:bg-[#2E9B67]'
};

const statusVariant: Record<TaskStatus, 'blue' | 'amber' | 'green' | 'red' | 'gray'> = {
  PENDING: 'blue',
  IN_PROGRESS: 'amber',
  COMPLETED: 'green',
  DELAYED: 'red',
  ESCALATED: 'gray'
};

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getCadence = (task: Task): TaskCadence => {
  const start = new Date(task.start_date);
  const due = new Date(task.due_date);
  const diffDays = Math.max(
    1,
    Math.ceil((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  if (diffDays <= 1) {
    return 'DAILY';
  }

  if (diffDays <= 7) {
    return 'WEEKLY';
  }

  return 'MONTHLY';
};

function TaskTable({ emptyMessage = 'No tasks available right now.', onRowClick, tasks }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-[18px] border border-[#EFF2F6] bg-white p-8 text-center">
        <div>
          <p className="text-sm font-semibold text-[#1E293B]">No tasks found</p>
          <p className="mt-2 text-sm text-[#8A99B0]">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#EFF2F6] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#F8F9FC] text-left">
              {['Task title', 'Assigned to', 'Priority', 'Type', 'Start date', 'Deadline', 'Status'].map(
                (heading) => (
                  <th
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A99B0]"
                    key={heading}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                className={[
                  'border-t border-[#EFF2F6] transition hover:bg-[#FBFCFE]',
                  onRowClick ? 'cursor-pointer' : ''
                ].join(' ')}
                key={task.id}
                onClick={() => onRowClick?.(task)}
              >
                <td className="px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-[#1E293B]">{task.title}</p>
                    <p className="mt-1 text-xs text-[#8A99B0]">
                      {task.department?.name ?? task.departmentName ?? 'General'}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-[#36506C]">
                  {task.assignedTo?.name ?? task.assignedToName ?? 'Unassigned'}
                </td>
                <td className="px-4 py-3.5">
                  <div
                    className={[
                      'relative inline-flex min-w-[92px] items-center rounded-[10px] bg-[#F8F9FC] px-3 py-2 pl-4 text-xs font-semibold text-[#36506C] before:absolute before:bottom-1.5 before:left-1.5 before:top-1.5 before:w-[3px] before:rounded-full',
                      priorityStripe[task.priority]
                    ].join(' ')}
                  >
                    {formatLabel(task.priority)}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-[#36506C]">{formatLabel(getCadence(task))}</td>
                <td className="px-4 py-3.5 text-sm text-[#36506C]">{formatDate(task.start_date)}</td>
                <td className="px-4 py-3.5 text-sm text-[#36506C]">{formatDate(task.due_date)}</td>
                <td className="px-4 py-3.5">
                  <Badge variant={statusVariant[task.status]}>{formatLabel(task.status)}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaskTable;
