import { ROLE_LABELS, ROLES } from '../../constants/roles';

function ChairmanDashboard() {
  return (
    <main className="min-h-screen bg-[#F1F4F9] text-[#1E293B]">
      <header className="border-b border-[#EFF2F6] bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-[#185FA5]">{ROLE_LABELS[ROLES.CHAIRMAN]}</p>
            <h1 className="mt-1 text-2xl font-bold">Chairman Dashboard</h1>
          </div>
          <div className="rounded-md border border-[#EFF2F6] bg-[#F8F9FC] px-4 py-2 text-sm text-[#5B6E8C]">
            Executive Overview
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-6 md:grid-cols-3">
        {['Task Monitoring', 'Approvals', 'MIS Reports'].map((item) => (
          <article key={item} className="rounded-lg border border-[#EFF2F6] bg-white p-5">
            <p className="text-sm text-[#8A99B0]">Workspace</p>
            <h2 className="mt-2 text-lg font-semibold">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-[#5B6E8C]">Ready for live school operations data.</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default ChairmanDashboard;
