import { API_ENDPOINTS } from '../constants/apiEndpoints';
import api from './api';

export const exportDailyReportPdf = async () => {
  const response = await api.get(API_ENDPOINTS.reports.daily, {
    params: { format: 'pdf' },
    responseType: 'blob'
  });

  return response.data as Blob;
};
