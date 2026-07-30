import { useState, useEffect, useRef } from "react";
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
  Paperclip,
  Download,
  X,
  Loader2,
} from "lucide-react";

/**
 
 *
 * @param {Object} activeCourse - Active course object containing materials & worksheets
 * @param {Function} onAddMaterial - Callback to attach a new material to the course
 */

const MATERIALS_CACHE_NAME = "user-uploaded-materials";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.txt";

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const cacheMaterialFile = async (materialId, file) => {
  if (!("caches" in window)) {
    throw new Error(
      "This browser doesn't support offline file caching (Cache Storage API unavailable).",
    );
  }
  const cache = await caches.open(MATERIALS_CACHE_NAME);
  const cacheKey = `/materials/${materialId}`;
  const response = new Response(file, {
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "X-File-Name": encodeURIComponent(file.name),
    },
  });
  await cache.put(cacheKey, response);
  return cacheKey;
};

const getMaterialFileURL = async (cacheKey) => {
  if (!cacheKey || !("caches" in window)) return null;
  const cache = await caches.open(MATERIALS_CACHE_NAME);
  const response = await cache.match(cacheKey);
  if (!response) return null;
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

function MaterialPreviewModal({ material, onClose }) {
  const [fileURL, setFileURL] = useState(null);
  const [status, setStatus] = useState("loading"); // 'loading' | 'ready' | 'missing' | 'error'

  useEffect(() => {
    let cancelled = false;
    let objectURL = null;

    const load = async () => {
      if (!material.fileCacheKey) {
        setStatus("missing");
        return;
      }
      try {
        const url = await getMaterialFileURL(material.fileCacheKey);
        if (cancelled) return;
        if (!url) {
          setStatus("missing");
          return;
        }
        objectURL = url;
        setFileURL(url);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    load();

    return () => {
      cancelled = true;
      if (objectURL) URL.revokeObjectURL(objectURL);
    };
  }, [material.fileCacheKey]);

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-slate-100 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileCheck className="h-4 w-4 text-indigo-600 shrink-0" />
            <h4 className="font-bold text-sm text-slate-900 truncate">
              {material.title}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 shrink-0"
          >
            ✕ Close
          </button>
        </div>

        {material.content && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed shrink-0">
            <p className="font-medium">{material.content}</p>
          </div>
        )}

        <div className="flex-grow overflow-hidden rounded-2xl border border-slate-200">
          {status === "loading" && (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs">Loading cached file...</span>
            </div>
          )}

          {status === "missing" && (
            <div className="p-8 text-center text-xs text-slate-400">
              No file attached to this material.
            </div>
          )}

          {status === "error" && (
            <div className="p-8 text-center text-xs text-rose-600">
              Couldn't load this file from the offline cache.
            </div>
          )}

          {status === "ready" &&
            material.fileMimeType === "application/pdf" && (
              <iframe
                src={fileURL}
                title={material.title}
                className="w-full h-full min-h-[320px]"
              />
            )}

          {status === "ready" &&
            material.fileMimeType !== "application/pdf" && (
              <div className="p-8 text-center space-y-3">
                <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  Inline preview isn't available for this file type.
                </p>
                <a>
                  href={fileURL}
                  download={material.fileName || material.title}
                  className="inline-flex items-center gap-1.5 bg-indigo-600
                  hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2
                  rounded-xl transition"
                  <Download className="h-3.5 w-3.5" />
                  <span>Download File</span>
                </a>
              </div>
            )}
        </div>

        <div className="flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            Done Preview
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherContentPublisherTab({
  activeCourse,
  onAddMaterial,
}) {
  const [materialTitle, setMaterialTitle] = useState("");
  const [readTime, setReadTime] = useState("15 min");
  const [guideContent, setGuideContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(null);
  const [fileData, setFileData] = useState(null);

  const publishTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (publishTimerRef.current) clearTimeout(publishTimerRef.current);
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFileError("");

    if (!file) {
      setSelectedFile(null);
      setFileData(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(
        `"${file.name}" is ${formatFileSize(file.size)} — over the ${formatFileSize(
          MAX_FILE_SIZE_BYTES,
        )} limit for offline device caching.`,
      );
      e.target.value = "";
      setSelectedFile(null);
      setFileData(null);
      return;
    }

    // 1. Read the physical file into a Base64 text string
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFileData(uploadEvent.target.result); // e.g. "data:application/pdf;base64,JVBERi0xLjQN..."
    };
    reader.readAsDataURL(file);

    // 2. Set file metadata
    setSelectedFile(file);
    if (!materialTitle.trim()) {
      setMaterialTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFileData(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!activeCourse || isPublishing) return;

    if (!selectedFile) {
      setFileError("Please choose a PDF, Word, or text file to publish.");
      return;
    }
    if (!materialTitle.trim()) return;

    setIsPublishing(true);
    setFileError("");

    const materialId = `mat_${activeCourse.id}_${Date.now()}`;

    try {
      const cacheKey = await cacheMaterialFile(materialId, selectedFile);

      const trimmedTitle = materialTitle.trim();
      const extension =
        selectedFile.name.slice(selectedFile.name.lastIndexOf(".")) || "";
      const titleAlreadyHasExtension = /\.[a-zA-Z0-9]+$/.test(trimmedTitle);

      const newMaterial = {
        id: materialId,
        title: titleAlreadyHasExtension
          ? trimmedTitle
          : `${trimmedTitle}${extension}`,
        size: formatFileSize(selectedFile.size),
        type: extension.replace(".", "").toLowerCase() || "file",
        readTime,
        content: guideContent.trim(),
        fileName: selectedFile.name,
        fileMimeType: selectedFile.type,

        fileCacheKey: cacheKey,
        fileData: fileData,
      };

      publishTimerRef.current = setTimeout(() => {
        onAddMaterial(newMaterial);
        setMaterialTitle("");
        setGuideContent("");
        clearSelectedFile();
        setIsPublishing(false);
        publishTimerRef.current = null;
      }, 400);
    } catch (err) {
      setFileError(
        err?.message ||
          "Couldn't cache that file for offline access — please try again.",
      );
      setIsPublishing(false);
    }
  };

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
                Uploaded files are cached on-device via the service worker for
                zero-data student access.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200">
            Offline Ready Engine
          </span>
        </div>

        <form onSubmit={handlePublishSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
              Upload Document (PDF, Word, or Text):
            </label>

            {!selectedFile ? (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl py-6 cursor-pointer transition text-center">
                <UploadCloud className="h-6 w-6 text-indigo-500" />
                <span className="text-xs font-bold text-slate-700">
                  Click to choose a file
                </span>
                <span className="text-[10px] text-slate-400">
                  PDF, DOC, DOCX, or TXT — up to{" "}
                  {formatFileSize(MAX_FILE_SIZE_BYTES)}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition shrink-0"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {fileError && (
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
                Material Title / Display Name:
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 4: CSS Grid Responsive Patterns"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
                required
              />
            </div>

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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                Optional Summary / Key Takeaways:
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Shown to students before opening the file
              </span>
            </label>
            <textarea
              rows={4}
              placeholder="Optional: a short summary or key takeaways students will see alongside the file..."
              value={guideContent}
              onChange={(e) => setGuideContent(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <HardDrive className="h-3.5 w-3.5 text-indigo-500" />
              <span>
                {selectedFile
                  ? `File size: ${formatFileSize(selectedFile.size)}`
                  : "No file selected yet"}
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

      {/* PUBLISHED MATERIALS LIST */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 text-base">
              Published Course Materials ({materialsList.length})
            </h3>
            <p className="text-xs text-slate-500">
              Files currently cached and accessible in student dashboards.
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
              Upload your first file above to get started.
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

      {/* WORKSHEETS */}
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

      {showPreviewModal && (
        <MaterialPreviewModal
          material={showPreviewModal}
          onClose={() => setShowPreviewModal(null)}
        />
      )}
    </div>
  );
}
