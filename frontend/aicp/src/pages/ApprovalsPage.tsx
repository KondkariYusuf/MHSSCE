import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { BrutalCard } from '@/components/BrutalCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Loader2, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

const WORKFLOW_STEPS = ['Clerk Upload', 'HOD Review', 'Principal Approval', 'Approved'];

interface ApprovalRow {
  id: string;
  document_id: string;
  reviewer_id: string | null;
  feedback: string | null;
  step: string;
  created_at: string;
  documents: {
    id: string;
    document_name: string;
    institute_id: string;
    uploader_id: string | null;
    status: string;
    institutes: { name: string } | null;
  } | null;
  users: { full_name: string } | null;
}

// Map step to a badge-compatible status
const stepToStatus = (step: string) => {
  switch (step) {
    case 'Principal Approved':
      return 'valid';
    case 'Rejected':
      return 'expired';
    default:
      return 'expiring';
  }
};

const ApprovalsPage = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const userRole = profile?.role ?? '';

  // Feedback state per document
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  // Fetch approvals from Supabase (RLS will auto-scope by institute)
  const {
    data: approvals = [],
    isLoading,
  } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approvals')
        .select('*, documents(id, document_name, institute_id, uploader_id, status, institutes(name)), users:reviewer_id(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as ApprovalRow[]) ?? [];
    },
  });

  // Submit approval/feedback mutation
  const submitMutation = useMutation({
    mutationFn: (payload: { documentId: string; feedback: string; action: string }) =>
      apiFetch('/api/approvals', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      setFeedbackMap({});
      setExpandedDoc(null);
    },
  });

  const handleAction = (documentId: string, action: 'feedback' | 'approve' | 'reject') => {
    const fb = feedbackMap[documentId] || '';
    if (!fb.trim()) {
      return; // Require feedback text
    }

    submitMutation.mutate({
      documentId,
      feedback: fb.trim(),
      action,
    });
  };

  // Group approvals by document for better display
  const uniqueDocIds = new Set<string>();
  const latestPerDoc: ApprovalRow[] = [];

  for (const approval of approvals) {
    if (!uniqueDocIds.has(approval.document_id)) {
      uniqueDocIds.add(approval.document_id);
      latestPerDoc.push(approval);
    }
  }

  // Get all feedback for a specific document
  const getFeedbackForDoc = (docId: string) => {
    return approvals.filter((a) => a.document_id === docId && a.feedback);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold uppercase">Approvals Workflow</h1>
          <p className="text-muted-foreground font-medium mt-1">
            {userRole === 'Admin'
              ? 'Overview of all document approvals across institutes'
              : 'Track and manage document approval pipeline'}
          </p>
        </div>

        {/* Workflow Visual */}
        <div className="mb-8 overflow-x-auto">
          <div
            className="bg-card border-[3px] border-foreground p-6 inline-flex items-center gap-2 min-w-max"
            style={{ boxShadow: '4px 4px 0px hsl(150 10% 10%)' }}
          >
            {WORKFLOW_STEPS.map((step, idx) => (
              <div key={step} className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground px-4 py-2 border-[2px] border-foreground text-xs font-bold uppercase tracking-wider">
                  {step}
                </div>
                {idx < WORKFLOW_STEPS.length - 1 && <ArrowRight className="text-foreground" size={20} />}
              </div>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin" size={24} />
              <p className="text-lg font-mono font-bold uppercase">Loading approvals...</p>
            </div>
          </div>
        )}

        {/* Approvals List */}
        {!isLoading && (
          <div className="space-y-4">
            {latestPerDoc.length === 0 && (
              <div className="text-center py-16 text-muted-foreground font-bold uppercase">
                No approvals found.
              </div>
            )}

            {latestPerDoc.map((approval) => {
              const docName = approval.documents?.document_name ?? 'Unknown Document';
              const instName = approval.documents?.institutes?.name ?? 'Unknown Institute';
              const reviewerName = approval.users?.full_name ?? 'System';
              const isExpanded = expandedDoc === approval.document_id;
              const docFeedback = getFeedbackForDoc(approval.document_id);
              const feedbackText = feedbackMap[approval.document_id] ?? '';

              return (
                <BrutalCard key={approval.id} flat>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{docName}</h3>
                      <p className="text-sm text-muted-foreground">{instName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last reviewed by <span className="font-bold">{reviewerName}</span> on{' '}
                        {new Date(approval.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <StatusBadge status={stepToStatus(approval.step) as 'valid' | 'expiring' | 'expired'} />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Step: {approval.step}
                      </span>
                    </div>

                    {/* Action buttons based on role */}
                    <div className="flex gap-2">
                      {(userRole === 'HOD' || userRole === 'Principal' || userRole === 'Admin') &&
                        approval.step !== 'Principal Approved' &&
                        approval.step !== 'Rejected' && (
                          <button
                            className="brutal-button !py-2 !px-4 !text-xs"
                            onClick={() =>
                              setExpandedDoc(isExpanded ? null : approval.document_id)
                            }
                          >
                            <MessageSquare size={14} className="mr-1 inline" />
                            {isExpanded ? 'Close' : 'Review'}
                          </button>
                        )}
                    </div>
                  </div>

                  {/* Expanded Review Panel */}
                  {isExpanded && (
                    <div className="mt-4 border-t-[3px] border-foreground/20 pt-4 space-y-4">
                      {/* Previous Feedback */}
                      {docFeedback.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Previous Feedback
                          </h4>
                          <div className="space-y-2">
                            {docFeedback.map((fb) => (
                              <div
                                key={fb.id}
                                className="bg-muted border-[2px] border-foreground/20 p-3"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold">
                                    {fb.users?.full_name ?? 'Unknown'}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(fb.created_at).toLocaleDateString()} · {fb.step}
                                  </span>
                                </div>
                                <p className="text-sm">{fb.feedback}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback Input */}
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider block mb-2">
                          Your Feedback
                        </label>
                        <textarea
                          value={feedbackText}
                          onChange={(e) =>
                            setFeedbackMap((prev) => ({
                              ...prev,
                              [approval.document_id]: e.target.value,
                            }))
                          }
                          placeholder="Enter your review comments..."
                          rows={3}
                          className="brutal-input"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {/* HOD: Only feedback */}
                        {userRole === 'HOD' && (
                          <button
                            onClick={() => handleAction(approval.document_id, 'feedback')}
                            disabled={submitMutation.isPending || !feedbackText.trim()}
                            className="brutal-button !py-2 !px-4 !text-xs disabled:opacity-50"
                          >
                            <MessageSquare size={14} className="mr-1 inline" />
                            Submit Feedback
                          </button>
                        )}

                        {/* Principal / Admin: Approve, Reject, or Feedback */}
                        {(userRole === 'Principal' || userRole === 'Admin') && (
                          <>
                            <button
                              onClick={() => handleAction(approval.document_id, 'approve')}
                              disabled={submitMutation.isPending || !feedbackText.trim()}
                              className="brutal-button !py-2 !px-4 !text-xs disabled:opacity-50"
                            >
                              <CheckCircle size={14} className="mr-1 inline" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(approval.document_id, 'reject')}
                              disabled={submitMutation.isPending || !feedbackText.trim()}
                              className="brutal-button !py-2 !px-4 !text-xs !bg-destructive disabled:opacity-50"
                            >
                              <XCircle size={14} className="mr-1 inline" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleAction(approval.document_id, 'feedback')}
                              disabled={submitMutation.isPending || !feedbackText.trim()}
                              className="brutal-button !py-2 !px-4 !text-xs !bg-secondary !text-secondary-foreground disabled:opacity-50"
                            >
                              <MessageSquare size={14} className="mr-1 inline" />
                              Feedback Only
                            </button>
                          </>
                        )}
                      </div>

                      {submitMutation.isError && (
                        <p className="text-sm font-bold text-[hsl(0,70%,40%)]">
                          {submitMutation.error?.message ?? 'Failed to submit'}
                        </p>
                      )}
                    </div>
                  )}
                </BrutalCard>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ApprovalsPage;
