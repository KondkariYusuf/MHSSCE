import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { CATEGORIES } from "@/data/types";
import { Search, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RenewModal } from "@/components/RenewModal";
import { apiFetch } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const getDaysUntilExpiry = (expiryDateIso: string) => {
  const today = new Date();
  const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const expiry = new Date(expiryDateIso).getTime();
  return Math.floor((expiry - utcToday) / MS_PER_DAY);
};

// DB row shape
interface DocumentRow {
  id: string;
  institute_id: string;
  document_name: string;
  category: string;
  responsible_person: string;
  expiry_date: string;
  file_path: string;
  status: "Valid" | "Expiring Soon" | "Near Expiration" | "Expired";
  created_at: string;
  institutes: { name: string } | null;
  document_renewals?: { id: string; status: string }[];
}

// Map DB status enum → frontend badge values
const normalizeStatus = (status: string): "valid" | "expiring" | "near_expiration" | "expired" => {
  switch (status) {
    case "Valid":
      return "valid";
    case "Expiring Soon":
      return "expiring";
    case "Near Expiration":
      return "near_expiration";
    case "Expired":
      return "expired";
    default:
      return "valid";
  }
};

const DocumentsPage = () => {
  const { user, profile } = useAuth();
  const isClerk = profile?.role === "Clerk";
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ id: string; name: string } | null>(null);

  const queryClient = useQueryClient();

  const handleOpenRenewModal = (id: string, name: string) => {
    setSelectedDoc({ id, name });
    setRenewModalOpen(true);
  };

  const {
    data: documents = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      // Fetch documents with their active renewals
      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          institutes(name),
          document_renewals(
            id,
            status
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as any[]) ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) =>
      apiFetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to completely delete "${name}"? This action cannot be undone and will delete all associated renewals and approvals.`)) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = documents.filter((doc) => {
    const instituteName = doc.institutes?.name ?? "";
    const matchSearch =
      doc.document_name.toLowerCase().includes(search.toLowerCase()) ||
      instituteName.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || doc.category === categoryFilter;
    const normalizedStatus = normalizeStatus(doc.status);
    const matchStatus =
      statusFilter === "all" || normalizedStatus === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold uppercase">Documents</h1>
          <p className="text-muted-foreground font-medium mt-1">
            All compliance documents across institutes
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="brutal-input pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="brutal-input"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="brutal-input"
          >
            <option value="all">All Status</option>
            <option value="valid">Valid</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin" size={24} />
              <p className="text-lg font-mono font-bold uppercase">
                Loading documents...
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-[hsl(0,70%,92%)] border-[3px] border-foreground p-4 mb-6">
            <p className="font-bold text-sm text-[hsl(0,70%,30%)]">
              Failed to load documents: {(error as Error).message}
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && (
          <div
            className="border-[3px] border-foreground overflow-x-auto"
            style={{ boxShadow: "4px 4px 0px hsl(150 10% 10%)" }}
          >
            <table className="w-full">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider border-r-2 border-foreground/30">
                    Document
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider border-r-2 border-foreground/30 hidden md:table-cell">
                    Institute
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider border-r-2 border-foreground/30 hidden lg:table-cell">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider border-r-2 border-foreground/30">
                    Expiry
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider border-r-2 border-foreground/30">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, idx) => {
                  const status = normalizeStatus(doc.status);
                  const daysToExpiry = getDaysUntilExpiry(doc.expiry_date);
                  const isRenewable = daysToExpiry <= 90;
                  
                  // Check if a renewal is already pending (not Approved/Rejected)
                  const pendingRenewal = doc.document_renewals?.find(
                    (r) => r.status === "Pending HOD" || r.status === "Pending Principal"
                  );

                  return (
                    <tr
                      key={doc.id}
                      className={`${
                        idx % 2 === 0 ? "bg-card" : "bg-muted/50"
                      } border-t-2 border-foreground/20`}
                    >
                      <td className="px-4 py-3 border-r-2 border-foreground/10">
                        <p className="font-bold text-sm">{doc.document_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.responsible_person}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm hidden md:table-cell border-r-2 border-foreground/10">
                        {doc.institutes?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm hidden lg:table-cell border-r-2 border-foreground/10">
                        {doc.category}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono border-r-2 border-foreground/10">
                        {doc.expiry_date}
                      </td>
                      <td className="px-4 py-3 font-mono border-r-2 border-foreground/10">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        {isClerk && isRenewable && (
                          pendingRenewal ? (
                            <span className="text-xs font-bold text-muted-foreground uppercase py-1 px-2 border-2 border-muted-foreground/30 rounded bg-muted">
                              Renewal Pending
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenRenewModal(doc.id, doc.document_name)}
                              className="brutal-btn-sm bg-[hsl(45,90%,50%)] hover:bg-[hsl(45,90%,40%)] text-foreground flex items-center gap-1"
                            >
                              <RefreshCw size={14} strokeWidth={2.5} />
                              Renew
                            </button>
                          )
                        )}
                        {!isClerk && isRenewable && pendingRenewal && (
                          <span className="text-xs font-bold text-[hsl(45,90%,30%)] uppercase py-1 px-2 border-2 border-[hsl(45,90%,30%)] rounded bg-[hsl(45,90%,85%)]">
                            Renewal Submitted
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(doc.id, doc.document_name)}
                          disabled={deleteMutation.isPending}
                          className="brutal-btn-sm ml-2 bg-destructive text-destructive-foreground hover:bg-[hsl(0,70%,40%)] flex items-center gap-1 disabled:opacity-50"
                          title="Delete Document"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground font-bold">
                No documents found.
              </div>
            )}
          </div>
        )}
      </div>

      {selectedDoc && (
        <RenewModal
          isOpen={renewModalOpen}
          onClose={() => setRenewModalOpen(false)}
          onSuccess={() => {
            setRenewModalOpen(false);
            refetch();
          }}
          documentId={selectedDoc.id}
          documentName={selectedDoc.name}
        />
      )}
    </AppLayout>
  );
};

export default DocumentsPage;
