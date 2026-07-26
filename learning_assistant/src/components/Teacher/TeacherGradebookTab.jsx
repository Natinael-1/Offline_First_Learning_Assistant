import { useState } from "react";
import {
  BarChart3,
  Users,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Check,
  X,
} from "lucide-react";

/**
 * TeacherGradebookTab Component
 *
 * Renders the score ledger and class performance analytics for an active course.
 * Allows instructors to search, filter by quiz title, review pass rates,
 * and inspect detailed student question breakdown logs.
 *
 * @param {Object} activeCourse - Active course object
 * @param {Array} quizAttempts - Array of student quiz attempts for this course
 * @param {Function} onSelectAttemptDetail - Callback (attempt) => void to open details modal
 */

// Threshold used both for aggregate pass-rate stats and the per-row badge —
// pulled out so the two can't drift apart if it's ever tuned.
const PASS_THRESHOLD = 70;

export default function TeacherGradebookTab({
  activeCourse,
  quizAttempts = [],
  onSelectAttemptDetail,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("ALL");

  const courseQuizzes = activeCourse?.quizzes || [];

  const totalAttempts = quizAttempts.length;
  const averageScore =
    totalAttempts > 0
      ? Math.round(
          quizAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) /
            totalAttempts,
        )
      : 0;

  const passingAttempts = quizAttempts.filter(
    (a) => (a.score || 0) >= PASS_THRESHOLD,
  ).length;
  const passRate =
    totalAttempts > 0 ? Math.round((passingAttempts / totalAttempts) * 100) : 0;

  const pendingSyncCount = quizAttempts.filter(
    (a) => a.status === "pending_sync",
  ).length;

  const filteredAttempts = quizAttempts.filter((attempt) => {
    const matchesSearch =
      (attempt.studentName &&
        attempt.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (attempt.studentEmail &&
        attempt.studentEmail
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (attempt.quizTitle &&
        attempt.quizTitle.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesQuiz =
      selectedQuizId === "ALL" || attempt.quizId === selectedQuizId;

    return matchesSearch && matchesQuiz;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: HEADER & STATS SUMMARY CARDS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Class Gradebook & Score Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Real-time evaluation scores synced from student mobile devices
                and local outboxes.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Auto-Graded Engine</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-indigo-500" /> Total
              Submissions
            </span>
            <p className="text-2xl font-black text-slate-900">
              {totalAttempts}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Logged score records
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5 text-indigo-500" /> Class
              Average
            </span>
            <p className="text-2xl font-black text-indigo-600">
              {totalAttempts > 0 ? `${averageScore}%` : "N/A"}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Across all quiz modules
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Pass Rate
              (&ge; {PASS_THRESHOLD}%)
            </span>
            <p className="text-2xl font-black text-emerald-600">
              {totalAttempts > 0 ? `${passRate}%` : "N/A"}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              {passingAttempts} passed of {totalAttempts}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending Sync
            </span>
            <p className="text-2xl font-black text-amber-600">
              {pendingSyncCount}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Queued from student devices
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: FILTERS & SEARCH CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name, email, or quiz title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
              Filter Quiz:
            </label>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">
                All Quiz Modules ({courseQuizzes.length})
              </option>
              {courseQuizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 3: STUDENT SCORES LEDGER TABLE */}
        {filteredAttempts.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-2">
            <FileSpreadsheet className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              No score records found
            </p>
            <p className="text-[11px] text-slate-400">
              {searchTerm || selectedQuizId !== "ALL"
                ? "Try clearing your search query or quiz filter."
                : "As students complete offline quizzes, their scores will sync automatically to this gradebook."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Quiz Title</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Sync State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredAttempts.map((attempt) => {
                  const isPassed = (attempt.score || 0) >= PASS_THRESHOLD;

                  return (
                    <tr
                      key={attempt.id}
                      className="hover:bg-slate-50/80 transition"
                    >
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        {/*
                          Fixed: was falling back to a hardcoded real name
                          ("Natinael Boda" / student@school.edu) whenever a
                          record lacked studentName/studentEmail — which is
                          every real student submission today, since
                          StudentPortal.handleSubmitQuiz doesn't set those
                          fields. That silently misattributed every real
                          student's score to one specific person. The real
                          fix is upstream in StudentPortal; this at least
                          stops the false attribution here.
                        */}
                        <div className="font-bold text-slate-900">
                          {attempt.studentName || "Unknown Student"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {attempt.studentEmail || "No email on record"}
                        </div>
                      </td>

                      {/* Quiz Title & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {attempt.quizTitle}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{attempt.timestamp}</span>
                        </div>
                      </td>

                      {/* Score Percentage */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block font-black text-sm px-2.5 py-0.5 rounded-lg ${
                            isPassed
                              ? "text-emerald-700 bg-emerald-50"
                              : "text-rose-700 bg-rose-50"
                          }`}
                        >
                          {attempt.score}%
                        </span>
                      </td>

                      {/* Pass / Fail Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                            isPassed
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isPassed ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>{isPassed ? "Passed" : "Needs Review"}</span>
                        </span>
                      </td>

                      {/* Sync Status */}
                      <td className="py-3.5 px-4 text-center">
                        {attempt.status === "pending_sync" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                            <Clock className="h-3 w-3 text-amber-600" />
                            <span>Pending Sync</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Synced</span>
                          </span>
                        )}
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() =>
                            typeof onSelectAttemptDetail === "function" &&
                            onSelectAttemptDetail(attempt)
                          }
                          className="bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-[11px] font-bold px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1"
                          title="Inspect detailed answer key breakdown"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
