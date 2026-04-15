import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { BrutalCard } from "@/components/BrutalCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { FileText, AlertTriangle, XCircle, Clock, Loader2 } from "lucide-react";
import type { ActivityItem } from "@/data/types";

// DB row shape from the documents table
interface DocumentRow {
  id: string;
  institute_id: string;
  uploader_id: string | null;
  document_name: string;
  category: string;
  responsible_person: string;
  expiry_date: string;
  file_path: string;
  status: "Valid" | "Expiring Soon" | "Expired";
  created_at: string;
  institutes: { name: string } | null;
}

interface ApprovalRow {
  id: string;
  document_id: string;
  step: "Pending" | "HOD Reviewed" | "Principal Approved" | "Rejected";
  created_at: string;
}

// Map DB status to lowercase for display consistency
const normalizeStatus = (status: string) => {
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
      return status.toLowerCase();
  }
};

const DashboardPage = () => {
  const {
    data: documents = [],
    isLoading: docsLoading,
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

  const {
    data: approvals = [],
    isLoading: approvalsLoading,
  } = useQuery({
    queryKey: ["approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approvals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as ApprovalRow[]) ?? [];
    },
  });

  const isLoading = docsLoading || approvalsLoading;

  // Compute stats from real data
  const totalDocs = documents.length;
  const expiring = documents.filter((d) => d.status === "Expiring Soon").length;
  const expired = documents.filter((d) => d.status === "Expired").length;
  const pendingApprovals = approvals.filter(
    (a) => a.step !== "Principal Approved" && a.step !== "Rejected"
  ).length;

  // Build activity items from documents for the feed
  const activities: ActivityItem[] = documents.slice(0, 12).map((doc) => {
    const status = normalizeStatus(doc.status);
    if (status === "expired") {
      return {
        id: `act-${doc.id}`,
        type: "expiry" as const,
        message: `🔴 ${doc.document_name} has EXPIRED — ${doc.institutes?.name ?? "Unknown"}`,
        timestamp: doc.created_at,
        severity: "danger" as const,
      };
    }
    if (status === "expiring") {
      return {
        id: `act-${doc.id}`,
        type: "reminder" as const,
        message: `⚠️ ${doc.document_name} expiring soon — ${doc.institutes?.name ?? "Unknown"}`,
        timestamp: doc.created_at,
        severity: "warning" as const,
      };
    }
    return {
      id: `act-${doc.id}`,
      type: "upload" as const,
      message: `📄 ${doc.document_name} uploaded — ${doc.institutes?.name ?? "Unknown"}`,
      timestamp: doc.created_at,
      severity: "info" as const,
    };
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-lg font-mono font-bold uppercase">
              Loading dashboard...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold uppercase">Dashboard</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Overview of compliance across all institutes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Documents" value={totalDocs} icon={<FileText />} />
          <StatCard
            label="Expiring Soon"
            value={expiring}
            icon={<AlertTriangle />}
            variant="warning"
          />
          <StatCard
            label="Expired"
            value={expired}
            icon={<XCircle />}
            variant="danger"
          />
          <StatCard
            label="Pending Approvals"
            value={pendingApprovals}
            icon={<Clock />}
            variant="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Status Overview */}
          <BrutalCard flat>
            <h2 className="text-xl font-mono font-bold uppercase mb-4">
              Document Status
            </h2>
            <div className="space-y-3">
              {documents.length === 0 && (
                <p className="text-muted-foreground font-medium text-sm">
                  No documents found.
                </p>
              )}
              {documents.slice(0, 6).map((doc) => {
                const status = normalizeStatus(doc.status);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between border-b-2 border-muted pb-2"
                  >
                    <div>
                      <p className="font-bold text-sm">{doc.document_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.institutes?.name ?? "Unknown Institute"}
                      </p>
                    </div>
                    <span
                      className={
                        status === "valid"
                          ? "status-valid"
                          : status === "expiring"
                          ? "status-expiring"
                          : "status-expired"
                      }
                    >
                      {doc.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </BrutalCard>

          {/* Activity Feed */}
          <BrutalCard flat>
            <h2 className="text-xl font-mono font-bold uppercase mb-4">
              Activity & Reminders
            </h2>
            {activities.length === 0 ? (
              <p className="text-muted-foreground font-medium text-sm">
                No recent activity.
              </p>
            ) : (
              <ActivityFeed activities={activities} limit={8} />
            )}
          </BrutalCard>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
