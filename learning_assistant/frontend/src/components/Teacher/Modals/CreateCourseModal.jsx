import { useState, useEffect, useRef } from "react";
import {
  X,
  BookOpen,
  Plus,
  FolderPlus,
  Sparkles,
  AlertCircle,
  Layers,
  FileText,
} from "lucide-react";

/**
 * @param {Function} onSubmit - Callback function (courseData) => void executed when form submits
 * @param {Function} onClose - Callback function () => void to close modal overlay
 */
export default function CreateCourseModal({ onSubmit, onClose }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Computer Science");
  const [description, setDescription] = useState("");
  const [customSubject, setSubjectCustom] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTimerRef = useRef(null);

  const SUBJECT_OPTIONS = [
    "Computer Science",
    "Physics",
    "Mathematics",
    "Biology",
    "Chemistry",
    "General Engineering",
    "Other",
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title.trim()) {
      setErrorMessage("Please enter a valid course title.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage(
        "Please provide a brief summary description for the course.",
      );
      return;
    }

    if (subject === "Other" && !customSubject.trim()) {
      setErrorMessage("Please specify a name for the custom department.");
      return;
    }

    const finalSubject = subject === "Other" ? customSubject.trim() : subject;

    setIsSubmitting(true);
    setErrorMessage("");

    const newCoursePayload = {
      title: title.trim(),
      subject: finalSubject,
      description: description.trim(),
      enrolledStudents: 0,
    };

    submitTimerRef.current = setTimeout(() => {
      if (typeof onSubmit === "function") {
        onSubmit(newCoursePayload);
      }
      setIsSubmitting(false);
      submitTimerRef.current = null;
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
                  Curriculum Publisher
                </span>
              </div>
              <h3 className="font-extrabold text-base leading-tight text-white">
                Create New Course Module
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
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-grow overflow-hidden"
        >
          <div className="p-6 overflow-y-auto space-y-5 flex-grow">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-rose-800 animate-fadeIn">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                Course Module Title:
              </label>
              <input
                type="text"
                placeholder="e.g. Mobile Application Architecture with React Native"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                Academic Department / Subject Category:
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              >
                {SUBJECT_OPTIONS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {subject === "Other" && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-bold text-slate-700">
                  Specify Custom Department:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Science & Machine Learning"
                  value={customSubject}
                  onChange={(e) => setSubjectCustom(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" />
                  Course Summary & Syllabus Scope:
                </span>
                <span className="text-[10px] font-normal text-slate-400">
                  Visible on student catalog cards
                </span>
              </label>
              <textarea
                rows={4}
                placeholder="Provide a concise description of learning objectives, core concepts covered, and prerequisites..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none transition"
                required
              />
            </div>

            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-2.5 text-[11px] text-indigo-900">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <p>
                Once created, you can attach PDF reading materials, construct
                self-grading quizzes, and dispatch SMS announcements inside the
                course workspace.
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Publishing Module...</span>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Publish Course Module</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
