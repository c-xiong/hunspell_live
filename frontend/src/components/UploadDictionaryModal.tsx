import React, { useState } from "react";
import { FaTimes, FaUpload, FaSpinner } from "react-icons/fa";
import { apiRequest } from "../config/api";

interface UploadResult {
  dictionary_id: string;
  name: string;
  text_direction: "ltr" | "rtl";
  expires_in_seconds: number;
}

interface UploadDictionaryModalProps {
  onClose: () => void;
  onUploaded: (result: UploadResult) => void;
}

const fileInputClass =
  "block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:font-semibold file:text-white hover:border-primary-400 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300";

// Modal for uploading a custom .aff/.dic pair. The dictionary lives in the
// server's memory for this session only.
const UploadDictionaryModal: React.FC<UploadDictionaryModalProps> = ({
  onClose,
  onUploaded,
}) => {
  const [affFile, setAffFile] = useState<File | null>(null);
  const [dicFile, setDicFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [isRtl, setIsRtl] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affFile || !dicFile) {
      setError("Please choose both an .aff file and a .dic file.");
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("aff", affFile);
      formData.append("dic", dicFile);
      formData.append("name", name);
      formData.append("text_direction", isRtl ? "rtl" : "ltr");

      const response = await apiRequest("/api/dictionaries/upload/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        // Spylls parse errors are passed through — useful feedback for
        // dictionary authors.
        setError(data.error || "Upload failed.");
        return;
      }
      onUploaded(data as UploadResult);
    } catch {
      setError("Upload failed. Is the server reachable?");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-popup sm:max-w-md sm:rounded-card dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="m-0 text-lg font-semibold text-slate-900 dark:text-white">
            Upload my dictionary
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <FaTimes />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Test your own Hunspell dictionary: pick the <code>.aff</code> and{" "}
          <code>.dic</code> pair. It stays available <strong>for this
          session only</strong> (about 2 hours, lost if the server restarts)
          and is never stored permanently.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              .aff file (affix rules)
            </label>
            <input
              type="file"
              accept=".aff"
              onChange={(e) => setAffFile(e.target.files?.[0] ?? null)}
              className={fileInputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              .dic file (word list)
            </label>
            <input
              type="file"
              accept=".dic"
              onChange={(e) => setDicFile(e.target.files?.[0] ?? null)}
              className={fileInputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Language name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wolof (my draft)"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 outline-none focus:border-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={isRtl}
              onChange={(e) => setIsRtl(e.target.checked)}
              className="h-4 w-4"
            />
            Right-to-left script (Arabic, Hebrew, …)
          </label>

          {error && (
            <div className="whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="flex min-h-touch w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
            {isUploading ? "Parsing dictionary…" : "Upload and test"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadDictionaryModal;
