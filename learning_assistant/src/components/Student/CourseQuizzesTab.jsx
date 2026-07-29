/*import { Play } from "lucide-react";

export default function CourseQuizzesTab({
  activeCourse,
  quizAttempts,
  handleStartQuiz,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-base text-slate-900">
        Interactive Offline Evaluations
      </h3>
      <p className="text-xs text-slate-500">
        Quizzes taken offline grade automatically on your device and queue
        scores for sync when connected.
      </p>

      {activeCourse.quizzes.map((quiz) => {
        const pastAttempt = quizAttempts.find((a) => a.quizId === quiz.id);

        return (
          <div
            key={quiz.id}
            className="p-5 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4"
          >
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">{quiz.title}</h4>
              <p className="text-xs text-slate-500">
                {quiz.questions.length} Questions • Time: {quiz.timeLimit}
              </p>

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

            <button
              onClick={() => handleStartQuiz(quiz)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2 self-start sm:self-auto"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>{pastAttempt ? "Retake Quiz" : "Start Offline Quiz"}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}*/
import { Play, HelpCircle } from "lucide-react";

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
        // Safe attempt search
        const pastAttempt = attempts.find((a) => a.quizId === quiz.id);

        // Safely calculate question count & time limit (supports camelCase & snake_case)
        const questionCount =
          quiz.questions?.length ?? quiz.question_count ?? 0;
        const timeLimitFormatted =
          quiz.timeLimit || quiz.time_limit || "10 min";

        return (
          <div
            key={quiz.id || index}
            className="p-5 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4"
          >
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">{quiz.title}</h4>
              <p className="text-xs text-slate-500">
                {questionCount} Question{questionCount === 1 ? "" : "s"} • Time:{" "}
                {timeLimitFormatted}
              </p>

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

            <button
              onClick={() => handleStartQuiz && handleStartQuiz(quiz)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2 self-start sm:self-auto"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>{pastAttempt ? "Retake Quiz" : "Start Offline Quiz"}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
