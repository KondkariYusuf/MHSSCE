import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { CATEGORIES } from "@/data/types";
import { Search, Loader2 } from "lucide-react";

// DB row shape
interface DocumentRow {
  id: string;
  institute_id: string;
  document_name: string;
  category: string;
  responsible_person: string;
  expiry_date: string;
  r2_file_key: string;
  status: "Valid" | "Expiring Soon" | "Expired";
  created_at: string;
  institutes: { name: string } | null;
}

// Map DB status enum → frontend badge values
const normalizeStatus = (status: string): "valid" | "expiring" | "expired" => {
  switch (status) {
    case "Valid":
      return "valid";
    case "Expiring Soon":
      return "expiring";
    case "Expired":
      return "expired";
    default:
      return "valid";
  }
};

const DocumentsPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: documents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*, institutes(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as DocumentRow[]) ?? [];
    },
  });

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
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, idx) => {
                  const status = normalizeStatus(doc.status);
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
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
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
    </AppLayout>
  );
};

export default DocumentsPage;
