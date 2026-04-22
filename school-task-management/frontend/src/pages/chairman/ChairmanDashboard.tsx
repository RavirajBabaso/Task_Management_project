import { Route, Routes } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Badge from '../../components/common/Badge';
import AlertsEscalations from './AlertsEscalations';
import AnnouncementsPage from './AnnouncementsPage';
import TaskAssignment from './TaskAssignment';
import TaskMonitoring from './TaskMonitoring';
import ChairmanOverview from './ChairmanOverview';

function ChairmanPage({
  eyebrow,
  text,
  title
}: {
  eyebrow: string;
  text: string;
  title: string;
}) {
  return (
    <section className="space-y-5 p-5">
      <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#185FA5]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#1E293B]">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5B6E8C]">{text}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {['Operational visibility', 'Action queue', 'Department pulse'].map((item, index) => (
          <article className="rounded-[18px] border border-[#EFF2F6] bg-white p-5" key={item}>
            <Badge variant={index === 1 ? 'amber' : 'blue'}>{item}</Badge>
            <p className="mt-4 text-lg font-semibold text-[#1E293B]">{item}</p>
            <p className="mt-2 text-sm leading-6 text-[#5B6E8C]">
              Shared shell integration is ready for live dashboard widgets and tables.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ChairmanDashboard() {
  useSocket();

  return (
    <div className="flex min-h-screen bg-[#F1F4F9] text-[#1E293B]">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Navbar />
        <Routes>
          <Route
            index
            element={<ChairmanOverview />}
          />
          <Route
            element={<TaskAssignment />}
            path="task-assignment"
          />
          <Route
            element={<TaskMonitoring />}
            path="task-monitor"
          />
          <Route
            element={<AlertsEscalations />}
            path="alerts"
          />
          <Route
            element={
              <ChairmanPage
                eyebrow="Governance"
                text="Manage decisions that require executive approval and move blockers forward quickly."
                title="Approvals"
              />
            }
            path="approvals"
          />
          <Route
            element={
              <ChairmanPage
                eyebrow="Reporting"
                text="Use MIS reporting views to summarize completion health, delays, and departmental throughput."
                title="MIS Reports"
              />
            }
            path="reports"
          />
          <Route
            element={<AnnouncementsPage />}
            path="announcements"
          />
          <Route
            element={
              <ChairmanPage
                eyebrow="Administration"
                text="Manage staff access, users, and operational ownership across the system."
                title="User Management"
              />
            }
            path="users"
          />
          <Route
            element={
              <ChairmanPage
                eyebrow="Analytics"
                text="Review department performance and completion health across institutional workflows."
                title="Performance"
              />
            }
            path="performance"
          />
        </Routes>
      </main>
    </div>
  );
}

export default ChairmanDashboard;
