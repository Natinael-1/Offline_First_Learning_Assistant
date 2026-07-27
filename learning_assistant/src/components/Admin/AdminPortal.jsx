import { useState, useEffect } from "react";

/*
ShieldCheck,
AlertCircle,
Plus,
RefreshCw,
FileText,
Key,
Radio,
Sparkles,
UserCheck,
Activity,
Server,

*/
import {
  Users,
  Smartphone,
  HardDrive,
  LayoutDashboard,
  CheckCircle2,
  Wifi,
  WifiOff,
  LogOut,
} from "lucide-react";

import AdminDashboardTab from "./AdminDashboardTab";
import AdminUserManagementTab from "./AdminUserManagementTab";
import AdminSMSGatewayTab from "./AdminSMSGatewayTab";
import AdminStorageHealthTab from "./AdminStorageHealthTab";

import PreAuthorizeUserModal from "./Modals/PreAuthorizeUserModal";
import SystemLogDetailsModal from "./Modals/SystemLogDetailsModal";

const DEFAULT_PRE_AUTHORIZED_USERS = [
  {
    id: "pa_1",
    email: "student1@student.edu",
    role: "student",
    phone: "+250788111222",
    isRegistered: true,
    dateAdded: "Jul 10, 2026",
  },
  {
    id: "pa_2",
    email: "student2@student.edu",
    role: "student",
    phone: "+250788333444",
    isRegistered: true,
    dateAdded: "Jul 11, 2026",
  },
  {
    id: "pa_3",
    email: "natinael@student.edu",
    role: "student",
    phone: "+250788555666",
    isRegistered: true,
    dateAdded: "Jul 12, 2026",
  },
  {
    id: "pa_4",
    email: "abebe@student.edu",
    role: "student",
    phone: "+250788777888",
    isRegistered: false,
    dateAdded: "Jul 20, 2026",
  },
  {
    id: "pa_5",
    email: "keza@student.edu",
    role: "student",
    phone: "+250788999000",
    isRegistered: false,
    dateAdded: "Jul 22, 2026",
  },
  {
    id: "pa_6",
    email: "amina@teacher.edu",
    role: "teacher",
    phone: "+250788123456",
    isRegistered: true,
    dateAdded: "Jul 01, 2026",
  },
  {
    id: "pa_7",
    email: "joshua@teacher.edu",
    role: "teacher",
    phone: "+250788234567",
    isRegistered: true,
    dateAdded: "Jul 05, 2026",
  },
  {
    id: "pa_8",
    email: "kwame@teacher.edu",
    role: "teacher",
    phone: "+250788345678",
    isRegistered: false,
    dateAdded: "Jul 18, 2026",
  },
  {
    id: "pa_9",
    email: "admin@admin.edu",
    role: "admin",
    phone: "+250788000111",
    isRegistered: true,
    dateAdded: "Jul 01, 2026",
  },
];

const DEFAULT_REGISTERED_USERS = [
  {
    id: "u_1",
    email: "admin@admin.edu",
    username: "SuperAdmin",
    role: "admin",
    isApproved: true,
    phone: "+250788000111",
  },
  {
    id: "u_2",
    email: "amina@teacher.edu",
    username: "Instructor Amina",
    role: "teacher",
    isApproved: true,
    phone: "+250788123456",
  },
  {
    id: "u_3",
    email: "joshua@teacher.edu",
    username: "Instructor Joshua",
    role: "teacher",
    isApproved: false,
    phone: "+250788234567",
  },
  {
    id: "u_4",
    email: "natinael@student.edu",
    username: "Natinael Boda",
    role: "student",
    isApproved: true,
    phone: "+250788555666",
  },
  {
    id: "u_5",
    email: "student1@student.edu",
    username: "Kebede Tadesse",
    role: "student",
    isApproved: true,
    phone: "+250788111222",
  },
];

const DEFAULT_SMS_GATEWAY = {
  creditBalance: 1450,
  apiKeyStatus: "active",
  apiUsername: "edusync_rwanda_prod",
  senderId: "EDUSYNC",
  totalDispatchedCount: 184,
  lastDispatchTimestamp: "Jul 26, 2026 14:20 CAT",
  dispatchHistory: [
    {
      id: "sms_tx_101",
      title: "Midterm Exam Schedule Update",
      courseTitle: "Frontend Web Development",
      sender: "Instructor Amina",
      recipientCount: 28,
      segmentsPerMsg: 1,
      totalCreditsDeducted: 28,
      status: "delivered",
      timestamp: "Jul 22, 2026 15:30 CAT",
    },
    {
      id: "sms_tx_102",
      title: "PostgreSQL Formula Sheet Uploaded",
      courseTitle: "Introduction to PostgreSQL",
      sender: "Instructor Amina",
      recipientCount: 34,
      segmentsPerMsg: 2,
      totalCreditsDeducted: 68,
      status: "delivered",
      timestamp: "Jul 20, 2026 09:15 CAT",
    },
  ],
};

const DEFAULT_AUDIT_LOGS = [
  {
    id: "log_1",
    actor: "SuperAdmin",
    action: "APPROVE_TEACHER",
    target: "amina@teacher.edu",
    timestamp: "Jul 01, 2026 10:00 CAT",
    details: "Granted publishing rights to Instructor Amina.",
  },
  {
    id: "log_2",
    actor: "SuperAdmin",
    action: "PRE_AUTHORIZE_EMAIL",
    target: "5 new student emails",
    timestamp: "Jul 10, 2026 11:30 CAT",
    details:
      "Added 5 pre-approved @student.edu entries with linked mobile phone numbers.",
  },
  {
    id: "log_3",
    actor: "Instructor Amina",
    action: "SMS_BROADCAST",
    target: "28 Students",
    timestamp: "Jul 22, 2026 15:30 CAT",
    details: "Dispatched 28 SMS text messages via Africa's Talking API.",
  },
];

/**
 * AdminPortal Component
 *
 * Top-level coordinator for school administrators, IT managers, and system governors.
 * Manages user access, phone registries, SMS carrier API credits, and browser disk diagnostics.
 *
 * @param {Object} currentUser - Currently logged in admin profile
 * @param {boolean} isOnlineSimulated - Simulated connectivity status
 * @param {Function} onLogout - Callback () => void to sign out
 */
export default function AdminPortal({
  currentUser = {
    username: "SuperAdmin",
    email: "admin@admin.edu",
    role: "admin",
  },
  isOnlineSimulated = true,
  onLogout,
}) {
  // Active Tab View Navigation: 'dashboard' | 'users' | 'sms' | 'storage'
  const [activeTab, setActiveTab] = useState("dashboard");

  // Pre-Authorized Email & Phone Registry
  const [preAuthorizedUsers, setPreAuthorizedUsers] = useState(() => {
    const saved = localStorage.getItem("school_preauthorized_emails");
    return saved ? JSON.parse(saved) : DEFAULT_PRE_AUTHORIZED_USERS;
  });

  // Registered Accounts State (including pending teacher approval flags)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem("school_registered_users");
    return saved ? JSON.parse(saved) : DEFAULT_REGISTERED_USERS;
  });

  // Africa's Talking Gateway API Config & Metrics
  const [smsGateway, setSmsGateway] = useState(() => {
    const saved = localStorage.getItem("admin_sms_gateway_config");
    return saved ? JSON.parse(saved) : DEFAULT_SMS_GATEWAY;
  });

  // System Security Audit Logs
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem("admin_security_audit_logs");
    return saved ? JSON.parse(saved) : DEFAULT_AUDIT_LOGS;
  });

  // Active Modal States
  const [isPreAuthModalOpen, setIsPreAuthModalOpen] = useState(false);
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);

  // Status Feedback Banner State
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      "school_preauthorized_emails",
      JSON.stringify(preAuthorizedUsers),
    );
  }, [preAuthorizedUsers]);

  useEffect(() => {
    localStorage.setItem(
      "school_registered_users",
      JSON.stringify(registeredUsers),
    );
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem(
      "admin_sms_gateway_config",
      JSON.stringify(smsGateway),
    );
  }, [smsGateway]);

  useEffect(() => {
    localStorage.setItem(
      "admin_security_audit_logs",
      JSON.stringify(auditLogs),
    );
  }, [auditLogs]);

  // Helper trigger to display toast notifications
  const triggerNotification = (text, type = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Helper trigger to prepend a new system audit log
  const appendAuditLog = (action, target, details) => {
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " " +
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) +
      " CAT";

    const newLog = {
      id: `log_${Date.now()}`,
      actor: currentUser.username || "SuperAdmin",
      action,
      target,
      timestamp: formattedDate,
      details,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // 1. Approve Teacher Account (Grants course publishing privileges)
  const handleApproveTeacher = (teacherEmail) => {
    setRegisteredUsers((prev) =>
      prev.map((user) => {
        if (user.email.toLowerCase() === teacherEmail.toLowerCase()) {
          return { ...user, isApproved: true };
        }
        return user;
      }),
    );

    appendAuditLog(
      "APPROVE_TEACHER",
      teacherEmail,
      `Approved account registration and granted curriculum publishing rights to ${teacherEmail}.`,
    );

    triggerNotification(
      `Approved account for ${teacherEmail}. Teacher now has publishing rights.`,
      "success",
    );
  };

  // 2. Reject / Delete Pending Teacher Registration
  const handleRejectTeacher = (teacherEmail) => {
    setRegisteredUsers((prev) =>
      prev.filter(
        (user) => user.email.toLowerCase() !== teacherEmail.toLowerCase(),
      ),
    );

    appendAuditLog(
      "REJECT_TEACHER",
      teacherEmail,
      `Rejected pending teacher account registration request for ${teacherEmail}.`,
    );

    triggerNotification(
      `Rejected pending registration for ${teacherEmail}.`,
      "amber",
    );
  };

  // 3. Pre-Authorize Single or Bulk User Email(s) and Phone Numbers
  const handlePreAuthorizeUsers = (newEntries) => {
    // newEntries: Array of { email, role, phone }
    const formattedEntries = newEntries.map((entry, idx) => ({
      id: `pa_${Date.now()}_${idx}`,
      email: entry.email.trim().toLowerCase(),
      role: entry.role,
      phone: entry.phone ? entry.phone.trim() : "N/A",
      isRegistered: false,
      dateAdded: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    setPreAuthorizedUsers((prev) => [...formattedEntries, ...prev]);

    appendAuditLog(
      "PRE_AUTHORIZE_USERS",
      `${newEntries.length} User(s)`,
      `Pre-approved ${newEntries.length} new institutional email address(es) and mobile phone records.`,
    );

    triggerNotification(
      `Successfully pre-authorized ${newEntries.length} new user address(es)!`,
      "success",
    );
    setIsPreAuthModalOpen(false);
  };

  // 4. Update Student / User Mobile Phone Number in Directory
  const handleUpdateUserPhone = (email, newPhone) => {
    setPreAuthorizedUsers((prev) =>
      prev.map((item) => {
        if (item.email.toLowerCase() === email.toLowerCase()) {
          return { ...item, phone: newPhone };
        }
        return item;
      }),
    );

    setRegisteredUsers((prev) =>
      prev.map((user) => {
        if (user.email.toLowerCase() === email.toLowerCase()) {
          return { ...user, phone: newPhone };
        }
        return user;
      }),
    );

    appendAuditLog(
      "UPDATE_PHONE_NUMBER",
      email,
      `Updated linked international E.164 phone number to ${newPhone}.`,
    );

    triggerNotification(
      `Updated phone number for ${email} to ${newPhone}.`,
      "success",
    );
  };

  // 5. Top Up Africa's Talking SMS Credits
  const handleTopUpSMSCredits = (creditUnits) => {
    setSmsGateway((prev) => ({
      ...prev,
      creditBalance: prev.creditBalance + creditUnits,
    }));

    appendAuditLog(
      "TOP_UP_SMS_CREDITS",
      `+${creditUnits} Credits`,
      `Purchased and added ${creditUnits} broadcast units to Africa's Talking API wallet.`,
    );

    triggerNotification(
      `Added +${creditUnits} SMS credit units to carrier balance!`,
      "success",
    );
  };

  // 6. Execute Non-Destructive Browser Storage Sanitizer
  const handleSanitizeStorage = () => {
    // Clear temporary render caches while protecting gradebooks, pre-approved rosters, and credentials
    const itemsCleared = ["teacher_pending_drafts", "student_draft_previews"];
    itemsCleared.forEach((key) => localStorage.removeItem(key));

    appendAuditLog(
      "STORAGE_SANITIZATION",
      "Browser LocalStorage",
      "Executed 1-Click Sanitizer: Cleared unneeded temporary previews while preserving student gradebooks and auth tokens.",
    );

    triggerNotification(
      "Browser cache sanitized successfully! Freed up storage space.",
      "success",
    );
  };

  const totalStudents = preAuthorizedUsers.filter(
    (u) => u.role === "student",
  ).length;
  const totalTeachers = registeredUsers.filter(
    (u) => u.role === "teacher",
  ).length;
  const pendingTeacherApprovals = registeredUsers.filter(
    (u) => u.role === "teacher" && !u.isApproved,
  );
  const totalRegisteredAccounts = registeredUsers.length;

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800 pb-12">
      {/* Toast Notification Banner */}
      {statusMessage && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold text-white ${
              statusMessage.type === "success"
                ? "bg-emerald-600 border-emerald-500"
                : "bg-amber-600 border-amber-500"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* HEADER BAR: Administrator Control Terminal Identity */}
      <div className="bg-white md:px-15 border border-slate-200  p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider bg-slate-800 border px-2.5 py-1 rounded-lg">
              IT Governance & Security Console
            </span>
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              Institution Admin
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-2">
            System Admin Console &bull; {currentUser?.username || "SuperAdmin"}
          </h1>
          <p className="text-xs text-black mt-0.5">
            Oversee user onboarding pre-authorizations, verify teacher accounts,
            route SMS notifications, and monitor browser storage health.
          </p>
        </div>

        {/* Dynamic Status Indicator and Sign Out */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition ${
              isOnlineSimulated
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
            }`}
          >
            {isOnlineSimulated ? (
              <Wifi className="h-4 w-4 text-emerald-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-400" />
            )}
            <div className="flex flex-col">
              <span>{isOnlineSimulated ? "Online" : "Offline Mode"}</span>
              <span className="text-[10px] font-medium text-black">
                Africa's Talking API: {smsGateway.creditBalance} Credits
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-700 rounded-2xl transition"
              title="Sign Out of Admin Console"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4 MAIN ADMINISTRATIVE WORKSPACE TABS */}
      <div className="bg-white mx-10 md:mx-60 border border-slate-200 rounded-2xl p-2 shadow-sm flex items-center justify-between gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "dashboard"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "users"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>
            User Directory & Approvals (
            {pendingTeacherApprovals.length > 0
              ? `⚠️ ${pendingTeacherApprovals.length}`
              : registeredUsers.length}
            )
          </span>
        </button>

        <button
          onClick={() => setActiveTab("sms")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "sms"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Smartphone className="h-4 w-4" />
          <span>SMS Gateway Hub ({smsGateway.creditBalance} Units)</span>
        </button>

        <button
          onClick={() => setActiveTab("storage")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "storage"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <HardDrive className="h-4 w-4" />
          <span>Storage Health & Audit Logs</span>
        </button>
      </div>

      <div className="space-y-6 mx-10 md:mx-40">
        <div>
          {/* TAB 1: EXECUTIVE DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <AdminDashboardTab
              totalStudents={totalStudents}
              totalTeachers={totalTeachers}
              pendingTeacherApprovals={pendingTeacherApprovals}
              totalRegisteredAccounts={totalRegisteredAccounts}
              smsCreditBalance={smsGateway.creditBalance}
              auditLogs={auditLogs}
              onNavigateTab={(tabName) => setActiveTab(tabName)}
              onOpenPreAuthModal={() => setIsPreAuthModalOpen(true)}
              onApproveTeacher={handleApproveTeacher}
            />
          )}

          {/* TAB 2: USER DIRECTORY, TEACHER APPROVALS & STUDENT PHONE REGISTRY */}
          {activeTab === "users" && (
            <AdminUserManagementTab
              preAuthorizedUsers={preAuthorizedUsers}
              registeredUsers={registeredUsers}
              pendingTeacherApprovals={pendingTeacherApprovals}
              onOpenPreAuthModal={() => setIsPreAuthModalOpen(true)}
              onApproveTeacher={handleApproveTeacher}
              onRejectTeacher={handleRejectTeacher}
              onUpdatePhone={handleUpdateUserPhone}
            />
          )}

          <div class="flex flex-col items-center justify-center">
            {/* TAB 3: AFRICA'S TALKING SMS GATEWAY CONFIG & DISPATCH LOGS */}
            {activeTab === "sms" && (
              <AdminSMSGatewayTab
                smsGateway={smsGateway}
                studentCount={totalStudents}
                isOnlineSimulated={isOnlineSimulated}
                onTopUpCredits={handleTopUpSMSCredits}
              />
            )}
          </div>

          {/* TAB 4: SYSTEM METRICS, LOCALSTORAGE SANITIZER & AUDIT LOGS */}
          {activeTab === "storage" && (
            <AdminStorageHealthTab
              auditLogs={auditLogs}
              onSanitizeStorage={handleSanitizeStorage}
              onSelectLogDetail={(log) => setSelectedLogDetail(log)}
            />
          )}

          {/* MODAL 1: PRE-AUTHORIZE EMAIL ADDRESSES & PHONE NUMBERS */}
          {isPreAuthModalOpen && (
            <PreAuthorizeUserModal
              onSubmit={handlePreAuthorizeUsers}
              onClose={() => setIsPreAuthModalOpen(false)}
            />
          )}

          {/* MODAL 2: DETAILED SYSTEM AUDIT LOG INSPECTOR */}
          {selectedLogDetail && (
            <SystemLogDetailsModal
              log={selectedLogDetail}
              onClose={() => setSelectedLogDetail(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
