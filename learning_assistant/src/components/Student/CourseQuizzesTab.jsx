import { Play, HelpCircle } from "lucide-react";
import { getQuizQuestions } from "../../utils/quizHelpers";

export default function CourseQuizzesTab({
  activeCourse,
  quizAttempts = [],
  handleStartQuiz,
}) {
  // 1. Defensively extract arrays with empty fallbacks
  const quizzes = activeCourse?.quizzes || [];
  const attempts = quizAttempts || [];

  // 2. Render an empty state card if the course has no quizzes yet
  if (quizzes.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-sm">
        <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-800 text-base">
          No Quizzes Available
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Your instructor hasn't published any quizzes or self-assessment
          modules for this course yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-base text-slate-900">
        Interactive Offline Evaluations
      </h3>
      <p className="text-xs text-slate-500">
        Quizzes taken offline grade automatically on your device and queue
        scores for sync when connected.
      </p>

      {quizzes.map((quiz, index) => {
        // 💡 1. Uses `attempts` to find past results (Fixes linter warning!)
        const pastAttempt = attempts.find(
          (a) => a.quizId === quiz.id || a.quiz_id === quiz.id,
        );

        // 💡 2. Extract parsed questions list safely
        const questions = getQuizQuestions(quiz);
        const timeLimitFormatted =
          quiz.time_limit || quiz.timeLimit || "15 mins";

        return (
          <div
            key={quiz.id || index}
            className="p-5 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4"
          >
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">{quiz.title}</h4>
              <p className="text-xs text-slate-500">
                ❓ {questions.length} Question
                {questions.length === 1 ? "" : "s"} • 🕒 Time:{" "}
                {timeLimitFormatted}
              </p>

              {/* Past Attempt Score Badges */}
              {pastAttempt && (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    Previous Score: {pastAttempt.score}%
                  </span>
                  {pastAttempt.status === "pending_sync" && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      ⏳ Saved locally — Pending upload
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Start / Retake Quiz Button */}
            <button
              disabled={questions.length === 0}
              onClick={() => {
                // Pass normalized quiz object with questions attached to QuizModal
                handleStartQuiz && handleStartQuiz({ ...quiz, questions });
              }}
              className={`text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2 self-start sm:self-auto ${
                questions.length === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>{pastAttempt ? "Retake Quiz" : "Start Quiz"}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
