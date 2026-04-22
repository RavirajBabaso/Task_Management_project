import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import TaskTable from '../../components/tables/TaskTable';
import { DEPARTMENT_HEAD_ROLES } from '../../constants/roles';
import * as taskService from '../../services/taskService';
import * as userService from '../../services/userService';
import { setUsers } from '../../store/userSlice';
import { addTask, setTasks } from '../../store/taskSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { CreateTaskPayload, TaskStatus } from '../../types/task.types';

const statusTabs: Array<{ label: string; value: TaskStatus | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Delayed', value: 'DELAYED' }
];

const initialForm: CreateTaskPayload = {
  title: '',
  description: '',
  assigned_to: 0,
  priority: 'MEDIUM',
  start_date: '',
  due_date: ''
};

function TaskAssignment() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const users = useAppSelector((state) => state.users.users);
  const [activeStatus, setActiveStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [file, setFile] = useState<File | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateTaskPayload>(initialForm);

  const taskQuery = useQuery({
    queryKey: ['tasks', 'chairman-assignment'],
    queryFn: () => taskService.getAllTasks()
  });

  const usersQuery = useQuery({
    queryKey: ['users', 'department-heads'],
    queryFn: () => userService.getAllUsers()
  });

  useEffect(() => {
    if (taskQuery.data) {
      dispatch(setTasks(taskQuery.data));
    }
  }, [dispatch, taskQuery.data]);

  useEffect(() => {
    if (usersQuery.data) {
      dispatch(setUsers(usersQuery.data));
    }
  }, [dispatch, usersQuery.data]);

  const departmentHeads = users.filter((user) => DEPARTMENT_HEAD_ROLES.includes(user.role));
  const filteredTasks =
    activeStatus === 'ALL' ? tasks : tasks.filter((task) => task.status === activeStatus);

  const handleChange = <K extends keyof CreateTaskPayload>(key: K, value: CreateTaskPayload[K]) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const createdTask = await taskService.createTask(form, file);
      dispatch(addTask(createdTask));
      setForm(initialForm);
      setFile(undefined);
    } catch {
      setError('Unable to create task right now. Please verify the form and try again.');
    }
  };

  return (
    <section className="grid gap-5 p-5 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#185FA5]">
            Tasks Module
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#1E293B]">Create new task</h2>
          <p className="mt-2 text-sm leading-6 text-[#5B6E8C]">
            Dispatch work to department heads with due dates, priority, and supporting files.
          </p>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Task title"
            onChange={(event) => handleChange('title', event.target.value)}
            placeholder="Enter task title"
            required
            value={form.title}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[#36506C]">Description</span>
            <textarea
              className="min-h-[104px] rounded-[10px] border-[0.5px] border-[#DCE2EA] bg-[#F8F9FC] px-3 py-2.5 text-sm text-[#1E293B] outline-none transition placeholder:text-[#8A99B0] focus:border-[#185FA5] focus:ring-4 focus:ring-[#185FA5]/10"
              onChange={(event) => handleChange('description', event.target.value)}
              placeholder="Describe the task scope and expected outcome"
              value={form.description ?? ''}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[#36506C]">Assign to</span>
            <select
              className="min-h-[38px] rounded-[10px] border-[0.5px] border-[#DCE2EA] bg-[#F8F9FC] px-3 text-sm text-[#1E293B] outline-none focus:border-[#185FA5] focus:ring-4 focus:ring-[#185FA5]/10"
              onChange={(event) => {
                const selectedUser = departmentHeads.find(
                  (user) => user.id === Number(event.target.value)
                );
                handleChange('assigned_to', Number(event.target.value));
                handleChange('department_id', selectedUser?.department_id ?? null);
              }}
              required
              value={form.assigned_to || ''}
            >
              <option value="">Select department head</option>
              {departmentHeads.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-[#36506C]">Priority</span>
              <select
                className="min-h-[38px] rounded-[10px] border-[0.5px] border-[#DCE2EA] bg-[#F8F9FC] px-3 text-sm text-[#1E293B] outline-none focus:border-[#185FA5] focus:ring-4 focus:ring-[#185FA5]/10"
                onChange={(event) =>
                  handleChange('priority', event.target.value as CreateTaskPayload['priority'])
                }
                value={form.priority}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </label>

            <Input
              label="Start date"
              onChange={(event) => handleChange('start_date', event.target.value)}
              required
              type="date"
              value={form.start_date}
            />
          </div>

          <Input
            label="Due date"
            onChange={(event) => handleChange('due_date', event.target.value)}
            required
            type="date"
            value={form.due_date}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[#36506C]">Attachment</span>
            <input
              accept=".pdf,.docx,.jpg,.jpeg,.png"
              className="min-h-[38px] rounded-[10px] border-[0.5px] border-dashed border-[#C9D6E5] bg-[#F8F9FC] px-3 py-2 text-sm text-[#36506C] file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#185FA5]"
              onChange={(event) => setFile(event.target.files?.[0])}
              type="file"
            />
          </label>

          {error ? <p className="text-sm text-[#C13F3A]">{error}</p> : null}

          <Button
            className="w-full justify-center"
            loading={taskQuery.isFetching && tasks.length === 0}
            type="submit"
          >
            Submit task
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#185FA5]">
                Assignment Queue
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#1E293B]">Active task queue</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {statusTabs.map((tab) => (
                <button
                  className={[
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                    activeStatus === tab.value
                      ? 'bg-[#185FA5] text-white'
                      : 'bg-[#F3F6FA] text-[#5B6E8C] hover:bg-[#E7EDF4]'
                  ].join(' ')}
                  key={tab.value}
                  onClick={() => setActiveStatus(tab.value)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <TaskTable
          emptyMessage="Newly assigned tasks will appear here."
          onRowClick={(task) => navigate(`/task/${task.id}`)}
          tasks={filteredTasks.filter((task) => task.status !== 'COMPLETED')}
        />
      </div>
    </section>
  );
}

export default TaskAssignment;
