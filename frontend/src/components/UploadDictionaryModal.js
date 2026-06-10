var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { FaTimes, FaUpload, FaSpinner } from "react-icons/fa";
import { apiRequest } from "../config/api";
const fileInputClass = "block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:font-semibold file:text-white hover:border-primary-400 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300";
// Modal for uploading a custom .aff/.dic pair. The dictionary lives in the
// server's memory for this session only.
const UploadDictionaryModal = ({ onClose, onUploaded, }) => {
    const [affFile, setAffFile] = useState(null);
    const [dicFile, setDicFile] = useState(null);
    const [name, setName] = useState("");
    const [isRtl, setIsRtl] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
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
            const response = yield apiRequest("/api/dictionaries/upload/", {
                method: "POST",
                body: formData,
            });
            const data = yield response.json();
            if (!response.ok) {
                // Spylls parse errors are passed through — useful feedback for
                // dictionary authors.
                setError(data.error || "Upload failed.");
                return;
            }
            onUploaded(data);
        }
        catch (_a) {
            setError("Upload failed. Is the server reachable?");
        }
        finally {
            setIsUploading(false);
        }
    });
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4", onClick: onClose, children: _jsxs("div", { className: "w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-popup sm:max-w-md sm:rounded-card dark:bg-slate-800", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("h2", { className: "m-0 text-lg font-semibold text-slate-900 dark:text-white", children: "Upload my dictionary" }), _jsx("button", { type: "button", onClick: onClose, "aria-label": "Close", className: "flex min-h-touch min-w-touch items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200", children: _jsx(FaTimes, {}) })] }), _jsxs("p", { className: "mb-4 text-sm text-slate-500 dark:text-slate-400", children: ["Test your own Hunspell dictionary: pick the ", _jsx("code", { children: ".aff" }), " and", " ", _jsx("code", { children: ".dic" }), " pair. It stays available ", _jsx("strong", { children: "for this session only" }), " (about 2 hours, lost if the server restarts) and is never stored permanently."] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300", children: ".aff file (affix rules)" }), _jsx("input", { type: "file", accept: ".aff", onChange: (e) => { var _a, _b; return setAffFile((_b = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null); }, className: fileInputClass })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300", children: ".dic file (word list)" }), _jsx("input", { type: "file", accept: ".dic", onChange: (e) => { var _a, _b; return setDicFile((_b = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null); }, className: fileInputClass })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300", children: "Language name (optional)" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Wolof (my draft)", className: "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 outline-none focus:border-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100" })] }), _jsxs("label", { className: "flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300", children: [_jsx("input", { type: "checkbox", checked: isRtl, onChange: (e) => setIsRtl(e.target.checked), className: "h-4 w-4" }), "Right-to-left script (Arabic, Hebrew, \u2026)"] }), error && (_jsx("div", { className: "whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300", children: error })), _jsxs("button", { type: "submit", disabled: isUploading, className: "flex min-h-touch w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60", children: [isUploading ? _jsx(FaSpinner, { className: "animate-spin" }) : _jsx(FaUpload, {}), isUploading ? "Parsing dictionary…" : "Upload and test"] })] })] }) }));
};
export default UploadDictionaryModal;
