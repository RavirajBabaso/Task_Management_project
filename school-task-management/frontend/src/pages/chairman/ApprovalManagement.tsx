import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllApprovals, approveApproval, rejectApproval } from '../../services/approvalService';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

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

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getDepartmentColor = (type: string) => {
  const colors = {
    BUDGET: 'bg-blue-500',
    PURCHASE: 'bg-green-500',
    POLICY: 'bg-purple-500',
    EVENT: 'bg-orange-500'
  };
  return colors[type as keyof typeof colors] || 'bg-gray-500';
};

function ApprovalManagement() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const queryClient = useQueryClient();

  const { data: approvals, isLoading } = useQuery({
    queryKey: ['approvals', activeTab],
    queryFn: () => getAllApprovals(activeTab === 'ALL' ? undefined : activeTab)
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveApproval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast.success('Approval granted successfully');
    },
    onError: () => {
      toast.error('Failed to approve request');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectApproval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast.success('Approval rejected');
    },
    onError: () => {
      toast.error('Failed to reject request');
    }
  });

  const filteredApprovals = approvals?.filter(approval => {
    if (activeTab === 'ALL') return true;
    return approval.status === activeTab;
  }) || [];

  // Calculate KPI counts
  const pendingCount = approvals?.filter(a => a.status === 'PENDING').length || 0;
  const approvedCount = approvals?.filter(a => a.status === 'APPROVED').length || 0;
  const rejectedCount = approvals?.filter(a => a.status === 'REJECTED').length || 0;

  const budgetCount = approvals?.filter(a => a.type === 'BUDGET' && a.status === 'PENDING').length || 0;
  const purchaseCount = approvals?.filter(a => a.type === 'PURCHASE' && a.status === 'PENDING').length || 0;
  const policyCount = approvals?.filter(a => a.type === 'POLICY' && a.status === 'PENDING').length || 0;
  const eventCount = approvals?.filter(a => a.type === 'EVENT' && a.status === 'PENDING').length || 0;

  const formatAmount = (amount?: string) => {
    if (!amount) return '';
    return `₹${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{budgetCount}</div>
          <div className="text-sm text-[#5B6E8C]">Budget</div>
        </div>
        <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{purchaseCount}</div>
          <div className="text-sm text-[#5B6E8C]">Purchase</div>
        </div>
        <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{policyCount}</div>
          <div className="text-sm text-[#5B6E8C]">Policy</div>
        </div>
        <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{eventCount}</div>
          <div className="text-sm text-[#5B6E8C]">Event</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="rounded-[20px] border border-[#EFF2F6] bg-white p-6">
        <div className="flex gap-4 mb-6">
          {[
            { key: 'ALL', label: 'All', count: approvals?.length || 0 },
            { key: 'PENDING', label: 'Pending', count: pendingCount },
            { key: 'APPROVED', label: 'Approved', count: approvedCount },
            { key: 'REJECTED', label: 'Rejected', count: rejectedCount }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === tab.key
                  ? 'bg-[#185FA5] text-white'
                  : 'bg-gray-100 text-[#5B6E8C] hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Approvals List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredApprovals.length > 0 ? (
            filteredApprovals.map((approval: Approval) => (
              <div
                key={approval.id}
                className="flex items-center justify-between p-4 border border-[#EFF2F6] rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getDepartmentColor(approval.type)}`}>
                    {getInitials(approval.requestedBy?.name || 'Unknown')}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1E293B]">{approval.title}</div>
                    <div className="text-sm text-[#5B6E8C]">
                      {approval.requestedBy?.name} • {formatAmount(approval.amount)} • {approval.type.toLowerCase()}
                    </div>
                    <div className="text-xs text-[#8A99B0]">
                      Submitted: {formatDate(approval.created_at)}
                    </div>
                  </div>
                </div>

                {approval.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => approveMutation.mutate(approval.id)}
                      disabled={approveMutation.isPending}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      {approveMutation.isPending ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => rejectMutation.mutate(approval.id)}
                      disabled={rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                )}

                {approval.status !== 'PENDING' && (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    approval.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {approval.status}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[#5B6E8C]">
              No {activeTab.toLowerCase()} approvals found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApprovalManagement;