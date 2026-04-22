import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Badge from '../../components/common/Badge';

function DirectorDashboard() {
  return (
    <div className="flex min-h-screen bg-[#F1F4F9] text-[#1E293B]">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Navbar />
        <section className="space-y-5 p-5">
          <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
            <Badge variant="blue">Director Overview</Badge>
            <h2 className="mt-3 text-2xl font-semibold text-[#1E293B]">Director Dashboard</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5B6E8C]">
              Track department updates, delayed tasks, and reporting flow within the same shared shell used across role-based dashboards.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-[18px] border border-[#EFF2F6] bg-white p-5">
              <p className="text-lg font-semibold text-[#1E293B]">Task Updates</p>
              <p className="mt-2 text-sm leading-6 text-[#5B6E8C]">
                Real-time updates can now sit under the shared top navigation and sidebar system.
              </p>
            </article>
            <article className="rounded-[18px] border border-[#EFF2F6] bg-white p-5">
              <p className="text-lg font-semibold text-[#1E293B]">Department Health</p>
              <p className="mt-2 text-sm leading-6 text-[#5B6E8C]">
                Summary metrics are ready to plug into the standardized dashboard frame.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DirectorDashboard;
