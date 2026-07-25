import { Play } from "lucide-react";

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
}
