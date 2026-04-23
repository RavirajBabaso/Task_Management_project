import { useQuery } from '@tanstack/react-query';
import { getStaffPerformance, getMonthlyComparison } from '../../services/dashboardService';
import PerformanceChart from '../../components/charts/PerformanceChart';

interface PerformanceData {
  userId: number;
  name: string;
  role: string;
  totalTasks: number;
  completedTasks: number;
  delayedTasks: number;
  performanceScore: number;
  delayRate: number;
}

interface MonthlyData {
  month: string;
  completionRate: number;
}

function PerformanceAnalytics() {
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['staffPerformance'],
    queryFn: getStaffPerformance
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthlyComparison'],
    queryFn: getMonthlyComparison
  });

  if (performanceLoading || monthlyLoading) {
    return <div className="p-6">Loading...</div>;
  }

  // Calculate KPIs
  const totalUsers = performanceData?.length || 0;
  const totalTasks = performanceData?.reduce((sum, user) => sum + user.totalTasks, 0) || 0;
  const totalCompleted = performanceData?.reduce((sum, user) => sum + user.completedTasks, 0) || 0;
  const totalDelayed = performanceData?.reduce((sum, user) => sum + user.delayedTasks, 0) || 0;

  const schoolAvg = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const delayRate = totalTasks > 0 ? Math.round((totalDelayed / totalTasks) * 100) : 0;

  const topPerformer = performanceData?.reduce((top, user) =>
    user.performanceScore > top.performanceScore ? user : top
  );

  // Prepare chart data - aggregate all departments for 6-month view
  const chartData: MonthlyData[] = [];
  if (monthlyData && monthlyData.length > 0) {
    // Get unique months
    const months = new Set<string>();
    monthlyData.forEach(dept => {
      dept.monthlyRates.forEach(rate => months.add(rate.month));
    });

    Array.from(months).sort().forEach(month => {
      const monthRates = monthlyData.flatMap(dept =>
        dept.monthlyRates.filter(rate => rate.month === month)
      );
      const totalTasks = monthRates.reduce((sum, rate) => sum + rate.totalTasks, 0);
      const totalCompleted = monthRates.reduce((sum, rate) => sum + rate.completedTasks, 0);
      const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

      chartData.push({
        month,
        completionRate
      });
    });
  }

  return (
    <div className="space-y-6 p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">👤</span>
            </div>
            <div>
              <p className="text-sm text-[#5B6E8C]">Top performer</p>
              <p className="text-xl font-semibold text-[#1E293B]">
                {topPerformer?.name || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">📊</span>
            </div>
            <div>
              <p className="text-sm text-[#5B6E8C]">School avg</p>
              <p className="text-xl font-semibold text-[#1E293B]">{schoolAvg}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">⚠️</span>
            </div>
            <div>
              <p className="text-sm text-[#5B6E8C]">Delay rate</p>
              <p className="text-xl font-semibold text-[#1E293B]">{delayRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
        <h2 className="text-xl font-semibold text-[#1E293B] mb-4">6-Month Completion Trend</h2>
        <PerformanceChart data={chartData} />
      </div>

      {/* Staff Performance Table */}
      <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
        <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Staff Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EFF2F6]">
                <th className="text-left py-3 px-4 font-medium text-[#5B6E8C]">Name</th>
                <th className="text-left py-3 px-4 font-medium text-[#5B6E8C]">Role</th>
                <th className="text-left py-3 px-4 font-medium text-[#5B6E8C]">Total tasks</th>
                <th className="text-left py-3 px-4 font-medium text-[#5B6E8C]">Completed</th>
                <th className="text-left py-3 px-4 font-medium text-[#5B6E8C]">Delayed</th>
                <th className="text-left py-3 px-4 font-medium text-[#5B6E8C]">Performance Score</th>
                <th className="text-left py-3 px-4 font-medium text-[#5B6E8C]">Delay Rate</th>
              </tr>
            </thead>
            <tbody>
              {performanceData?.map((user: PerformanceData) => (
                <tr
                  key={user.userId}
                  className={`border-b border-[#EFF2F6] ${
                    user.performanceScore >= 75
                      ? 'bg-green-50'
                      : user.performanceScore < 50
                      ? 'bg-red-50'
                      : ''
                  }`}
                >
                  <td className="py-3 px-4 text-[#1E293B]">{user.name}</td>
                  <td className="py-3 px-4 text-[#5B6E8C]">{user.role}</td>
                  <td className="py-3 px-4 text-[#1E293B]">{user.totalTasks}</td>
                  <td className="py-3 px-4 text-[#1E293B]">{user.completedTasks}</td>
                  <td className="py-3 px-4 text-[#1E293B]">{user.delayedTasks}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${user.performanceScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-[#1E293B]">{user.performanceScore}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#1E293B]">{user.delayRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PerformanceAnalytics;