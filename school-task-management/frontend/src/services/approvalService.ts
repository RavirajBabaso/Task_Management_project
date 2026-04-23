import { API_ENDPOINTS } from '../constants/apiEndpoints';
import api from './api';

interface Approval {
  id: number;
  type: 'BUDGET' | 'PURCHASE' | 'POLICY' | 'EVENT';
  title: string;
  details?: string;
  amount?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_by: number;
  approved_by?: number;
  created_at: string;
  requestedBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  approvedBy?: {
    id: number;
    name: string;
  };
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export const getAllApprovals = async (status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<Approval[]> => {
  const response = await api.get<ApiResponse<Approval[]>>(API_ENDPOINTS.approvals.list, {
    params: status ? { status } : undefined
  });
  return response.data.data;
};

export const approveApproval = async (id: number): Promise<Approval> => {
  const response = await api.put<ApiResponse<Approval>>(API_ENDPOINTS.approvals.process(id), {
    status: 'APPROVED'
  });
  return response.data.data;
};

export const rejectApproval = async (id: number): Promise<Approval> => {
  const response = await api.put<ApiResponse<Approval>>(API_ENDPOINTS.approvals.process(id), {
    status: 'REJECTED'
  });
  return response.data.data;
};

export const getApprovalById = async (id: number): Promise<Approval> => {
  const response = await api.get<ApiResponse<Approval>>(API_ENDPOINTS.approvals.detail(id));
  return response.data.data;
};