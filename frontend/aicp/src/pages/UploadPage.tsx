import { useState, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import { CATEGORIES } from "@/data/types";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface UploadUrlResponse {
  documentId: string;
  uploadUrl: string;
  securePath: string;
}

type UploadStep = "idle" | "generating-url" | "uploading" | "saving" | "done" | "error";

const UploadPage = () => {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [documentName, setDocumentName] = useState("");
  const [category, setCategory] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Upload state
  const [uploadStep, setUploadStep] = useState<UploadStep>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setDocumentName("");
    setCategory("");
    setResponsiblePerson("");
    setExpiryDate("");
    setSelectedFile(null);
    setUploadStep("idle");
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      setUploadStep("error");
      return;
    }

    if (!profile?.institute_id) {
      setErrorMessage("Your account is not associated with an institute.");
      setUploadStep("error");
      return;
    }

    try {
      // ── Step 1: Get signed upload URL from Express ──
      setUploadStep("generating-url");

      const { documentId, uploadUrl, securePath } =
        await apiFetch<UploadUrlResponse>("/api/documents/generate-upload-url", {
          method: "POST",
          body: JSON.stringify({
            filename: selectedFile.name,
            fileType: selectedFile.type,
            fileSize: selectedFile.size,
          }),
        });

      // ── Step 2: Upload file directly to Supabase Storage ──
      setUploadStep("uploading");

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      });

      if (!uploadResponse.ok) {
        throw new Error("File upload to storage failed.");
      }

      // ── Step 3: Save document metadata to the database via Backend ──
      setUploadStep("saving");

      await apiFetch("/api/documents/confirm-upload", {
        method: "POST",
        body: JSON.stringify({
          documentId,
          documentName,
          category,
          responsiblePerson,
          expiryDate,
          securePath,
        }),
      });

      setUploadStep("done");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      setUploadStep("error");
    }
  };

  const stepLabel: Record<UploadStep, string> = {
    idle: "",
    "generating-url": "Generating secure upload URL...",
    uploading: "Uploading file to storage...",
    saving: "Saving document metadata...",
    done: "",
    error: "",
  };

  const isSubmitting = ["generating-url", "uploading", "saving"].includes(uploadStep);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold uppercase">
            Upload Document
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Upload compliance documents for review and approval
          </p>
        </div>

        {uploadStep === "done" ? (
          <div
            className="bg-[hsl(142,70%,92%)] border-[3px] border-foreground p-8 text-center"
            style={{ boxShadow: "6px 6px 0px hsl(150 10% 10%)" }}
          >
            <CheckCircle className="mx-auto text-status-valid mb-4" size={48} />
            <h2 className="text-2xl font-mono font-bold uppercase mb-2">
              Document Uploaded!
            </h2>
            <p className="text-muted-foreground font-medium">
              Your document has been submitted for Staff/HOD review.
            </p>
            <button
              onClick={resetForm}
              className="brutal-button mt-6 !py-2 !px-6"
            >
              Upload Another →
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-card border-[3px] border-foreground p-8 space-y-6"
            style={{ boxShadow: "6px 6px 0px hsl(150 10% 10%)" }}
          >
            {/* Error display */}
            {uploadStep === "error" && (
              <div className="bg-[hsl(0,70%,92%)] border-[3px] border-foreground p-4 flex items-start gap-3">
                <AlertCircle className="text-[hsl(0,70%,40%)] shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-bold text-sm text-[hsl(0,70%,30%)]">
                    Upload Failed
                  </p>
                  <p className="text-sm text-[hsl(0,70%,40%)] mt-1">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Progress indicator */}
            {isSubmitting && (
              <div className="bg-[hsl(210,70%,92%)] border-[3px] border-foreground p-4 flex items-center gap-3">
                <Loader2 className="animate-spin text-[hsl(210,70%,40%)]" size={20} />
                <p className="font-bold text-sm text-[hsl(210,70%,30%)]">
                  {stepLabel[uploadStep]}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                Document Name
              </label>
              <input
                type="text"
                required
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                disabled={isSubmitting}
                className="brutal-input"
                placeholder="e.g. NAAC Accreditation Certificate"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                  Category
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  className="brutal-input"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                  Institute
                </label>
                <input
                  type="text"
                  readOnly
                  value={profile?.institute_id ? "Your Institute (auto)" : "—"}
                  className="brutal-input bg-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                  Responsible Person
                </label>
                <input
                  type="text"
                  required
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  disabled={isSubmitting}
                  className="brutal-input"
                  placeholder="e.g. Dr. Naeem Ansari"
                />
              </div>
              <div>
                <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  disabled={isSubmitting}
                  className="brutal-input"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                Upload File
              </label>
              <div className="border-[3px] border-dashed border-foreground p-8 text-center bg-muted">
                <Upload className="mx-auto text-muted-foreground mb-3" size={40} />
                {selectedFile ? (
                  <p className="font-bold text-sm">
                    {selectedFile.name}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </p>
                ) : (
                  <>
                    <p className="font-bold text-sm">
                      Drag and drop or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPEG, PNG — Max 10MB
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  disabled={isSubmitting}
                  className="brutal-button mt-4 !py-2 !px-4 !text-xs"
                >
                  {selectedFile ? "Change File" : "Browse Files"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="brutal-button w-full text-lg disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Submit for Review →"}
            </button>
          </form>
        )}
      </div>
    </AppLayout>
  );
};

export default UploadPage;
