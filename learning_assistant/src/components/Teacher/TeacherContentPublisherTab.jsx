import { useState, useEffect, useRef } from "react";

/*
CheckCircle2,
Sparkles,
*/
import {
  FileText,
  Plus,
  UploadCloud,
  Clock,
  HardDrive,
  BookOpen,
  FileCheck,
  Eye,
  Calendar,
  AlertCircle,
} from "lucide-react";

/**
 * TeacherContentPublisherTab Component
 *
 * Provides an interface for instructors to publish PDF reading guides,
 * reference materials, and practice worksheets for a selected course.
 *
 * @param {Object} activeCourse - Active course object containing materials & worksheets
 * @param {Function} onAddMaterial - Callback to attach a new material to the course
 */
export default function TeacherContentPublisherTab({
  activeCourse,
  onAddMaterial,
}) {
  const [materialTitle, setMaterialTitle] = useState("");
  const [readTime, setReadTime] = useState("15 min");
  const [fileSize, setFileSize] = useState("2.5 MB");
  const [guideContent, setGuideContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(null);

  const publishTimerRef = useRef(null);

  // Cancel any in-flight "publish" simulation if this tab unmounts
  // (e.g. teacher navigates away before the 400ms delay finishes)
  useEffect(() => {
    return () => {
      if (publishTimerRef.current) clearTimeout(publishTimerRef.current);
    };
  }, []);

  const handlePublishSubmit = (e) => {
    e.preventDefault();
    if (!activeCourse || isPublishing) return;
    if (!materialTitle.trim() || !guideContent.trim()) return;

    setIsPublishing(true);

    const trimmedTitle = materialTitle.trim();
    const newMaterial = {
      id: `mat_${activeCourse.id}_${Date.now()}`,
      title: trimmedTitle.toLowerCase().endsWith(".pdf")
        ? trimmedTitle
        : `${trimmedTitle}.pdf`,
      size: fileSize,
      type: "pdf",
      readTime,
      content: guideContent.trim(),
    };

    publishTimerRef.current = setTimeout(() => {
      onAddMaterial(newMaterial);
      setMaterialTitle("");
      setGuideContent("");
      setIsPublishing(false);
      publishTimerRef.current = null;
    }, 400);
  };

  /*const handlePublishSubmit = (e) => {
    e.preventDefault();
    if (!materialTitle.trim() || !guideContent.trim()) return;

    setIsPublishing(true);

    const newMaterial = {
      id: `mat_${activeCourse.id}_${Date.now()}`,
      title: materialTitle.trim().endsWith(".pdf")
        ? materialTitle.trim()
        : `${materialTitle.trim()}.pdf`,
      size: fileSize,
      type: "pdf",
      readTime: readTime,
      content: guideContent.trim(),
    };

    setTimeout(() => {
      onAddMaterial(newMaterial);
      setMaterialTitle("");
      setGuideContent("");
      setIsPublishing(false);
    }, 400);
  };*/

  const materialsList = activeCourse?.materials || [];
  const worksheetsList = activeCourse?.worksheets || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: CONTENT PUBLISHER FORM */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Publish Course Guide or PDF Material
              </h3>
              <p className="text-xs text-slate-500">
                Uploaded guides are compressed into study packages for zero-data
                student caching.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200">
            Offline Ready Engine
          </span>
        </div>

        {}
        <form onSubmit={handlePublishSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Document Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
                Material Title / Document Name:
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 4: CSS Grid Responsive Patterns.pdf"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
                required
              />
            </div>

            {/* Estimated Reading Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                Est. Read Time:
              </label>
              <select
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
              >
                <option value="10 min">10 Minutes</option>
                <option value="15 min">15 Minutes</option>
                <option value="20 min">20 Minutes</option>
                <option value="30 min">30 Minutes</option>
                <option value="45 min">45 Minutes</option>
              </select>
            </div>
          </div>

          {/* Guide Content Text Editor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                Guide Summary & Core Reading Text:
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Formatted as offline-accessible text
              </span>
            </label>
            <textarea
              rows={5}
              placeholder="Paste or write the main study guide text, key takeaways, code examples, or concept definitions here..."
              value={guideContent}
              onChange={(e) => setGuideContent(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            />
          </div>

          {}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <HardDrive className="h-3.5 w-3.5 text-indigo-500" />
              <span>
                Simulated Size: <strong>{fileSize}</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isPublishing ? (
                <span>Publishing to Course Pack...</span>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Attach & Publish Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 text-base">
              Published Course Materials ({materialsList.length})
            </h3>
            <p className="text-xs text-slate-500">
              Guides currently cached and accessible in student dashboards.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            {materialsList.length} Items Attached
          </span>
        </div>

        {materialsList.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
            <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              No study materials published yet.
            </p>
            <p className="text-[11px] text-slate-400">
              Fill out the form above to add your first reading guide.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {materialsList.map((mat) => (
              <div
                key={mat.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition">
                      {mat.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span>Size: {mat.size}</span>
                    <span>&bull;</span>
                    <span>Est. Read Time: {mat.readTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPreviewModal(mat)}
                  className="self-start sm:self-auto bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview Guide</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 text-base">
              Practice Worksheets ({worksheetsList.length})
            </h3>
            <p className="text-xs text-slate-500">
              Active assignments and exercises assigned to enrolled students.
            </p>
          </div>
        </div>

        {worksheetsList.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No active worksheets configured for this course module.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {worksheetsList.map((ws) => (
              <div
                key={ws.id}
                className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-xs">
                    {ws.title}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      ws.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {ws.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Calendar className="h-3 w-3 text-indigo-500" />
                  <span>Due Date: {ws.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-indigo-600" />
                <h4 className="font-bold text-sm text-slate-900 truncate">
                  {showPreviewModal.title}
                </h4>
              </div>
              <button
                onClick={() => setShowPreviewModal(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-60 overflow-y-auto">
              <p className="font-medium">{showPreviewModal.content}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowPreviewModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Done Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
