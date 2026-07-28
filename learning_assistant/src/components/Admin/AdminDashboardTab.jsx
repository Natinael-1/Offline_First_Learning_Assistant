/* Key,*/
import {
  Users,
  UserCheck,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Activity,
  Clock,
  ShieldCheck,
  HardDrive,
  ChevronRight,
} from "lucide-react";

/**
 
 *
 * @param {number} totalStudents - Count of pre-authorized student entries
 * @param {number} totalTeachers - Count of registered teacher accounts
 * @param {Array} pendingTeacherApprovals - Unapproved teacher registration queue
 * @param {number} totalRegisteredAccounts - Total registered user accounts
 * @param {number} smsCreditBalance - Africa's Talking SMS API credit units remaining
 * @param {Array} auditLogs - Historical system administrative activity logs
 * @param {Function} onNavigateTab - Function (tabName) => void to switch active portal view
 * @param {Function} onOpenPreAuthModal - Function () => void to launch email pre-authorization dialog
 * @param {Function} onApproveTeacher - Function (email) => void to grant publishing privileges
 */
export default function AdminDashboardTab({
  totalStudents = 0,
  totalTeachers = 0,
  pendingTeacherApprovals = [],
  totalRegisteredAccounts = 0,
  smsCreditBalance = 0,
  auditLogs = [],
  onNavigateTab,
  onOpenPreAuthModal,
  onApproveTeacher,
}) {
  const pendingCount = pendingTeacherApprovals.length;
  const recentLogs = auditLogs.slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: EXECUTIVE KPI SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Enrolled Students */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
              Student Body
            </span>
            <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900">
              {totalStudents}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pre-Authorized Students
            </p>
          </div>
        </div>

        {/* Metric 2: Instructors & Pending Queue */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                pendingCount > 0
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {pendingCount > 0
                ? `${pendingCount} Pending Verification`
                : "Faculty Approved"}
            </span>
            <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900">
              {totalTeachers}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Registered Instructors
            </p>
          </div>
        </div>

        {/* Metric 3: SMS Gateway Credits */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100">
              Africa's Talking API
            </span>
            <div className="h-9 w-9 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Smartphone className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900">
              {smsCreditBalance}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              SMS Broadcast Credits
            </p>
          </div>
        </div>

        {/* Metric 4: Total Registered Accounts */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
              Directory Total
            </span>
            <div className="h-9 w-9 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900">
              {totalRegisteredAccounts}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Active User Accounts
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: ACTIONABLE ALERT BANNER - PENDING TEACHER APPROVALS */}
      {pendingCount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-2xl shrink-0 mt-0.5">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-950">
                  {pendingCount} Teacher Account{pendingCount > 1 ? "s" : ""}{" "}
                  Awaiting Admin Verification
                </h3>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Newly registered instructors cannot publish course modules or
                  trigger SMS text broadcasts until authorized by an
                  administrator.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab && onNavigateTab("users")}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <span>Manage Approvals</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Inline Quick-Approve List */}
          <div className="divide-y divide-amber-200/60 border-t border-amber-200/60 pt-2 space-y-2">
            {pendingTeacherApprovals.map((teacher) => (
              <div
                key={teacher.id}
                className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900">
                    {teacher.username}
                  </span>
                  <span className="text-slate-500 text-[11px] block">
                    {teacher.email} &bull; Linked Phone:{" "}
                    {teacher.phone || "N/A"}
                  </span>
                </div>

                <button
                  onClick={() =>
                    onApproveTeacher && onApproveTeacher(teacher.id)
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl transition inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Grant Publishing Rights</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: ADMINISTRATIVE QUICK ACTIONS GRID */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-900 text-base">
              Administrative Task Short-Cuts
            </h3>
            <p className="text-xs text-slate-500">
              Quickly launch common IT management workflows.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Action 1: Pre-Authorize Emails */}
          <button
            onClick={onOpenPreAuthModal}
            className="p-4 border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-2xl text-left transition space-y-2 group"
          >
            <div className="h-9 w-9 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs group-hover:text-indigo-600 transition">
                Pre-Authorize Users
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                Add single or bulk institutional emails and linked mobile phone
                numbers.
              </p>
            </div>
          </button>

          {/* Action 2: Manage SMS Carrier API */}
          <button
            onClick={() => onNavigateTab && onNavigateTab("sms")}
            className="p-4 border border-slate-200 hover:border-purple-400 bg-slate-50/50 hover:bg-purple-50/30 rounded-2xl text-left transition space-y-2 group"
          >
            <div className="h-9 w-9 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs group-hover:text-purple-600 transition">
                SMS Gateway Hub
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                Monitor Africa's Talking API credits, calculate dispatch costs,
                and top up units.
              </p>
            </div>
          </button>

          {/* Action 3: LocalStorage & Audit Health */}
          <button
            onClick={() => onNavigateTab && onNavigateTab("storage")}
            className="p-4 border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl text-left transition space-y-2 group"
          >
            <div className="h-9 w-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs group-hover:text-emerald-600 transition">
                Storage Health & Logs
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                Inspect browser memory consumption and execute non-destructive
                cache cleanup.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 4: RECENT SECURITY AUDIT FEED */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <h3 className="font-black text-slate-900 text-base">
              Recent Governance & Audit Activity
            </h3>
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab("storage")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition inline-flex items-center gap-1"
          >
            <span>View All Logs ({auditLogs.length})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No system security events logged yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      By: {log.actor}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {log.details}
                  </p>
                </div>

                <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1 shrink-0 self-start sm:self-auto">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
