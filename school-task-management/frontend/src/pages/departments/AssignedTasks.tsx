import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import TaskTable from '../../components/tables/TaskTable';
import * as taskService from '../../services/taskService';
import { setSelectedTask, setTasks, upsertTask } from '../../store/taskSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { Task, TaskStatus, UpdateTaskPayload } from '../../types/task.types';

const allowedStatuses: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'ESCALATED'];

const formatDateTime = (value?: string | null) => {
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

function AssignedTasks() {
  const dispatch = useAppDispatch();
  const { selectedTask, tasks } = useAppSelector((state) => state.tasks);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | undefined>();
  const [status, setStatus] = useState<TaskStatus>('IN_PROGRESS');
  const [error, setError] = useState<string | null>(null);

  const tasksQuery = useQuery({
    queryKey: ['tasks', 'my-tasks'],
    queryFn: taskService.getMyTasks
  });

  useEffect(() => {
    if (tasksQuery.data) {
      dispatch(setTasks(tasksQuery.data));
    }
  }, [dispatch, tasksQuery.data]);

  const openTask = async (task: Task) => {
    dispatch(setSelectedTask(task));
    setStatus(task.status);
    setComment('');
    setFile(undefined);
    setError(null);

    try {
      const detail = await taskService.getTaskById(task.id);
      dispatch(setSelectedTask(detail));
      setStatus(detail.status);
    } catch {
      setError('Unable to load full task details right now.');
    }
  };

  const closeModal = () => {
    dispatch(setSelectedTask(null));
    setComment('');
    setFile(undefined);
    setError(null);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedTask) {
      return;
    }

    setError(null);

    try {
      const payload: UpdateTaskPayload = {
        status,
        comment
      };
      const updatedTask = await taskService.updateTask(selectedTask.id, payload, file);
      dispatch(upsertTask(updatedTask));
      closeModal();
    } catch {
      setError('Unable to update task right now. Please try again.');
    }
  };

  return (
    <section className="space-y-5 p-5">
      <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#185FA5]">
          Department Tasks
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[#1E293B]">Assigned tasks</h2>
        <p className="mt-2 text-sm leading-6 text-[#5B6E8C]">
          Review your queue, open task details, and update progress with notes or attachments.
        </p>
      </div>

      <TaskTable
        emptyMessage="Tasks assigned to your department will appear here."
        onRowClick={openTask}
        tasks={tasks}
      />

      <Modal
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button onClick={closeModal} variant="ghost">
              Cancel
            </Button>
            <Button type="submit" form="task-update-form">
              Save update
            </Button>
          </div>
        }
        isOpen={Boolean(selectedTask)}
        onClose={closeModal}
        title={selectedTask?.title ?? 'Task details'}
      >
        {selectedTask ? (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-[14px] bg-[#F8F9FC] p-4 text-sm text-[#36506C] sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A99B0]">Assigned by</p>
                <p className="mt-1 font-medium text-[#1E293B]">
                  {selectedTask.assignedBy?.name ?? selectedTask.assignedByName ?? '--'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A99B0]">Deadline</p>
                <p className="mt-1 font-medium text-[#1E293B]">{formatDateTime(selectedTask.due_date)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A99B0]">Description</p>
                <p className="mt-1 text-[#36506C]">{selectedTask.description || 'No description provided.'}</p>
              </div>
            </div>

            <form className="space-y-4" id="task-update-form" onSubmit={handleUpdate}>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[#36506C]">New status</span>
                <select
                  className="min-h-[38px] rounded-[10px] border-[0.5px] border-[#DCE2EA] bg-[#F8F9FC] px-3 text-sm text-[#1E293B] outline-none focus:border-[#185FA5] focus:ring-4 focus:ring-[#185FA5]/10"
                  onChange={(event) => setStatus(event.target.value as TaskStatus)}
                  value={status}
                >
                  {allowedStatuses.map((item) => (
                    <option key={item} value={item}>
                      {item.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[#36506C]">Comment</span>
                <textarea
                  className="min-h-[110px] rounded-[10px] border-[0.5px] border-[#DCE2EA] bg-[#F8F9FC] px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#185FA5] focus:ring-4 focus:ring-[#185FA5]/10"
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Add progress notes or completion details"
                  value={comment}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[#36506C]">Attachment</span>
                <input
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  className="min-h-[38px] rounded-[10px] border-[0.5px] border-dashed border-[#C9D6E5] bg-[#F8F9FC] px-3 py-2 text-sm text-[#36506C] file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#185FA5]"
                  onChange={(event) => setFile(event.target.files?.[0])}
                  type="file"
                />
              </label>

              {selectedTask.history?.length ? (
                <div className="rounded-[14px] border border-[#EFF2F6] p-4">
                  <p className="text-sm font-semibold text-[#1E293B]">Task history</p>
                  <div className="mt-3 space-y-3">
                    {selectedTask.history.map((entry) => (
                      <div className="border-b border-[#EFF2F6] pb-3 last:border-b-0 last:pb-0" key={entry.id}>
                        <p className="text-sm font-medium text-[#1E293B]">
                          {entry.old_status ?? 'Created'} to {entry.new_status}
                        </p>
                        <p className="mt-1 text-xs text-[#8A99B0]">
                          {entry.updatedBy?.name ?? entry.updatedByName ?? 'System'} •{' '}
                          {formatDateTime(entry.updated_at)}
                        </p>
                        {entry.comment ? (
                          <p className="mt-1 text-sm text-[#36506C]">{entry.comment}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {error ? <p className="text-sm text-[#C13F3A]">{error}</p> : null}
            </form>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

export default AssignedTasks;
