function DeptDashboard() {
  return (
    <main className="min-h-screen bg-[#F1F4F9] text-[#1E293B]">
      <header className="border-b border-[#EFF2F6] bg-white px-6 py-5">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase text-[#185FA5]">Department</p>
          <h1 className="mt-1 text-2xl font-bold">Department Dashboard</h1>
          <p className="mt-2 text-[#5B6E8C]">Manage assigned tasks, announcements, and daily work updates.</p>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-6 md:grid-cols-2">
        <article className="rounded-lg border border-[#EFF2F6] bg-white p-5">
          <h2 className="text-lg font-semibold">Assigned Tasks</h2>
          <p className="mt-2 text-sm leading-6 text-[#5B6E8C]">Department workload will be listed here.</p>
        </article>
        <article className="rounded-lg border border-[#EFF2F6] bg-white p-5">
          <h2 className="text-lg font-semibold">Announcements</h2>
          <p className="mt-2 text-sm leading-6 text-[#5B6E8C]">Targeted notices will appear here.</p>
        </article>
      </section>
    </main>
  );
}

export default DeptDashboard;
