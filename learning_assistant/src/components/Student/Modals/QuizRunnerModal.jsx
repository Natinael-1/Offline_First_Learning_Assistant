import { useState, useEffect } from "react";
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  RotateCw,
  Check,
  AlertCircle,
} from "lucide-react";

/**
 
 * @param {Object} activeQuiz - Active quiz object with questions & answers
 * @param {string|number} activeCourseId - Active course identifier
 * @param {boolean} isOnlineSimulated - Connectivity indicator
 * @param {Function} onSaveAttempt - Callback function to persist the quiz result
 * @param {Function} onClose - Callback function to close the modal overlay
 */
export default function QuizRunnerModal({
  activeQuiz,
  activeCourseId,
  isOnlineSimulated = true,
  onSaveAttempt,
  onClose,
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [submittedResult, setSubmittedResult] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Keyboard shortcut listener (Esc to close modal)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !submittedResult) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submittedResult]);

  if (
    !activeQuiz ||
    !activeQuiz.questions ||
    activeQuiz.questions.length === 0
  ) {
    return null;
  }

  const questions = activeQuiz.questions;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const isAllAnswered = answeredCount === totalQuestions;

  const handleSelectOption = (questionId, optionIndex) => {
    if (submittedResult) return; // Read-only mode after grading
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleGradeQuiz = () => {
    let correctCount = 0;
    const questionBreakdown = [];

    questions.forEach((q) => {
      const selectedOption = userAnswers[q.id];
      const isCorrect = selectedOption === q.correctAnswer;
      if (isCorrect) correctCount += 1;

      questionBreakdown.push({
        questionId: q.id,
        questionText: q.question,
        options: q.options,
        selectedOption,
        correctAnswer: q.correctAnswer,
        isCorrect,
      });
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const now = Date.now();
    const currentDate = new Date(now).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const attemptRecord = {
      id: `attempt_${now}`,
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      courseId: activeCourseId,
      score: scorePercentage,
      totalQuestions,
      correctCount,
      timestamp: currentDate,
      status: isOnlineSimulated ? "synced" : "pending_sync",
      breakdown: questionBreakdown,
    };

    setSubmittedResult(attemptRecord);
    setShowConfirmSubmit(false);

    // Dispatch completed score record to parent storage coordinator
    if (typeof onSaveAttempt === "function") {
      onSaveAttempt(attemptRecord);
    }
  };

  const handleRetakeQuiz = () => {
    setSubmittedResult(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setShowConfirmSubmit(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl">
              <Award className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
                  Interactive Evaluation
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Clock className="h-3 w-3" />
                  {activeQuiz.timeLimit || "15 mins"}
                </span>
              </div>
              <h3 className="font-extrabold text-base leading-tight text-white">
                {activeQuiz.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800"
            title="Close Quiz Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div
          className={`px-6 py-2 border-b flex items-center justify-between text-xs font-semibold ${
            isOnlineSimulated
              ? "bg-emerald-50/70 border-emerald-100 text-emerald-800"
              : "bg-amber-50/70 border-amber-100 text-amber-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {isOnlineSimulated ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-amber-600" />
            )}
            <span>
              {isOnlineSimulated
                ? "Connected — Scores will record directly to class server"
                : "Offline Engine — Auto-grading on device, saved locally"}
            </span>
          </div>

          {!submittedResult && (
            <span className="text-[11px] font-bold text-slate-500">
              Answered: <strong>{answeredCount}</strong> /{" "}
              <strong>{totalQuestions}</strong>
            </span>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {}
          {!submittedResult ? (
            /* ACTIVE QUIZ WIZARD VIEW */
            <div className="space-y-6">
              {/* Question Progress Meter */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-indigo-600 font-extrabold">
                    {Math.round(
                      ((currentQuestionIndex + 1) / totalQuestions) * 100,
                    )}
                    % Completed
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Active Question Prompt */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Multiple Choice Question
                </span>
                <p className="text-sm font-bold text-slate-900 leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options Selection Cards */}
              <div className="space-y-3">
                {currentQuestion.options.map((optionText, optIdx) => {
                  const isSelected = userAnswers[currentQuestion.id] === optIdx;

                  return (
                    <div
                      key={optIdx}
                      onClick={() =>
                        handleSelectOption(currentQuestion.id, optIdx)
                      }
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-600 shadow-sm text-indigo-950 font-bold"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-extrabold transition ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="text-xs leading-snug">
                          {optionText}
                        </span>
                      </div>

                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center transition ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Confirmation Popup Warning if submitting incomplete */}
              {showConfirmSubmit && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 animate-fadeIn">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-2 text-xs text-amber-900">
                    <p className="font-bold">
                      You have unanswered questions (
                      {totalQuestions - answeredCount} remaining)!
                    </p>
                    <p className="text-amber-700">
                      Are you sure you want to grade and submit your attempt
                      now?
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleGradeQuiz}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                      >
                        Yes, Grade Anyway
                      </button>
                      <button
                        onClick={() => setShowConfirmSubmit(false)}
                        className="bg-white border border-amber-300 text-amber-800 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-amber-100 transition"
                      >
                        Back to Questions
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* GRADED RESULTS OVERVIEW */
            <div className="space-y-6 animate-fadeIn">
              {/* Score Header Card */}
              <div className="text-center bg-slate-900 text-white p-6 rounded-3xl space-y-3 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Award className="h-32 w-32" />
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    submittedResult.score >= 70
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {submittedResult.score >= 70
                    ? "Passed Evaluation"
                    : "Practice Recommended"}
                </div>

                <div className="text-5xl font-black tracking-tight text-white">
                  {submittedResult.score}%
                </div>

                <p className="text-xs text-slate-300 font-medium">
                  Correct Answers:{" "}
                  <strong className="text-white">
                    {submittedResult.correctCount}
                  </strong>{" "}
                  out of{" "}
                  <strong className="text-white">
                    {submittedResult.totalQuestions}
                  </strong>
                </p>

                {/* Local Sync Status Indicator */}
                <div className="pt-2 flex justify-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold ${
                      submittedResult.status === "pending_sync"
                        ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                    }`}
                  >
                    {submittedResult.status === "pending_sync" ? (
                      <>
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span>Score saved locally — Pending upload</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Score synced with school server</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Per-Question Breakdown */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Detailed Answer Review:
                </h4>

                {submittedResult.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border space-y-2 text-xs ${
                      item.isCorrect
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-rose-50/50 border-rose-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900 leading-snug">
                        {idx + 1}. {item.questionText}
                      </p>
                      {item.isCorrect ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />{" "}
                          Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 shrink-0">
                          <XCircle className="h-4 w-4 text-rose-600" />{" "}
                          Incorrect
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 pt-1 text-[11px]">
                      <p className="text-slate-600">
                        Your selection:{" "}
                        <strong
                          className={
                            item.isCorrect
                              ? "text-emerald-800"
                              : "text-rose-800"
                          }
                        >
                          {item.selectedOption !== undefined
                            ? item.options[item.selectedOption]
                            : "No answer selected"}
                        </strong>
                      </p>
                      {!item.isCorrect && (
                        <p className="text-emerald-800 font-semibold">
                          Correct key:{" "}
                          <strong>{item.options[item.correctAnswer]}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          {!submittedResult ? (
            /* Navigation Controls during Quiz */
            <>
              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="flex gap-2">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(totalQuestions - 1, prev + 1),
                      )
                    }
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!isAllAnswered) {
                        setShowConfirmSubmit(true);
                      } else {
                        handleGradeQuiz();
                      }
                    }}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition shadow-md"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submit & Grade</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Post-Grading Controls */
            <>
              <button
                onClick={handleRetakeQuiz}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 transition shadow-sm"
              >
                <RotateCw className="h-3.5 w-3.5 text-indigo-600" />
                <span>Retake Quiz</span>
              </button>

              <button
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition shadow-md"
              >
                Done Practice
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
