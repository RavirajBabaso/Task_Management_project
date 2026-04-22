import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import { useSocket } from '../../hooks/useSocket';
import * as taskService from '../../services/taskService';
import { useAppSelector } from '../../store/hooks';
import type { TaskHistory, TaskStatus } from '../../types/task.types';

const statusVariant: Record<TaskStatus, 'blue' | 'amber' | 'green' | 'red' | 'gray'> = {
  PENDING: 'blue',
  IN_PROGRESS: 'amber',
  COMPLETED: 'green',
  DELAYED: 'red',
  ESCALATED: 'gray'
};

const priorityVariant = {
  HIGH: 'red',
  MEDIUM: 'amber',
  LOW: 'green'
} as const;

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatTimestamp = (value?: string | null) => {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getStatusNodeColor = (status: TaskStatus) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-[#2E9B67]';
    case 'DELAYED':
      return 'bg-[#D64545]';
    case 'IN_PROGRESS':
      return 'bg-[#D89B17]';
    case 'PENDING':
      return 'bg-[#185FA5]';
    default:
      return 'bg-[#7B879C]';
  }
};

function TimelineItem({ entry, isLast }: { entry: TaskHistory; isLast: boolean }) {
  const oldLabel = entry.old_status ? formatLabel(entry.old_status) : 'Created';
  const newLabel = formatLabel(entry.new_status);

  return (
    <div className="relative flex gap-4">
      <div className="relative flex w-6 justify-center">
        {!isLast ? <div className="absolute top-3 h-full w-px bg-[#EFF2F6]" /> : null}
        <span
          className={[
            'relative z-10 mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm',
            getStatusNodeColor(entry.new_status)
          ].join(' ')}
        />
      </div>

      <div className="flex-1 rounded-[16px] border border-[#EFF2F6] bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={entry.old_status ? statusVariant[entry.old_status] : 'gray'}>
            {oldLabel}
          </Badge>
          <span className="text-sm text-[#8A99B0]">to</span>
          <Badge variant={statusVariant[entry.new_status]}>{newLabel}</Badge>
        </div>
        <p className="mt-3 text-sm font-medium text-[#1E293B]">
          {entry.updatedBy?.name ?? entry.updatedByName ?? 'System'}
        </p>
        {entry.comment ? <p className="mt-2 text-sm leading-6 text-[#36506C]">{entry.comment}</p> : null}
        <p className="mt-3 text-xs text-[#8A99B0]">{formatTimestamp(entry.updated_at)}</p>
      </div>
    </div>
  );
}

function TaskDetailContent() {
  const { id } = useParams();
  const { user } = useAppSelector((state) => state.auth);

  const taskQuery = useQuery({
    queryKey: ['task-detail', id],
    queryFn: () => taskService.getTaskById(Number(id)),
    enabled: Boolean(id)
  });

  const task = taskQuery.data;
  const attachmentUrl = useMemo(() => {
    if (!task?.attachment_path) {
      return null;
    }

    const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
    const baseUrl = apiBase.replace(/\/api\/?$/, '');
    return `${baseUrl}/${task.attachment_path.replace(/^\/+/, '')}`;
  }, [task?.attachment_path]);

  const fallbackPath =
    user?.role === 'CHAIRMAN'
      ? '/chairman/task-monitor'
      : user?.role === 'DIRECTOR'
        ? '/director'
        : '/department/my-tasks';

  if (taskQuery.isLoading) {
    return <Loader />;
  }

  if (taskQuery.isError || !task) {
    return (
      <section className="p-5">
        <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
          <p className="text-lg font-semibold text-[#1E293B]">Task not found</p>
          <p className="mt-2 text-sm text-[#5B6E8C]">
            The requested task could not be loaded right now.
          </p>
          <Link className="mt-4 inline-flex text-sm font-semibold text-[#185FA5]" to={fallbackPath}>
            Back to tasks
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5 p-5">
      <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[18px] font-medium text-[#1E293B]">{task.title}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={priorityVariant[task.priority]}>
                {formatLabel(task.priority)} Priority
              </Badge>
              <Badge variant={statusVariant[task.status]}>{formatLabel(task.status)}</Badge>
            </div>
          </div>

          <Link className="text-sm font-semibold text-[#185FA5]" to={fallbackPath}>
            Back to tasks
          </Link>
        </div>

        <div className="mt-6 grid gap-4 rounded-[16px] bg-[#F8F9FC] p-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A99B0]">Assigned to</p>
            <p className="mt-1 font-medium text-[#1E293B]">
              {task.assignedTo?.name ?? task.assignedToName ?? '--'}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A99B0]">Department</p>
            <p className="mt-1 font-medium text-[#1E293B]">
              {task.department?.name ?? task.departmentName ?? '--'}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A99B0]">Due date</p>
            <p className="mt-1 font-medium text-[#1E293B]">{formatTimestamp(task.due_date)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A99B0]">Start date</p>
            <p className="mt-1 font-medium text-[#1E293B]">{formatTimestamp(task.start_date)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A99B0]">Attachment</p>
            {attachmentUrl ? (
              <a
                className="mt-1 inline-flex font-medium text-[#185FA5]"
                href={attachmentUrl}
                rel="noreferrer"
                target="_blank"
              >
                Download file
              </a>
            ) : (
              <p className="mt-1 font-medium text-[#1E293B]">No attachment</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#185FA5]">
              Task History
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#1E293B]">Timeline</h2>
          </div>
          <p className="text-sm text-[#8A99B0]">
            {task.history?.length ?? 0} update{(task.history?.length ?? 0) === 1 ? '' : 's'}
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {task.history?.length ? (
            task.history.map((entry, index) => (
              <TimelineItem
                entry={entry}
                isLast={index === task.history!.length - 1}
                key={entry.id}
              />
            ))
          ) : (
            <div className="rounded-[16px] border border-dashed border-[#DCE2EA] p-5 text-sm text-[#8A99B0]">
              No history entries available for this task yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TaskDetail() {
  useSocket();

  return (
    <div className="flex min-h-screen bg-[#F1F4F9] text-[#1E293B]">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Navbar />
        <TaskDetailContent />
      </main>
    </div>
  );
}

export default TaskDetail;
