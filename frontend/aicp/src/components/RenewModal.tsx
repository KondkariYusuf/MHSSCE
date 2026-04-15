import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import { Upload, AlertCircle, Loader2, X } from "lucide-react";

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documentId: string;
  documentName: string;
}

interface UploadUrlResponse {
  documentId: string;
  uploadUrl: string;
  securePath: string;
}

type UploadStep = "idle" | "generating-url" | "uploading" | "saving" | "error";

export function RenewModal({ isOpen, onClose, onSuccess, documentId, documentName }: RenewModalProps) {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expiryDate, setExpiryDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<UploadStep>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const resetState = () => {
    setExpiryDate("");
    setSelectedFile(null);
    setUploadStep("idle");
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (uploadStep === "generating-url" || uploadStep === "uploading" || uploadStep === "saving") return;
    resetState();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      setUploadStep("error");
      return;
    }

    if (!expiryDate) {
      setErrorMessage("Please select a new expiry date.");
      setUploadStep("error");
      return;
    }

    if (!profile?.institute_id) {
      setErrorMessage("Your account is not associated with an institute.");
      setUploadStep("error");
      return;
    }

    try {
      setUploadStep("generating-url");

      const { uploadUrl, securePath } =
        await apiFetch<UploadUrlResponse>("/api/documents/generate-renewal-upload-url", {
          method: "POST",
          body: JSON.stringify({
            filename: selectedFile.name,
            fileType: selectedFile.type,
            fileSize: selectedFile.size,
          }),
        });

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

      setUploadStep("saving");

      const { error: insertError } = await supabase.from("document_renewals").insert({
        document_id: documentId,
        uploader_id: profile.id,
        file_path: securePath,
        expiry_date: expiryDate,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      resetState();
      onSuccess();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      setUploadStep("error");
    }
  };

  const isSubmitting = ["generating-url", "uploading", "saving"].includes(uploadStep);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div 
        className="bg-card w-full max-w-lg border-[3px] border-foreground flex flex-col max-h-[90vh]"
        style={{ boxShadow: "8px 8px 0px hsl(150 10% 10%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-[3px] border-foreground p-4 bg-[hsl(45,90%,85%)]">
          <h2 className="font-mono font-bold text-xl uppercase text-[hsl(45,90%,30%)] flex-1 truncate mr-4">
            Renew {documentName}
          </h2>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 hover:bg-black/10 rounded disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {uploadStep === "error" && (
            <div className="bg-[hsl(0,70%,92%)] border-[3px] border-foreground p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="text-[hsl(0,70%,40%)] shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-sm text-[hsl(0,70%,30%)]">Upload Failed</p>
                <p className="text-sm text-[hsl(0,70%,40%)] mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                New Expiry Date
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={isSubmitting}
                className="brutal-input w-full"
              />
            </div>

            <div>
              <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                Upload New File
              </label>
              <div className="border-[3px] border-dashed border-foreground p-6 text-center bg-muted">
                <Upload className="mx-auto text-muted-foreground mb-3" size={32} />
                {selectedFile ? (
                  <p className="font-bold text-sm">
                    {selectedFile.name}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </p>
                ) : (
                  <>
                    <p className="font-bold text-sm">Select renewal file</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPEG, PNG — Max 10MB</p>
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
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="brutal-button mt-4 !py-1 !px-4 !text-xs w-auto mx-auto block"
                >
                  {selectedFile ? "Change File" : "Browse Files"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="brutal-button w-full text-base flex justify-center items-center gap-2 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing...
                </>
              ) : (
                "Submit Renewal →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
