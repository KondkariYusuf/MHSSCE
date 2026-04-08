import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { BrutalCard } from '@/components/BrutalCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Building2, Plus, Loader2 } from 'lucide-react';

interface InstituteStats {
  id: string;
  name: string;
  code: string;
  totalDocuments: number;
  validDocuments: number;
  complianceScore: number;
}

const InstitutesPage = () => {
  const queryClient = useQueryClient();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch institute stats
  const {
    data: stats = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['institute-stats'],
    queryFn: () => apiFetch<InstituteStats[]>('/api/institutes/stats'),
  });

  // Create institute mutation
  const createMutation = useMutation({
    mutationFn: (payload: { name: string; code: string }) =>
      apiFetch('/api/institutes', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institute-stats'] });
      setNewName('');
      setNewCode('');
      setShowForm(false);
      setFormError(null);
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newName.trim() || !newCode.trim()) {
      setFormError('Name and code are required.');
      return;
    }

    createMutation.mutate({ name: newName.trim(), code: newCode.trim().toUpperCase() });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-mono font-bold uppercase">Institutes</h1>
            <p className="text-muted-foreground font-medium mt-1">
              Manage compliance across {stats.length} institutes
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="brutal-button !py-2 !px-4 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Institute
          </button>
        </div>

        {/* Add Institute Form */}
        {showForm && (
          <BrutalCard flat className="mb-6">
            <h2 className="text-lg font-mono font-bold uppercase mb-4">New Institute</h2>

            {formError && (
              <div className="bg-[hsl(0,70%,92%)] border-[3px] border-foreground p-3 mb-4">
                <p className="text-sm font-bold text-[hsl(0,70%,30%)]">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                  Institute Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="e.g. M.H. Saboo Siddik College"
                  className="brutal-input"
                />
              </div>
              <div>
                <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                  Code
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  required
                  placeholder="e.g. MHSSCE"
                  className="brutal-input"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="brutal-button w-full disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create →'}
                </button>
              </div>
            </form>
          </BrutalCard>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin" size={24} />
              <p className="text-lg font-mono font-bold uppercase">Loading institutes...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[hsl(0,70%,92%)] border-[3px] border-foreground p-4 mb-6">
            <p className="font-bold text-sm text-[hsl(0,70%,30%)]">
              Failed to load institutes: {(error as Error).message}
            </p>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && stats.length > 0 && (
          <div
            className="border-[3px] border-foreground overflow-x-auto"
            style={{ boxShadow: '4px 4px 0px hsl(150 10% 10%)' }}
          >
            <table className="w-full">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider border-r-2 border-foreground/30">
                    Institute
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider border-r-2 border-foreground/30">
                    Code
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider border-r-2 border-foreground/30">
                    Total Docs
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider border-r-2 border-foreground/30">
                    Valid Docs
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider">
                    Compliance
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.map((inst, idx) => (
                  <tr
                    key={inst.id}
                    className={`${
                      idx % 2 === 0 ? 'bg-card' : 'bg-muted/50'
                    } border-t-2 border-foreground/20`}
                  >
                    <td className="px-4 py-3 border-r-2 border-foreground/10">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-primary-foreground p-2 border-[2px] border-foreground">
                          <Building2 size={16} />
                        </div>
                        <span className="font-bold text-sm">{inst.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono font-bold border-r-2 border-foreground/10">
                      {inst.code}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-lg border-r-2 border-foreground/10">
                      {inst.totalDocuments}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-lg border-r-2 border-foreground/10">
                      {inst.validDocuments}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-3 bg-muted border-[2px] border-foreground overflow-hidden">
                          <div
                            className={`h-full ${
                              inst.complianceScore >= 80
                                ? 'bg-status-valid'
                                : inst.complianceScore >= 60
                                ? 'bg-status-expiring'
                                : 'bg-status-expired'
                            }`}
                            style={{ width: `${inst.complianceScore}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono font-bold text-sm ${
                            inst.complianceScore >= 80
                              ? 'text-status-valid'
                              : inst.complianceScore >= 60
                              ? 'text-status-expiring'
                              : 'text-status-expired'
                          }`}
                        >
                          {inst.complianceScore}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && stats.length === 0 && !error && (
          <div className="text-center py-16">
            <Building2 className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="font-bold text-lg text-muted-foreground uppercase">
              No institutes found
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Add Institute" to create one.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default InstitutesPage;
