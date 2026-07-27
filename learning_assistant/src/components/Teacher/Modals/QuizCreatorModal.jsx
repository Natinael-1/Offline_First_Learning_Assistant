import { useState, useEffect, useRef } from "react";
import {
  X,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  HelpCircle,
  Sparkles,
  AlertCircle,
  FileQuestion,
} from "lucide-react";

/**
 * QuizCreatorModal Component
 *
 * Interactive builder overlay enabling teachers to design self-grading
 * assessments with dynamic question options, time limits, and correct answer keys.
 *
 * @param {string} courseTitle - Name of active course for context
 * @param {Function} onSaveQuiz - Callback (quizData) => void executed when published
 * @param {Function} onClose - Callback () => void to close modal overlay
 */
export default function QuizCreatorModal({
  courseTitle = "Active Course",
  onSaveQuiz,
  onClose,
}) {
  const [quizTitle, setQuizTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("15 mins");
  const [questions, setQuestions] = useState([
    {
      id: `q_${Date.now()}_1`,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTimerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Cancel any pending "save quiz" simulation on unmount — closing the
  // modal mid-submit used to still fire onSaveQuiz 300ms later regardless.
  useEffect(() => {
    return () => {
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    };
  }, []);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${prev.length + 1}`,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (qIndex) => {
    if (questions.length <= 1) {
      setErrorMessage("A quiz must contain at least one question.");
      return;
    }
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
    setErrorMessage("");
  };

  const handleQuestionTextChange = (qIndex, text) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, question: text } : q)),
    );
  };

  const handleOptionTextChange = (qIndex, optIndex, text) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const updatedOpts = [...q.options];
        updatedOpts[optIndex] = text;
        return { ...q, options: updatedOpts };
      }),
    );
  };

  const handleSelectCorrectOption = (qIndex, optIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex ? { ...q, correctAnswer: optIndex } : q,
      ),
    );
  };

  const handleAddOption = (qIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        if (q.options.length >= 6) {
          setErrorMessage("Maximum of 6 options allowed per question.");
          return q;
        }
        return { ...q, options: [...q.options, ""] };
      }),
    );
  };

  // Fixed: previously only re-clamped correctAnswer when it fell out of
  // bounds after an option was removed. It never accounted for the array
  // shifting down when an EARLIER option was deleted — so deleting option
  // A from [A,B,C,D] with C marked correct (index 2) silently left
  // correctAnswer=2 pointing at D in the new [B,C,D] array. The quiz would
  // then grade D as correct and the actual intended answer, C, as wrong,
  // with zero indication to the teacher. Also now explicitly handles
  // deleting the option that IS the correct answer, instead of letting a
  // different option silently inherit "correct" status.
  const handleRemoveOption = (qIndex, optIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;

        if (q.options.length <= 2) {
          setErrorMessage("Each question must have at least 2 choice options.");
          return q;
        }

        const updatedOpts = q.options.filter((_, oIdx) => oIdx !== optIndex);

        let newCorrect = q.correctAnswer;
        if (optIndex === q.correctAnswer) {
          newCorrect = 0;
          setErrorMessage(
            "You deleted the option marked correct — please select a new correct answer.",
          );
        } else if (optIndex < q.correctAnswer) {
          newCorrect = q.correctAnswer - 1;
        } else {
          setErrorMessage("");
        }

        return { ...q, options: updatedOpts, correctAnswer: newCorrect };
      }),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!quizTitle.trim()) {
      setErrorMessage("Please enter a descriptive title for this quiz.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setErrorMessage(`Question ${i + 1} prompt text cannot be empty.`);
        return;
      }

      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setErrorMessage(
            `Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is empty. Please fill in all choice texts.`,
          );
          return;
        }
      }

      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        setErrorMessage(
          `Question ${i + 1} has no valid correct answer selected.`,
        );
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const newQuizPayload = {
      id: `quiz_${Date.now()}`,
      title: quizTitle.trim(),
      timeLimit,
      questions: questions.map((q, idx) => ({
        id: idx + 1,
        question: q.question.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctAnswer: q.correctAnswer,
      })),
    };

    submitTimerRef.current = setTimeout(() => {
      if (typeof onSaveQuiz === "function") {
        onSaveQuiz(newQuizPayload);
      }
      setIsSubmitting(false);
      submitTimerRef.current = null;
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
                Interactive Assessment Builder &bull; {courseTitle}
              </span>
              <h3 className="font-extrabold text-base leading-tight text-white">
                Create Self-Grading Quiz
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800"
            title="Close builder (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/*
          Fixed: footer used to live outside this <form>, so the Publish
          button's onClick called handleSubmit directly, bypassing native
          form submission — meaning every `required` attribute on the
          fields below only did anything if someone submitted via Enter in
          a text input, never via the actual Publish button. Wrapping
          header-to-footer in one <form> and making Publish a real
          type="submit" makes native and manual validation agree instead
          of one silently doing nothing.
        */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-grow overflow-hidden"
        >
          <div className="p-6 overflow-y-auto space-y-6 flex-grow">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-rose-800 animate-fadeIn shrink-0">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileQuestion className="h-3.5 w-3.5 text-indigo-600" />
                  Quiz Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit 3: Relational Algebra & SQL JOINs"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-600" />
                  Time Allocation:
                </label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  <option value="5 mins">5 Minutes</option>
                  <option value="10 mins">10 Minutes</option>
                  <option value="15 mins">15 Minutes</option>
                  <option value="20 mins">20 Minutes</option>
                  <option value="30 mins">30 Minutes</option>
                  <option value="45 mins">45 Minutes</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-indigo-600" />
                  Questions ({questions.length})
                </h4>

                <span className="text-[10px] font-medium text-slate-400">
                  Click the letter radio badge to assign the auto-grading answer
                  key
                </span>
              </div>

              {questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4 relative group hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black text-indigo-900 bg-indigo-100 px-2.5 py-1 rounded-lg">
                      Question #{qIdx + 1}
                    </span>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition flex items-center gap-1 text-[11px] font-bold"
                        title="Remove question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      placeholder={`Type prompt for question #${qIdx + 1}...`}
                      value={q.question}
                      onChange={(e) =>
                        handleQuestionTextChange(qIdx, e.target.value)
                      }
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      required
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      Choice Options & Answer Key Selection:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((optText, optIdx) => {
                        const isCorrect = q.correctAnswer === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`p-1.5 pl-2.5 pr-2 rounded-xl border flex items-center gap-2 transition ${
                              isCorrect
                                ? "bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectCorrectOption(qIdx, optIdx)
                              }
                              className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 transition ${
                                isCorrect
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200"
                              }`}
                              title={
                                isCorrect
                                  ? "Selected as Correct Answer"
                                  : "Click to mark as correct answer"
                              }
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </button>

                            <input
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)} text...`}
                              value={optText}
                              onChange={(e) =>
                                handleOptionTextChange(
                                  qIdx,
                                  optIdx,
                                  e.target.value,
                                )
                              }
                              className="w-full text-xs text-slate-800 bg-transparent outline-none font-medium"
                              required
                            />

                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(qIdx, optIdx)}
                                className="text-slate-300 hover:text-rose-500 p-1 rounded-md transition"
                                title="Delete option"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 pt-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Option Field</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full py-3 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl text-indigo-700 text-xs font-bold transition flex items-center justify-center gap-2 group"
              >
                <Plus className="h-4 w-4 group-hover:scale-110 transition" />
                <span>Append New Question</span>
              </button>
            </div>

            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-2.5 text-[11px] text-indigo-900">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <p>
                Quizzes are serialized into compressed JSON formats for local
                device caching. Student attempts grade on device when offline
                and queue automatically for gradebook synchronization.
              </p>
            </div>
          </div>

          {/* MODAL FOOTER — now inside the form, Publish is a real submit button */}
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
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving Quiz...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Publish Quiz ({questions.length} Questions)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
