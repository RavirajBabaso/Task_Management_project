import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportHistory, downloadReport } from '../../services/reportService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

interface ReportHistoryItem {
  id: number;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  department?: { id: number; name: string };
  dateFrom: string;
  dateTo: string;
  createdAt: string;
  pdfPath: string;
  excelPath: string;
}

const departments = [
  { id: 'all', name: 'All departments' },
  { id: '1', name: 'IT Department' },
  { id: '2', name: 'HR Department' },
  { id: '3', name: 'Finance Department' },
  { id: '4', name: 'Operations Department' }
];

function MISReports() {
  const [reportType, setReportType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [departmentId, setDepartmentId] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const queryClient = useQueryClient();

  const { data: reportHistory, isLoading } = useQuery({
    queryKey: ['reportHistory'],
    queryFn: getReportHistory
  });

  const downloadMutation = useMutation({
    mutationFn: ({ id, format }: { id: number; format: 'pdf' | 'excel' }) =>
      downloadReport(id, format),
    onSuccess: () => {
      toast.success('Report downloaded successfully');
    },
    onError: () => {
      toast.error('Failed to download report');
    }
  });

  const handleGenerateReport = (format: 'pdf' | 'excel') => {
    if (!dateFrom || !dateTo) {
      toast.error('Please select date range');
      return;
    }

    // Here we would call the appropriate report generation endpoint
    // For now, just show a success message
    toast.success(`${reportType} ${format.toUpperCase()} report generation started`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
        <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Generate Report</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-[#36506C] mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY')}
              className="w-full min-h-[38px] rounded-[10px] border border-[#DCE2EA] bg-[#F8F9FC] px-3 text-sm text-[#1E293B] outline-none focus:border-[#185FA5] focus:ring-4 focus:ring-[#185FA5]/10"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#36506C] mb-2">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full min-h-[38px] rounded-[10px] border border-[#DCE2EA] bg-[#F8F9FC] px-3 text-sm text-[#1E293B] outline-none focus:border-[#185FA5] focus:ring-4 focus:ring-[#185FA5]/10"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              type="date"
              label="Date From"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <Input
              type="date"
              label="Date To"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleGenerateReport('pdf')}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Export PDF
          </Button>
          <Button
            onClick={() => handleGenerateReport('excel')}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Export Excel
          </Button>
        </div>
      </div>

      <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
        <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Recent Reports</h2>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : reportHistory && reportHistory.length > 0 ? (
          <div className="space-y-3">
            {reportHistory.map((report: ReportHistoryItem) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-[#EFF2F6] rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-[#1E293B]">
                    {report.type} Report
                  </div>
                  <div className="text-sm text-[#5B6E8C]">
                    {report.department?.name || 'All Departments'} • {formatDate(report.dateFrom)} - {formatDate(report.dateTo)}
                  </div>
                  <div className="text-xs text-[#8A99B0]">
                    Generated: {formatDate(report.createdAt)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadMutation.mutate({ id: report.id, format: 'pdf' })}
                    disabled={downloadMutation.isPending}
                  >
                    📄 PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadMutation.mutate({ id: report.id, format: 'excel' })}
                    disabled={downloadMutation.isPending}
                  >
                    📊 Excel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#5B6E8C]">
            No reports generated yet
          </div>
        )}
      </div>
    </div>
  );
}

export default MISReports;