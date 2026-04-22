import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import * as taskService from '../../services/taskService';
import type { Task } from '../../types/task.types';

function isCritical(task: Task) {
  return task.status === 'ESCALATED' || task.priority === 'HIGH';
}

function formatPath(task: Task) {
  return `Sub-head -> School Manager -> Chairman${task.department?.name ? ` • ${task.department.name}` : ''}`;
}

function AlertsEscalations() {
  const queryClient = useQueryClient();
  const alertsQuery = useQuery({
    queryKey: ['tasks', 'alerts-feed'],
    queryFn: () => taskService.getAllTasks({ status: 'DELAYED,ESCALATED' })
  });

  const resolveMutation = useMutation({
    mutationFn: (taskId: number) => taskService.updateTask(taskId, { status: 'IN_PROGRESS' }),
    onSuccess: async () => {
      toast.success('Alert resolved and task moved to in progress.');
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const metrics = useMemo(() => {
    const tasks = alertsQuery.data ?? [];
    return {
      critical: tasks.filter((task) => task.status === 'ESCALATED').length,
      warnings: tasks.filter((task) => task.status === 'DELAYED').length,
      escalatedToYou: tasks.filter((task) => task.status === 'ESCALATED').length
    };
  }, [alertsQuery.data]);

  const alerts = alertsQuery.data ?? [];

  return (
    <section className="space-y-5 p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[20px] border border-[#F2D1CF] bg-white p-5">
          <p className="text-sm font-semibold text-[#C13F3A]">Critical</p>
          <p className="mt-4 text-3xl font-semibold text-[#1E293B]">{metrics.critical}</p>
          <p className="mt-2 text-sm text-[#8A99B0]">Escalated tasks needing chairman attention.</p>
        </article>
        <article className="rounded-[20px] border border-[#F6E0AF] bg-white p-5">
          <p className="text-sm font-semibold text-[#A86A00]">Warnings</p>
          <p className="mt-4 text-3xl font-semibold text-[#1E293B]">{metrics.warnings}</p>
          <p className="mt-2 text-sm text-[#8A99B0]">Delayed tasks that may escalate next.</p>
        </article>
        <article className="rounded-[20px] border border-[#D7E7F7] bg-white p-5">
          <p className="text-sm font-semibold text-[#185FA5]">Escalated to you</p>
          <p className="mt-4 text-3xl font-semibold text-[#1E293B]">{metrics.escalatedToYou}</p>
          <p className="mt-2 text-sm text-[#8A99B0]">Workflow items already routed to your desk.</p>
        </article>
      </div>

      <article className="rounded-[22px] border border-[#EFF2F6] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#185FA5]">
              Alerts Module
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1E293B]">Alert & escalation feed</h2>
          </div>
          <Badge variant="gray">{alerts.length} live alerts</Badge>
        </div>

        <div className="mt-5 space-y-3">
          {alerts.length > 0 ? (
            alerts.map((task) => {
              const critical = isCritical(task);

              return (
                <div
                  className="flex flex-col gap-4 rounded-[18px] border border-[#EFF2F6] bg-[#FAFCFE] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                  key={task.id}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-1">
                      {critical ? (
                        <span className="block h-3.5 w-3.5 rounded-full bg-[#D64545]" />
                      ) : (
                        <span className="block h-0 w-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-[#D89B17]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1E293B]">{task.title}</p>
                      <p className="mt-1 text-sm text-[#5B6E8C]">{formatPath(task)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={critical ? 'red' : 'amber'}>
                      {critical ? 'Critical' : 'Warning'}
                    </Badge>
                    <Button
                      loading={resolveMutation.isPending}
                      onClick={() => void resolveMutation.mutateAsync(task.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[16px] border border-dashed border-[#D7E1EC] bg-[#FAFCFE] px-4 py-10 text-center text-sm text-[#8A99B0]">
              No delayed or escalated tasks are active right now.
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

export default AlertsEscalations;
