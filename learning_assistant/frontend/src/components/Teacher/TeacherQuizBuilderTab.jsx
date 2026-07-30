import { useState } from "react";

import {
  Award,
  Plus,
  HelpCircle,
  Clock,
  Users,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";

/**
 * @param {Object} activeCourse - Active course object containing quizzes
 * @param {Function} onOpenQuizCreator - Callback to open the visual Quiz Creator modal
 * @param {Array} quizAttempts - Array of student quiz score attempts for this course
 */
const getLatestAttemptPerStudent = (attempts) => {
  const seen = new Set();
  const latest = [];
  for (const attempt of attempts) {
    const studentKey =
      attempt.studentEmail || attempt.studentName || attempt.id;
    if (!seen.has(studentKey)) {
      seen.add(studentKey);
      latest.push(attempt);
    }
  }
  return latest;
};

export default function TeacherQuizBuilderTab({
  activeCourse,
  onOpenQuizCreator,
  quizAttempts = [],
}) {
  const [expandedQuizId, setExpandedQuizId] = useState(null);

  const quizzesList = activeCourse?.quizzes || [];

  const toggleExpandQuiz = (quizId) => {
    setExpandedQuizId((prev) => (prev === quizId ? null : quizId));
  };

  // Aggregate stats across all attempts for this course, deduped per student
  const dedupedAttempts = getLatestAttemptPerStudent(quizAttempts);
  const totalAttemptsCount = dedupedAttempts.length;
  const overallAvgScore =
    totalAttemptsCount > 0
      ? Math.round(
          dedupedAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) /
            totalAttemptsCount,
        )
      : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: HEADER & CREATE CTA BANNER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-200">
              Interactive Assessment Engine
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {quizzesList.length} Active Quizzes
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Self-Grading Quizzes & Evaluations
          </h3>
          <p className="text-xs text-slate-500 max-w-xl">
            Quizzes grade client-side on student devices when offline, then
            queue scores for automatic synchronization to your gradebook once
            reconnected.
          </p>
        </div>

        <button
          onClick={onOpenQuizCreator}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-2xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 group"
        >
          <Plus className="h-4 w-4 group-hover:scale-110 transition" />
          <span>Construct New Quiz</span>
        </button>
      </div>

      {/* SECTION 2: CLASS PERFORMANCE SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Published Quizzes
            </p>
            <h4 className="text-lg font-black text-slate-900">
              {quizzesList.length} Modules
            </h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Submissions
            </p>
            <h4 className="text-lg font-black text-slate-900">
              {totalAttemptsCount} Attempts
            </h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Class Average Score
            </p>
            <h4 className="text-lg font-black text-slate-900">
              {totalAttemptsCount > 0 ? `${overallAvgScore}%` : "N/A"}
            </h4>
          </div>
        </div>
      </div>

      {/* SECTION 3: QUIZZES LIST & EXPANDABLE QUESTION PREVIEW */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-slate-900 text-base">
              Course Quizzes ({quizzesList.length})
            </h3>
            <p className="text-xs text-slate-500">
              Click any quiz card to review question structure and correct
              answer keys.
            </p>
          </div>
        </div>

        {quizzesList.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-800">
                No quizzes published yet
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create interactive multiple-choice tests for students to
                practice offline on their mobile devices.
              </p>
            </div>
            <button
              onClick={onOpenQuizCreator}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Launch Quiz Builder</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzesList.map((quiz) => {
              const isExpanded = expandedQuizId === quiz.id;
              const specificAttempts = getLatestAttemptPerStudent(
                quizAttempts.filter((a) => a.quizId === quiz.id),
              );
              const quizAvg =
                specificAttempts.length > 0
                  ? Math.round(
                      specificAttempts.reduce((a, b) => a + (b.score || 0), 0) /
                        specificAttempts.length,
                    )
                  : 0;

              return (
                <div
                  key={quiz.id}
                  className={`border rounded-2xl transition overflow-hidden ${
                    isExpanded
                      ? "border-indigo-500 shadow-md bg-white"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  }`}
                >
                  <div
                    onClick={() => toggleExpandQuiz(quiz.id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-indigo-600 shrink-0" />
                        <h4 className="font-bold text-slate-900 text-sm">
                          {quiz.title}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium pt-0.5">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5 text-indigo-500" />
                          {quiz.questions?.length || 0} Questions
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-indigo-500" />
                          Time: {quiz.timeLimit || "15 mins"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/60">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-slate-100 font-bold text-slate-700 px-3 py-1 rounded-xl">
                          {specificAttempts.length} Submissions
                        </span>
                        {specificAttempts.length > 0 && (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 rounded-xl">
                            Avg: {quizAvg}%
                          </span>
                        )}
                      </div>

                      <button
                        className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 transition"
                        title={
                          isExpanded
                            ? "Collapse Questions"
                            : "View Questions Key"
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4 animate-fadeIn">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 pb-1">
                        <span>Questions Key & Options Breakdown:</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          Green badge highlights the correct auto-grading answer
                          index
                        </span>
                      </div>

                      <div className="space-y-4">
                        {quiz.questions &&
                          quiz.questions.map((q, qIdx) => (
                            <div
                              key={q.id || qIdx}
                              className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5"
                            >
                              <p className="text-xs font-bold text-slate-900">
                                {qIdx + 1}. {q.question}
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {q.options &&
                                  q.options.map((opt, optIdx) => {
                                    const isCorrect =
                                      optIdx === q.correctAnswer;

                                    return (
                                      <div
                                        key={optIdx}
                                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
                                          isCorrect
                                            ? "bg-emerald-50/70 border-emerald-500 text-emerald-950 font-bold"
                                            : "bg-slate-50 border-slate-200 text-slate-600"
                                        }`}
                                      >
                                        <span className="flex items-center gap-2">
                                          <span
                                            className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                              isCorrect
                                                ? "bg-emerald-600 text-white"
                                                : "bg-slate-200 text-slate-600"
                                            }`}
                                          >
                                            {String.fromCharCode(65 + optIdx)}
                                          </span>
                                          {opt}
                                        </span>

                                        {isCorrect && (
                                          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold uppercase tracking-wider shrink-0">
                                            <Check className="h-3.5 w-3.5" />{" "}
                                            Correct Key
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
