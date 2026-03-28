import { AppLayout } from '@/components/AppLayout';
import { BrutalCard } from '@/components/BrutalCard';
import { StatusBadge } from '@/components/StatusBadge';
import { mockApprovals } from '@/data/mockData';
import { ArrowRight } from 'lucide-react';

const WORKFLOW_STEPS = ['Clerk Upload', 'Staff/HOD Review', 'Principal Approval', 'Authority Verification', 'Approved'];

const ApprovalsPage = () => {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold uppercase">Approvals Workflow</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Track and manage document approval pipeline
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

        {/* Pending Approvals */}
        <div className="space-y-4">
          {mockApprovals.map(approval => (
            <BrutalCard key={approval.id} flat>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{approval.documentName}</h3>
                  <p className="text-sm text-muted-foreground">{approval.instituteName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted by <span className="font-bold">{approval.submittedBy}</span> on {approval.submittedDate}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <StatusBadge status={approval.status} />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Step: {approval.currentStep}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="brutal-button !py-2 !px-4 !text-xs">
                    Approve
                  </button>
                  <button className="brutal-button !py-2 !px-4 !text-xs !bg-destructive">
                    Reject
                  </button>
                </div>
              </div>
            </BrutalCard>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default ApprovalsPage;
