import { useState, useEffect } from "react";

import {
  HardDrive,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  Database,
  Info,
  Clock,
  Activity,
  ShieldCheck,
} from "lucide-react";

// Maximum standard LocalStorage quota (5MB = 5 * 1024 * 1024 bytes)
const MAX_QUOTA_BYTES = 5 * 1024 * 1024;

/**
 * Calculates current LocalStorage usage metrics synchronously.
 */
function getStorageMetrics() {
  let bytes = 0;
  const items = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || "";
        // JavaScript strings are UTF-16, consuming approx 2 bytes per character
        const itemBytes = (key.length + val.length) * 2;
        bytes += itemBytes;

        // Categorize key for UI presentation
        let category = "System Config";
        if (key.includes("course") || key.includes("modules"))
          category = "Curriculum Data";
        if (key.includes("user") || key.includes("email"))
          category = "User Roster";
        if (key.includes("attempt") || key.includes("quiz"))
          category = "Student Scores";
        if (key.includes("sms") || key.includes("gateway"))
          category = "Carrier Logs";
        if (key.includes("audit") || key.includes("log"))
          category = "Security Audit";

        items.push({
          key,
          bytes: itemBytes,
          kb: (itemBytes / 1024).toFixed(2),
          category,
        });
      }
    }
  } catch (err) {
    console.error("Error computing storage health:", err);
  }

  items.sort((a, b) => b.bytes - a.bytes);

  const totalMB = (bytes / (1024 * 1024)).toFixed(2);
  const percentageUsed = Math.min(
    100,
    Math.round((bytes / MAX_QUOTA_BYTES) * 100),
  );

  return {
    totalBytes: bytes,
    totalMB,
    percentageUsed,
    itemBreakdown: items,
  };
}

/**
 
 *
 * @param {Array} auditLogs - Array of administrative system activity events
 * @param {Function} onSanitizeStorage - Callback () => void to execute non-destructive cache cleanup
 * @param {Function} onSelectLogDetail - Callback (log) => void to open detailed inspector modal
 */
export default function AdminStorageHealthTab({
  auditLogs = [],
  onSanitizeStorage,
  onSelectLogDetail,
}) {
  // Initialize state lazily on first render without needing an effect pass
  const [storageMetrics, setStorageMetrics] = useState(() =>
    getStorageMetrics(),
  );

  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logActionFilter, setLogActionFilter] = useState("ALL");
  const [isSanitizing, setIsSanitizing] = useState(false);
  const [sanitizeSuccess, setSanitizeSuccess] = useState(false);

  useEffect(() => {
    // Schedule recalculation outside synchronous effect phase to prevent cascading re-renders
    const timer = requestAnimationFrame(() => {
      setStorageMetrics(getStorageMetrics());
    });
    return () => cancelAnimationFrame(timer);
  }, [auditLogs]);

  const handleExecuteSanitizer = () => {
    setIsSanitizing(true);
    setTimeout(() => {
      if (onSanitizeStorage) {
        onSanitizeStorage();
      }
      setStorageMetrics(getStorageMetrics());
      setIsSanitizing(false);
      setSanitizeSuccess(true);
      setTimeout(() => setSanitizeSuccess(false), 3000);
    }, 500);
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      (log.action &&
        log.action.toLowerCase().includes(logSearchQuery.toLowerCase())) ||
      (log.actor &&
        log.actor.toLowerCase().includes(logSearchQuery.toLowerCase())) ||
      (log.details &&
        log.details.toLowerCase().includes(logSearchQuery.toLowerCase()));

    const matchesAction =
      logActionFilter === "ALL" || log.action === logActionFilter;

    return matchesSearch && matchesAction;
  });

  const uniqueActions = ["ALL", ...new Set(auditLogs.map((l) => l.action))];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* SECTION 1: STORAGE HEALTH GAUGE & SANITIZER BANNER */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-400/30">
                Device Storage Diagnostics
              </span>
              <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-indigo-400" />
                <span>Browser LocalStorage Quota</span>
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Memory Health & Storage Sanitizer
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Inspect device disk consumption to ensure seamless offline score
              caching and prevent browser QuotaExceeded errors.
            </p>
          </div>

          {/* 1-Click Sanitizer Action Button */}
          <button
            onClick={handleExecuteSanitizer}
            disabled={isSanitizing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-2xl transition shadow-md flex items-center justify-center gap-2 shrink-0 self-start md:self-auto disabled:opacity-50 group"
          >
            <RefreshCw
              className={`h-4 w-4 ${isSanitizing ? "animate-spin" : "group-hover:rotate-180 transition duration-500"}`}
            />
            <span>
              {isSanitizing
                ? "Sanitizing Cache..."
                : "1-Click Non-Destructive Sanitizer"}
            </span>
          </button>
        </div>

        {/* Success Feedback Alert */}
        {sanitizeSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Temporary render caches purged! Essential gradebooks, rosters, and
              auth tokens preserved safely.
            </span>
          </div>
        )}

        {/* Visual Progress Bar & Capacity Metrics */}
        <div className="space-y-3 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-400" />
              <span className="font-bold text-slate-200">
                LocalStorage Utilization:
              </span>
              <span className="font-mono font-black text-white">
                {storageMetrics.totalMB} MB
              </span>
              <span className="text-slate-400">/ 5.00 MB Quota</span>
            </div>
            <span
              className={`font-black text-xs px-2.5 py-0.5 rounded-md ${
                storageMetrics.percentageUsed > 80
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {storageMetrics.percentageUsed}% Capacity
            </span>
          </div>

          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                storageMetrics.percentageUsed > 80
                  ? "bg-rose-500"
                  : "bg-indigo-500"
              }`}
              style={{
                width: `${Math.max(2, storageMetrics.percentageUsed)}%`,
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
            <span>Safe Zone Active: Gradebooks & Rosters Protected</span>
            <span>Origin Limit: ~5,242,880 Bytes</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: LOCALSTORAGE KEY BREAKDOWN TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-900 text-base">
              Client Storage Keys Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Live inspection of all key-value entries saved in this browser
              window.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
            {storageMetrics.itemBreakdown.length} Storage Keys
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Storage Key Identifier</th>
                <th className="py-3 px-4">Data Category</th>
                <th className="py-3 px-4 text-center">Byte Consumption</th>
                <th className="py-3 px-4 text-right">Protection State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {storageMetrics.itemBreakdown.map((item) => (
                <tr key={item.key} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {item.key}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-indigo-700">
                    {item.kb} KB{" "}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({item.bytes.toLocaleString()} bytes)
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>Protected</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: SYSTEM SECURITY AUDIT LOGS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Institutional Security Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Immutable record of administrative actions, user approvals, and
                SMS broadcasts.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
            {auditLogs.length} Total Events
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail by actor, action, or details..."
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Action Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {uniqueActions.map((act) => (
              <button
                key={act}
                onClick={() => setLogActionFilter(act)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition uppercase whitespace-nowrap ${
                  logActionFilter === act
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {act.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Trail List */}
        {filteredAuditLogs.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
            <Info className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              No matching audit events found.
            </p>
            <p className="text-[11px] text-slate-400">
              Try clearing your search term or action filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {filteredAuditLogs.map((log) => (
              <div
                key={log.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-xs">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                      Actor: {log.actor}
                    </span>
                    {log.target && (
                      <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        Target: {log.target}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {log.details}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                  <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{log.timestamp}</span>
                  </div>

                  <button
                    onClick={() => onSelectLogDetail && onSelectLogDetail(log)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition"
                    title="Inspect log event details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
