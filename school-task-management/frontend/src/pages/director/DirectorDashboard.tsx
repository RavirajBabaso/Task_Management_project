function DirectorDashboard() {
  return (
    <main className="min-h-screen bg-[#F1F4F9] text-[#1E293B]">
      <header className="border-b border-[#EFF2F6] bg-white px-6 py-5">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase text-[#185FA5]">Director</p>
          <h1 className="mt-1 text-2xl font-bold">Director Dashboard</h1>
          <p className="mt-2 text-[#5B6E8C]">Track department updates, delayed tasks, and reporting flow.</p>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-6 md:grid-cols-2">
        <article className="rounded-lg border border-[#EFF2F6] bg-white p-5">
          <h2 className="text-lg font-semibold">Task Updates</h2>
          <p className="mt-2 text-sm leading-6 text-[#5B6E8C]">Live task activity will appear here.</p>
        </article>
        <article className="rounded-lg border border-[#EFF2F6] bg-white p-5">
          <h2 className="text-lg font-semibold">Department Health</h2>
          <p className="mt-2 text-sm leading-6 text-[#5B6E8C]">Performance summaries are ready for integration.</p>
        </article>
      </section>
    </main>
  );
}

export default DirectorDashboard;
