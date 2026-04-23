import { API_ENDPOINTS } from '../constants/apiEndpoints';
import api from './api';

interface ReportParams {
  dateFrom: string;
  dateTo: string;
  departmentId?: number;
}

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

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export const getDailyReport = async (params: ReportParams) => {
  const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.reports.daily, {
    params: {
      date_from: params.dateFrom,
      date_to: params.dateTo,
      department_id: params.departmentId
    }
  });
  return response.data.data;
};

export const getWeeklyReport = async (params: ReportParams) => {
  const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.reports.weekly, {
    params: {
      date_from: params.dateFrom,
      date_to: params.dateTo,
      department_id: params.departmentId
    }
  });
  return response.data.data;
};

export const getMonthlyReport = async (params: ReportParams) => {
  const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.reports.monthly, {
    params: {
      date_from: params.dateFrom,
      date_to: params.dateTo,
      department_id: params.departmentId
    }
  });
  return response.data.data;
};

export const downloadReport = async (id: number, format: 'pdf' | 'excel') => {
  const response = await api.get(API_ENDPOINTS.reports.download(id, format), {
    responseType: 'blob'
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `report-${id}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getReportHistory = async (): Promise<ReportHistoryItem[]> => {
  const response = await api.get<ApiResponse<ReportHistoryItem[]>>(API_ENDPOINTS.reports.history);
  return response.data.data;
};

export const exportDailyReportPdf = async () => {
  const response = await api.get(API_ENDPOINTS.reports.daily, {
    params: { format: 'pdf' },
    responseType: 'blob'
  });

  return response.data as Blob;
};
