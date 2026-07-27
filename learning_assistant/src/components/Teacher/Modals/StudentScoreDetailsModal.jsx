import { useEffect } from "react";
/*
 Award,
*/
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Check,
  AlertCircle,
  FileText,
  BarChart2,
} from "lucide-react";

/**
 * StudentScoreDetailsModal Component
 *
 * Detailed inspector overlay for instructors to audit an individual
 * student's quiz attempt, question-by-question selections, correct keys,
 * and synchronization status.
 *
 * @param {Object} attempt - Selected student quiz attempt object
 * @param {Function} onClose - Callback () => void to close modal overlay
 */
export default function StudentScoreDetailsModal({ attempt, onClose }) {
  // ESC key listener to exit modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!attempt) return null;

  const isPassed = (attempt.score || 0) >= 70;
  const breakdown = attempt.breakdown || [];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
                Gradebook Audit Inspector
              </span>
              <h3 className="font-extrabold text-base leading-tight text-white">
                Student Submission Record
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800"
            title="Close modal (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* STUDENT & QUIZ METADATA CARD */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            {/* Student Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {attempt.studentName || "Natinael Boda"}
                  </h4>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5 font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-indigo-500" />
                  {attempt.studentEmail || "student@school.edu"}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" />
                  Submitted: {attempt.timestamp || "Jul 25, 2026"}
                </span>
              </div>
            </div>

            {/* Sync State Badge */}
            <div className="self-start sm:self-auto">
              {attempt.status === "pending_sync" ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-xl">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Cached on Device</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Synced to Cloud</span>
                </span>
              )}
            </div>
          </div>

          {/* SCORE PERFORMANCE BANNER */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left relative overflow-hidden">
            <div className="space-y-1 relative z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-0.5 rounded-md">
                Evaluation Module: {attempt.quizTitle}
              </span>
              <h4 className="text-xl font-black text-white pt-1">
                {isPassed ? "Passed Evaluation" : "Needs Concept Review"}
              </h4>
              <p className="text-xs text-slate-300">
                Answered correctly:{" "}
                <strong className="text-white">
                  {attempt.correctCount || 0}
                </strong>{" "}
                out of{" "}
                <strong className="text-white">
                  {attempt.totalQuestions || 0}
                </strong>{" "}
                prompts
              </p>
            </div>

            {/* Score Big Display Pill */}
            <div
              className={`px-6 py-3 rounded-2xl border flex flex-col items-center justify-center shrink-0 z-10 ${
                isPassed
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-500/20 border-rose-500/40 text-rose-300"
              }`}
            >
              <span className="text-3xl font-black tracking-tight">
                {attempt.score}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                {isPassed ? "Pass Threshold Met" : "Below 70% Cutoff"}
              </span>
            </div>
          </div>

          {/* QUESTION BY QUESTION BREAKDOWN */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-600" />
                Question Choice Audit ({breakdown.length})
              </h4>
              <span className="text-[10px] font-medium text-slate-400">
                Student choices matched against answer keys
              </span>
            </div>

            {breakdown.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                <AlertCircle className="h-6 w-6 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">
                  No question-level choice logs available
                </p>
                <p className="text-[11px] text-slate-400">
                  This attempt only recorded overall percentage summary metrics.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {breakdown.map((item, idx) => (
                  <div
                    key={item.questionId || idx}
                    className={`p-4 rounded-2xl border space-y-2 text-xs transition ${
                      item.isCorrect
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-rose-50/50 border-rose-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-slate-900 leading-snug">
                        {idx + 1}. {item.questionText}
                      </p>

                      {item.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md uppercase shrink-0">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />{" "}
                          Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-md uppercase shrink-0">
                          <XCircle className="h-3 w-3 text-rose-600" />{" "}
                          Incorrect
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 pt-1 text-[11px]">
                      <p className="text-slate-600">
                        Student selected:{" "}
                        <strong
                          className={
                            item.isCorrect
                              ? "text-emerald-800"
                              : "text-rose-800"
                          }
                        >
                          {item.selectedOption !== undefined && item.options
                            ? item.options[item.selectedOption]
                            : "No selection"}
                        </strong>
                      </p>

                      {!item.isCorrect && item.options && (
                        <p className="text-emerald-800 font-semibold flex items-center gap-1">
                          <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span>
                            Correct Answer Key:{" "}
                            <strong>{item.options[item.correctAnswer]}</strong>
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md"
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
