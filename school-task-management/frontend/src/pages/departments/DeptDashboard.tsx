import { Route, Routes } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Badge from '../../components/common/Badge';

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
  return (
    <div className="flex min-h-screen bg-[#F1F4F9] text-[#1E293B]">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Navbar />
        <Routes>
          <Route
            index
            element={
              <DepartmentPage
                text="Manage assigned work, progress updates, and day-to-day departmental execution from one place."
                title="Department Dashboard"
              />
            }
          />
          <Route
            element={
              <DepartmentPage
                text="Review assigned items, due dates, and completion expectations for your team."
                title="My Tasks"
              />
            }
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
            element={
              <DepartmentPage
                text="Read targeted announcements and institution-wide communication updates."
                title="Announcements"
              />
            }
            path="announcements"
          />
        </Routes>
      </main>
    </div>
  );
}

export default DeptDashboard;
