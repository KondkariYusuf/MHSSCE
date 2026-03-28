import { AppLayout } from '@/components/AppLayout';
import { BrutalCard } from '@/components/BrutalCard';
import { mockInstitutes } from '@/data/mockData';
import { Building2 } from 'lucide-react';

const InstitutesPage = () => {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold uppercase">Institutes</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Manage compliance across {mockInstitutes.length} institutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockInstitutes.map(inst => (
            <BrutalCard key={inst.id}>
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground p-3 border-[2px] border-foreground">
                  <Building2 size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm leading-tight">{inst.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{inst.code} · {inst.type}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-muted p-3 border-[2px] border-foreground">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Documents</p>
                  <p className="text-2xl font-mono font-bold">{inst.totalDocuments}</p>
                </div>
                <div className="bg-muted p-3 border-[2px] border-foreground">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Compliance</p>
                  <p className={`text-2xl font-mono font-bold ${
                    inst.complianceScore >= 80 ? 'text-status-valid' :
                    inst.complianceScore >= 60 ? 'text-status-expiring' :
                    'text-status-expired'
                  }`}>{inst.complianceScore}%</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">📍 {inst.location}</p>
            </BrutalCard>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default InstitutesPage;
