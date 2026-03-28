import { AppLayout } from '@/components/AppLayout';
import { BrutalCard } from '@/components/BrutalCard';
import { mockDocuments, mockInstitutes } from '@/data/mockData';
import { CATEGORIES } from '@/data/types';

const ReportsPage = () => {
  const total = mockDocuments.length;
  const valid = mockDocuments.filter(d => d.status === 'valid').length;
  const expiring = mockDocuments.filter(d => d.status === 'expiring').length;
  const expired = mockDocuments.filter(d => d.status === 'expired').length;

  // Category breakdown
  const categoryStats = CATEGORIES.map(cat => {
    const docs = mockDocuments.filter(d => d.category === cat);
    return {
      category: cat,
      total: docs.length,
      valid: docs.filter(d => d.status === 'valid').length,
      expiring: docs.filter(d => d.status === 'expiring').length,
      expired: docs.filter(d => d.status === 'expired').length,
    };
  }).filter(c => c.total > 0);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold uppercase">Compliance Reports</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Summary of compliance status across all institutes
          </p>
        </div>

        {/* Overall Summary */}
        <BrutalCard flat className="mb-8">
          <h2 className="text-xl font-mono font-bold uppercase mb-4">Overall Compliance Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted p-4 border-[2px] border-foreground text-center">
              <p className="text-3xl font-mono font-bold">{total}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</p>
            </div>
            <div className="bg-[hsl(142,70%,92%)] p-4 border-[2px] border-foreground text-center">
              <p className="text-3xl font-mono font-bold text-status-valid">{valid}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Valid</p>
            </div>
            <div className="bg-[hsl(45,93%,90%)] p-4 border-[2px] border-foreground text-center">
              <p className="text-3xl font-mono font-bold text-status-expiring">{expiring}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expiring</p>
            </div>
            <div className="bg-[hsl(0,72%,93%)] p-4 border-[2px] border-foreground text-center">
              <p className="text-3xl font-mono font-bold text-status-expired">{expired}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expired</p>
            </div>
          </div>

          {/* Visual bar */}
          <div className="mt-4 flex h-8 border-[2px] border-foreground overflow-hidden">
            <div className="bg-status-valid h-full" style={{ width: `${(valid / total) * 100}%` }} />
            <div className="bg-status-expiring h-full" style={{ width: `${(expiring / total) * 100}%` }} />
            <div className="bg-status-expired h-full" style={{ width: `${(expired / total) * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>🟢 {Math.round((valid / total) * 100)}% Valid</span>
            <span>🟡 {Math.round((expiring / total) * 100)}% Expiring</span>
            <span>🔴 {Math.round((expired / total) * 100)}% Expired</span>
          </div>
        </BrutalCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Institute Health */}
          <BrutalCard flat>
            <h2 className="text-xl font-mono font-bold uppercase mb-4">Institute Health</h2>
            <div className="space-y-3">
              {mockInstitutes.map(inst => (
                <div key={inst.id} className="flex items-center justify-between border-b-2 border-muted pb-2">
                  <div>
                    <p className="font-bold text-sm">{inst.code}</p>
                    <p className="text-xs text-muted-foreground">{inst.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-4 bg-muted border-[2px] border-foreground overflow-hidden">
                      <div
                        className={`h-full ${
                          inst.complianceScore >= 80 ? 'bg-status-valid' :
                          inst.complianceScore >= 60 ? 'bg-status-expiring' :
                          'bg-status-expired'
                        }`}
                        style={{ width: `${inst.complianceScore}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-sm w-10 text-right">{inst.complianceScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </BrutalCard>

          {/* Category Breakdown */}
          <BrutalCard flat>
            <h2 className="text-xl font-mono font-bold uppercase mb-4">By Category</h2>
            <div className="space-y-3">
              {categoryStats.map(cat => (
                <div key={cat.category} className="border-b-2 border-muted pb-2">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm">{cat.category}</p>
                    <span className="font-mono text-sm">{cat.total} docs</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {cat.valid > 0 && <span className="status-valid !text-[10px]">{cat.valid} valid</span>}
                    {cat.expiring > 0 && <span className="status-expiring !text-[10px]">{cat.expiring} expiring</span>}
                    {cat.expired > 0 && <span className="status-expired !text-[10px]">{cat.expired} expired</span>}
                  </div>
                </div>
              ))}
            </div>
          </BrutalCard>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
