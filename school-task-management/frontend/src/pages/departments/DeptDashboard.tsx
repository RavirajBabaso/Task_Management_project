import { Route, Routes } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import Announcements from './Announcements';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Badge from '../../components/common/Badge';
import AssignedTasks from './AssignedTasks';
import DeptOverview from './DeptOverview';

function DepartmentPage({
  text,
  title
}: {
  text: string;
  title: string;
}) {
  return (
    <section className="space-y-5 p-5">
      <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
        <Badge variant="blue">Department Workspace</Badge>
        <h2 className="mt-3 text-2xl font-semibold text-[#1E293B]">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5B6E8C]">{text}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {['Daily focus', 'Latest updates'].map((item) => (
          <article className="rounded-[18px] border border-[#EFF2F6] bg-white p-5" key={item}>
            <p className="text-sm font-semibold text-[#1E293B]">{item}</p>
            <p className="mt-2 text-sm leading-6 text-[#5B6E8C]">
              Department-head routes are now wrapped in the shared shell and ready for data wiring.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function DeptDashboard() {
  useSocket();

  return (
    <div className="flex min-h-screen bg-[#F1F4F9] text-[#1E293B]">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Navbar />
        <Routes>
          <Route
            index
            element={<DeptOverview />}
          />
          <Route
            element={<AssignedTasks />}
            path="my-tasks"
          />
          <Route
            element={
              <DepartmentPage
                text="Track the latest operational notifications and system-generated reminders."
                title="Notifications"
              />
            }
            path="notifications"
          />
          <Route
            element={<Announcements />}
            path="announcements"
          />
        </Routes>
      </main>
    </div>
  );
}

export default DeptDashboard;
