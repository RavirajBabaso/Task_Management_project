import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import TaskTable from '../../components/tables/TaskTable';
import * as taskService from '../../services/taskService';
import { setTasks } from '../../store/taskSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

function AssignedTasks() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);

  const tasksQuery = useQuery({
    queryKey: ['tasks', 'my-tasks'],
    queryFn: taskService.getMyTasks
  });

  useEffect(() => {
    if (tasksQuery.data) {
      dispatch(setTasks(tasksQuery.data));
    }
  }, [dispatch, tasksQuery.data]);

  return (
    <section className="space-y-5 p-5">
      <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#185FA5]">
          Department Tasks
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[#1E293B]">Assigned tasks</h2>
        <p className="mt-2 text-sm leading-6 text-[#5B6E8C]">
          Review your queue and open any task to inspect the full history timeline.
        </p>
      </div>

      <TaskTable
        emptyMessage="Tasks assigned to your department will appear here."
        onRowClick={(task) => navigate(`/task/${task.id}`)}
        tasks={tasks}
      />
    </section>
  );
}

export default AssignedTasks;
