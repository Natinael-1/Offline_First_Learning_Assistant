import { useState, useEffect } from "react";

import {
  X,
  Activity,
  Clock,
  User,
  ShieldCheck,
  Copy,
  Check,
  Terminal,
  FileText,
  Tag,
} from "lucide-react";

/**
 
 * @param {Object} log - Selected audit log item
 * @param {Function} onClose - Callback () => void to dismiss the inspector overlay
 */
export default function SystemLogDetailsModal({ log, onClose }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!log) return null;

  const handleCopyPayload = () => {
    const payloadText = JSON.stringify(log, null, 2);
    navigator.clipboard
      .writeText(payloadText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy audit payload:", err);
      });
  };

  // Helper to resolve action category color badges
  const getActionBadgeStyle = (action = "") => {
    const act = action.toUpperCase();
    if (act.includes("APPROVE") || act.includes("AUTHORIZE")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
    if (
      act.includes("REJECT") ||
      act.includes("DELETE") ||
      act.includes("PURGE")
    ) {
      return "bg-rose-50 text-rose-800 border-rose-200";
    }
    if (act.includes("SMS") || act.includes("BROADCAST")) {
      return "bg-purple-50 text-purple-800 border-purple-200";
    }
    if (act.includes("STORAGE") || act.includes("SANITIZ")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    return "bg-indigo-50 text-indigo-800 border-indigo-200";
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
                Security Audit Inspector
              </span>
              <h3 className="font-extrabold text-base leading-tight text-white">
                Event Log Inspector
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800"
            title="Close inspector (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-grow">
          {/* EVENT ACTION BADGE & ID BANNER */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-semibold block">
                Event Reference UUID: {log.id}
              </span>
              <h4 className="font-black text-slate-900 text-base leading-snug">
                {log.action}
              </h4>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1.5 rounded-xl border shrink-0 self-start sm:self-auto ${getActionBadgeStyle(log.action)}`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{log.action.replace(/_/g, " ")}</span>
            </span>
          </div>

          {/* METADATA GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Actor Card */}
            <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="h-3 w-3 text-indigo-600" /> Administrative
                Actor
              </span>
              <p className="font-extrabold text-slate-900 text-sm">
                {log.actor || "System Engine"}
              </p>
            </div>

            {/* Timestamp Card */}
            <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3 text-indigo-600" /> Recorded Timestamp
              </span>
              <p className="font-bold text-slate-800 text-xs">
                {log.timestamp}
              </p>
            </div>

            {/* Target Entity Card */}
            {log.target && (
              <div className="sm:col-span-2 p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="h-3 w-3 text-indigo-600" /> Target Entity /
                  Resource
                </span>
                <p className="font-bold text-slate-900 text-xs">{log.target}</p>
              </div>
            )}
          </div>

          {/* DESCRIPTION / DETAILS BLOCK */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
                Action Narrative & Execution Context:
              </span>
            </label>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 text-xs leading-relaxed font-mono font-medium">
              {log.details ||
                "No additional contextual details recorded for this event."}
            </div>
          </div>

          {/* RAW JSON PAYLOAD VIEWER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-indigo-600" />
                Serialized Audit Payload (JSON):
              </label>

              <button
                type="button"
                onClick={handleCopyPayload}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-600">
                      Copied to Clipboard!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-indigo-300 rounded-2xl border border-slate-800 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-40">
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={handleCopyPayload}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 transition shadow-sm flex items-center gap-1.5"
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{isCopied ? "Payload Copied" : "Copy Payload"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2 rounded-xl transition shadow-md"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
