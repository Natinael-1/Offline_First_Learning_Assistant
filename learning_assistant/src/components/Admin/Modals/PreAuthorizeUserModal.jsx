import { useState, useEffect } from "react";


import {
  X,
  UserPlus,
  Mail,
  Phone,
  Shield,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ListPlus,
} from "lucide-react";

/**
 
 *
 * @param {Function} onSubmit - Callback function (newEntriesArray) => void
 * @param {Function} onClose - Callback function () => void to dismiss modal
 */
export default function PreAuthorizeUserModal({ onSubmit, onClose }) {
  const [entryMode, setEntryMode] = useState("single"); // 'single' | 'bulk'

  // Single Entry Form State
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [phone, setPhone] = useState("+250788000000");

  // Bulk Entry Form State
  const [bulkText, setBulkText] = useState("");
  //const [defaultBulkRole, setDefaultBulkRole] = useState("student");

  // Form Feedback State
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const validateDomain = (emailStr) => {
    const clean = emailStr.trim().toLowerCase();
    if (clean.endsWith("@student.edu")) return "student";
    if (clean.endsWith("@teacher.edu")) return "teacher";
    if (clean.endsWith("@admin.edu")) return "admin";
    return null;
  };

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage("Please enter an email address.");
      return;
    }

    const detectedRole = validateDomain(cleanEmail);
    if (!detectedRole) {
      setErrorMessage(
        "Email address must end with a valid institutional domain: @student.edu, @teacher.edu, or @admin.edu.",
      );
      return;
    }

    if (role !== detectedRole) {
      setErrorMessage(
        `The selected role (${role.toUpperCase()}) does not match the email domain extension (@${cleanEmail.split("@")[1]}). Domain indicates: ${detectedRole.toUpperCase()}.`,
      );
      return;
    }

    setIsSubmitting(true);

    const payload = [
      {
        email: cleanEmail,
        role: detectedRole,
        phone: phone.trim() || "+250788000000",
      },
    ];

    setTimeout(() => {
      if (onSubmit) {
        onSubmit(payload);
      }
      setIsSubmitting(false);
    }, 300);
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!bulkText.trim()) {
      setErrorMessage("Please enter or paste at least one email address.");
      return;
    }

    // Split text by newlines, commas, or semicolons
    const rawLines = bulkText.split(/[\n,;]+/);
    const parsedEntries = [];
    const invalidEmails = [];

    rawLines.forEach((line) => {
      const clean = line.trim().toLowerCase();
      if (!clean) return;

      const detectedRole = validateDomain(clean);
      if (detectedRole) {
        parsedEntries.push({
          email: clean,
          role: detectedRole,
          phone: "+250788000000", // Default placeholder phone if not provided
        });
      } else {
        invalidEmails.push(clean);
      }
    });

    if (invalidEmails.length > 0) {
      setErrorMessage(
        `Found ${invalidEmails.length} invalid email(s) that do not match institutional domains: ${invalidEmails.slice(0, 3).join(", ")}${invalidEmails.length > 3 ? "..." : ""}`,
      );
      return;
    }

    if (parsedEntries.length === 0) {
      setErrorMessage(
        "No valid school email addresses could be parsed from the input text.",
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (onSubmit) {
        onSubmit(parsedEntries);
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
                Access Gatekeeper
              </span>
              <h3 className="font-extrabold text-base leading-tight text-white">
                Pre-Authorize Users
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800"
            title="Close dialog (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {}
        <div className="p-6 overflow-y-auto space-y-5 flex-grow">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setEntryMode("single");
                setErrorMessage("");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                entryMode === "single"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Single Account Entry</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEntryMode("bulk");
                setErrorMessage("");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                entryMode === "bulk"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListPlus className="h-3.5 w-3.5" />
              <span>Bulk Roster Import</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs font-bold text-rose-800 animate-fadeIn">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {}
          {entryMode === "single" && (
            <form
              id="pre-auth-single-form"
              onSubmit={handleSingleSubmit}
              className="space-y-4"
            >
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-indigo-600" />
                  Institutional Email Address:
                </label>
                <input
                  type="email"
                  placeholder="e.g. newstudent@student.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    const detected = validateDomain(e.target.value);
                    if (detected) setRole(detected);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                  required
                />
                <p className="text-[10px] text-slate-400">
                  Must end in{" "}
                  <code className="text-indigo-600 font-mono">
                    @student.edu
                  </code>
                  ,{" "}
                  <code className="text-indigo-600 font-mono">
                    @teacher.edu
                  </code>
                  , or{" "}
                  <code className="text-indigo-600 font-mono">@admin.edu</code>
                </p>
              </div>

              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-indigo-600" />
                  Assigned User Role:
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  <option value="student">Student (@student.edu)</option>
                  <option value="teacher">
                    Teacher / Instructor (@teacher.edu)
                  </option>
                  <option value="admin">
                    System Administrator (@admin.edu)
                  </option>
                </select>
              </div>

              {/* Linked Mobile Phone (E.164 Format) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-purple-600" />
                  Mobile Phone Number ($E.164$ International Format):
                </label>
                <input
                  type="text"
                  placeholder="+250788000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none transition font-mono font-bold"
                  required
                />
                <p className="text-[10px] text-slate-400">
                  Required for cellular SMS alerts sent via Africa's Talking
                  API.
                </p>
              </div>
            </form>
          )}

          {}
          {entryMode === "bulk" && (
            <form
              id="pre-auth-bulk-form"
              onSubmit={handleBulkSubmit}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ListPlus className="h-3.5 w-3.5 text-indigo-600" />
                    Paste Roster Email List:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Separate by commas or newlines
                  </span>
                </label>
                <textarea
                  rows={6}
                  placeholder="student1@student.edu, student2@student.edu, teacher3@teacher.edu"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  required
                />
              </div>

              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-2.5 text-[11px] text-indigo-900">
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  System automatically assigns roles based on the email domain
                  extensions (
                  <code className="font-mono font-bold">@student.edu</code>{" "}
                  $\rightarrow$ Student,{" "}
                  <code className="font-mono font-bold">@teacher.edu</code>{" "}
                  $\rightarrow$ Teacher).
                </p>
              </div>
            </form>
          )}
        </div>

        {}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 transition shadow-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            form={
              entryMode === "single"
                ? "pre-auth-single-form"
                : "pre-auth-bulk-form"
            }
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Pre-Authorizing...</span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {entryMode === "single"
                    ? "Authorize User Account"
                    : "Import Roster List"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
