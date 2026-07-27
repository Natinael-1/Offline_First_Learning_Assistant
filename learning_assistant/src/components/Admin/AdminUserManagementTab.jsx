import { useState } from "react";

/*
Check,
AlertCircle,
Filter,
Shield,
XCircle,
  */

import {
  Users,
  UserCheck,
  UserX,
  CheckCircle2,
  Search,
  Plus,
  Phone,
  Edit3,
  Save,
  X,
  Mail,
  ShieldAlert,
  Smartphone,
} from "lucide-react";

/**
 * AdminUserManagementTab Component
 *
 * Manages institutional access control, pending instructor verification,
 * pre-authorized email rosters, and international phone number registries
 * required for cell tower SMS broadcasts.
 *
 * @param {Array} preAuthorizedUsers - Roster of pre-approved email entries
 * @param {Array} registeredUsers - Roster of registered user profiles
 * @param {Array} pendingTeacherApprovals - Queue of unapproved instructor accounts
 * @param {Function} onOpenPreAuthModal - Callback () => void to open pre-auth dialog
 * @param {Function} onApproveTeacher - Callback (email) => void to grant teacher rights
 * @param {Function} onRejectTeacher - Callback (email) => void to deny teacher rights
 * @param {Function} onUpdatePhone - Callback (email, newPhone) => void to update phone record
 */
export default function AdminUserManagementTab({
  preAuthorizedUsers = [],
  registeredUsers = [],
  pendingTeacherApprovals = [],
  onOpenPreAuthModal,
  onApproveTeacher,
  onRejectTeacher,
  onUpdatePhone,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL"); // 'ALL' | 'student' | 'teacher' | 'admin'
  const [activeSubView, setActiveSubTab] = useState("approvals"); // 'approvals' | 'directory' | 'phones'

  // Inline Phone Editing State
  const [editingPhoneEmail, setEditingPhoneEmail] = useState(null);
  const [phoneInputValue, setPhoneInputValue] = useState("");

  const handleStartEditPhone = (email, currentPhone) => {
    setEditingPhoneEmail(email);
    setPhoneInputValue(
      currentPhone && currentPhone !== "N/A" ? currentPhone : "+250788000000",
    );
  };

  const handleSavePhone = (email) => {
    if (onUpdatePhone && phoneInputValue.trim()) {
      onUpdatePhone(email, phoneInputValue.trim());
    }
    setEditingPhoneEmail(null);
    setPhoneInputValue("");
  };

  const handleCancelEditPhone = () => {
    setEditingPhoneEmail(null);
    setPhoneInputValue("");
  };

  // Filtered Pre-Authorized Users
  const filteredPreAuthList = preAuthorizedUsers.filter((item) => {
    const matchesSearch =
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone &&
        item.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === "ALL" || item.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const pendingCount = pendingTeacherApprovals.length;
  const registeredCount = registeredUsers.length;
  const phoneMappedCount = preAuthorizedUsers.filter(
    (u) => u.phone && u.phone !== "N/A",
  ).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: TOP KPI SUB-HEADER & SUB-NAVIGATION */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                Identity & Access Management
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              User Directory, Approvals & Phone Registry
            </h2>
            <p className="text-xs text-slate-500">
              Verify instructor publishing credentials, pre-authorize
              institutional emails, and keep student mobile phone numbers up to
              date.
            </p>
          </div>

          <button
            onClick={onOpenPreAuthModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition shadow-md flex items-center gap-2 shrink-0 self-start md:self-auto group"
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition" />
            <span>Pre-Authorize New User</span>
          </button>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveSubTab("approvals")}
            className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
              activeSubView === "approvals"
                ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20"
                : "bg-slate-50 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-amber-600" /> Pending
                Approvals
              </span>
              <p className="text-2xl font-black text-slate-900">
                {pendingCount}
              </p>
            </div>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full animate-pulse">
                Action Req.
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("directory")}
            className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
              activeSubView === "directory"
                ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-400/20"
                : "bg-slate-50 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-indigo-600" /> Pre-Approved
                Roster
              </span>
              <p className="text-2xl font-black text-slate-900">
                {preAuthorizedUsers.length}
              </p>
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {registeredCount} Registered
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("phones")}
            className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
              activeSubView === "phones"
                ? "bg-purple-50/70 border-purple-300 ring-2 ring-purple-400/20"
                : "bg-slate-50 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-purple-600" /> Linked Phone
                Registry
              </span>
              <p className="text-2xl font-black text-slate-900">
                {phoneMappedCount}
              </p>
            </div>
            <span className="text-xs text-purple-700 font-bold">SMS Ready</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: VIEW 1 - PENDING TEACHER APPROVAL QUEUE */}
      {activeSubView === "approvals" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                Instructor Verification Queue ({pendingCount})
              </h3>
              <p className="text-xs text-slate-500">
                Newly self-registered teachers require admin validation before
                publishing courses.
              </p>
            </div>
          </div>

          {pendingCount === 0 ? (
            <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
              <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-800">
                  Verification Queue Clear
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  All registered faculty accounts have been verified and granted
                  publishing privileges.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTeacherApprovals.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-amber-300"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {teacher.username}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                        Pending Verification
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {teacher.email}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {teacher.phone || "No phone linked"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                    <button
                      onClick={() =>
                        onRejectTeacher && onRejectTeacher(teacher.email)
                      }
                      className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() =>
                        onApproveTeacher && onApproveTeacher(teacher.email)
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve Account</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: VIEW 2 - PRE-AUTHORIZED EMAIL ROSTER & DIRECTORY */}
      {activeSubView === "directory" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search pre-approved email address or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            {/* Role Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "student", "teacher", "admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition uppercase ${
                    roleFilter === role
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Authorized Email Address</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Linked Phone (SMS)</th>
                  <th className="py-3.5 px-4 text-center">
                    Registration Status
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredPreAuthList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-slate-400 italic"
                    >
                      No pre-authorized email records matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPreAuthList.map((user) => {
                    const isEditingThis = editingPhoneEmail === user.email;

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50/80 transition"
                      >
                        {/* Email Address */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {user.email}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Added: {user.dateAdded || "Jul 2026"}
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${
                              user.role === "admin"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : user.role === "teacher"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* Linked Phone with Inline Edit */}
                        <td className="py-3.5 px-4">
                          {isEditingThis ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={phoneInputValue}
                                onChange={(e) =>
                                  setPhoneInputValue(e.target.value)
                                }
                                className="px-2.5 py-1 bg-white border border-indigo-400 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 w-36 font-semibold"
                                placeholder="+250788000000"
                              />
                              <button
                                onClick={() => handleSavePhone(user.email)}
                                className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                                title="Save phone"
                              >
                                <Save className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={handleCancelEditPhone}
                                className="p-1 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition"
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="flex items-center gap-2 font-medium text-slate-800">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              <span>{user.phone || "N/A"}</span>
                            </span>
                          )}
                        </td>

                        {/* Registration Status */}
                        <td className="py-3.5 px-4 text-center">
                          {user.isRegistered ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Registered</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg">
                              <span>Awaiting Signup</span>
                            </span>
                          )}
                        </td>

                        {/* Action: Edit Phone */}
                        <td className="py-3.5 px-4 text-right">
                          {!isEditingThis && (
                            <button
                              onClick={() =>
                                handleStartEditPhone(user.email, user.phone)
                              }
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition inline-flex items-center gap-1"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Edit Phone</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: VIEW 3 - PHONE NUMBER REGISTRY (SMS CARRIER FOCUS) */}
      {activeSubView === "phones" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-600" />
                Cellular SMS Phone Registry ($E.164$ International Format)
              </h3>
              <p className="text-xs text-slate-500">
                Africa's Talking API requires valid phone numbers formatted with
                country codes (e.g., +250...) to reach feature phones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preAuthorizedUsers.map((item) => {
              const isEditingThis = editingPhoneEmail === item.email;

              return (
                <div
                  key={item.id}
                  className="p-4 border border-slate-200 rounded-2xl bg-slate-50/60 flex items-center justify-between gap-3 hover:border-purple-300 transition"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 text-xs block">
                      {item.email}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md inline-block ${
                        item.role === "student"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {item.role}
                    </span>
                  </div>

                  <div className="text-right">
                    {isEditingThis ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={phoneInputValue}
                          onChange={(e) => setPhoneInputValue(e.target.value)}
                          className="px-2 py-1 bg-white border border-purple-400 rounded-lg text-xs outline-none w-32 font-bold"
                          placeholder="+250..."
                        />
                        <button
                          onClick={() => handleSavePhone(item.email)}
                          className="p-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-900 block">
                            {item.phone && item.phone !== "N/A"
                              ? item.phone
                              : "⚠️ Missing Phone"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Linked for SMS
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleStartEditPhone(item.email, item.phone)
                          }
                          className="p-1.5 bg-white border border-slate-200 hover:bg-purple-50 text-slate-600 hover:text-purple-600 rounded-xl transition"
                          title="Update phone number"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
