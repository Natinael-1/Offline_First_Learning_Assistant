import { useState, useEffect } from "react";
//import { getPDFFromCache, savePDFToCache } from "../../../utils/cacheStorage";
import {
  FileText,
  X,
  Edit3,
  Download,
  ExternalLink,
  Eye,
  File,
  Maximize2,
  Loader2,
  AlertCircle,
} from "lucide-react";

const MATERIALS_CACHE_NAME = "user-uploaded-materials";

export default function DocumentReaderModal({
  activeMaterial,
  activeCourseId,
  personalNotes = {},
  onNoteChange,
  onClose,
}) {
  const [viewMode, setViewMode] = useState("split"); // 'split' | 'reader' | 'notes'
  const [blobUrl, setBlobUrl] = useState(null);
  const [loadStatus, setLoadStatus] = useState("idle"); // 'idle' | 'loading' | 'ready' | 'missing' | 'error'

  const summaryContent = activeMaterial?.content || "";
  /*const fileCacheKey =
    activeMaterial?.fileCacheKey || activeMaterial?.file_cache_key || null;*/
  const fileCacheKey =
    activeMaterial?.fileCacheKey ||
    activeMaterial?.file_cache_key ||
    (activeMaterial?.id ? `/materials/${activeMaterial.id}` : null);

  const fileMimeType =
    activeMaterial?.fileMimeType || activeMaterial?.file_mime_type || "";
  const legacyFilePayload =
    activeMaterial?.fileData ||
    activeMaterial?.file_data ||
    (typeof summaryContent === "string" && summaryContent.startsWith("data:")
      ? summaryContent
      : null);
  useEffect(() => {
    let cancelled = false;
    let createdUrl = null;

    (async () => {
      await Promise.resolve();
      if (cancelled) return;

      if (!activeMaterial) {
        setBlobUrl(null);
        setLoadStatus("idle");
        return;
      }

      // Path 1: Attempt to load from Cache Storage first
      if (fileCacheKey || activeMaterial?.id) {
        setLoadStatus("loading");
        setBlobUrl(null);

        try {
          if ("caches" in window) {
            const cache = await caches.open(MATERIALS_CACHE_NAME);
            if (cancelled) return;

            // Try primary cache key, then fallback key patterns
            let response = fileCacheKey
              ? await cache.match(fileCacheKey)
              : null;
            if (!response && activeMaterial?.id) {
              response = await cache.match(`/materials/${activeMaterial.id}`);
            }
            if (!response && activeMaterial?.id) {
              response = await cache.match(activeMaterial.id);
            }

            // IF FOUND IN CACHE: Render immediately from Cache Storage Blob
            if (response) {
              const blob = await response.blob();
              if (cancelled) return;

              const url = URL.createObjectURL(blob);
              if (cancelled) {
                URL.revokeObjectURL(url);
                return;
              }
              createdUrl = url;
              setBlobUrl(url);
              setLoadStatus("ready");
              return; // Successfully rendered from Cache Storage!
            }
          }
        } catch (err) {
          console.error("Failed to load material from Cache Storage:", err);
        }

        if (!legacyFilePayload) {
          if (!cancelled) setLoadStatus("missing");
          return;
        }
      }

      // Path 2: Fallback for legacy Base64 payload or fresh server responses
      if (!legacyFilePayload) {
        setBlobUrl(null);
        setLoadStatus("idle");
        return;
      }

      if (
        legacyFilePayload.startsWith("http://") ||
        legacyFilePayload.startsWith("https://") ||
        legacyFilePayload.startsWith("blob:")
      ) {
        setBlobUrl(legacyFilePayload);
        setLoadStatus("ready");
        return;
      }

      if (legacyFilePayload.startsWith("data:")) {
        setLoadStatus("loading");
        try {
          const parts = legacyFilePayload.split(",");
          const mimeMatch = parts[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });

          if (fileCacheKey && "caches" in window) {
            caches.open(MATERIALS_CACHE_NAME).then((cache) => {
              const cacheResponse = new Response(blob, {
                headers: {
                  "Content-Type": mime,
                  "Content-Length": blob.size.toString(),
                },
              });
              cache
                .put(fileCacheKey, cacheResponse)
                .catch((e) => console.error("Background caching failed:", e));
            });
          }

          const url = URL.createObjectURL(blob);
          if (cancelled) {
            URL.revokeObjectURL(url);
            return;
          }
          createdUrl = url;
          setBlobUrl(url);
          setLoadStatus("ready");
        } catch (err) {
          console.error(
            "Failed to construct Blob URL from legacy document payload:",
            err,
          );
          if (!cancelled) setLoadStatus("error");
        }
        return;
      }

      setBlobUrl(null);
      setLoadStatus("idle");
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [fileCacheKey, legacyFilePayload, activeMaterial]);

  if (!activeMaterial) return null;

  const noteKey = `${activeCourseId}_${activeMaterial.id}`;
  const currentNote = personalNotes[noteKey] || "";

  const readTime =
    activeMaterial.readTime || activeMaterial.read_time || "15 min";
  const size = activeMaterial.size || "0 MB";
  const title = activeMaterial.title || "Course Document";

  const isPdf =
    fileMimeType === "application/pdf" ||
    activeMaterial.file_type === "pdf" ||
    activeMaterial.type === "pdf" ||
    title.toLowerCase().endsWith(".pdf");

  const isLoading = loadStatus === "loading";
  const loadFailed = loadStatus === "missing" || loadStatus === "error";
  const hasFile = loadStatus === "ready" && !!blobUrl;

  const handleDownloadFile = () => {
    if (!blobUrl) {
      alert("No attached document binary found for this reading guide.");
      return;
    }

    const fileExt = activeMaterial.file_type || activeMaterial.type || "pdf";
    const fallbackName = title.toLowerCase().endsWith(`.${fileExt}`)
      ? title
      : `${title}.${fileExt}`;

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = activeMaterial.fileName || fallbackName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNativeTab = () => {
    if (blobUrl) {
      window.open(blobUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-6xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100">
        {/* HEADER BAR */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="truncate">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
                Educational Document Reader
              </span>
              <h3 className="font-bold text-sm text-white truncate">{title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasFile && (
              <>
                <button
                  onClick={handleOpenNativeTab}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
                  title="Open full document viewer in new browser tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Open in Tab</span>
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-md flex items-center gap-1.5"
                  title="Download local copy to device"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Save File</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800"
              title="Close Reader (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* METADATA & VIEW MODE TOGGLE */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs text-slate-600 font-semibold">
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              Est. Reading Time:{" "}
              <strong className="text-indigo-700">{readTime}</strong>
            </span>
            <span>&bull;</span>
            <span>
              File Size: <strong className="text-slate-900">{size}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-xl text-[11px]">
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1 rounded-lg font-bold transition ${viewMode === "split" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"}`}
            >
              Document & Notes
            </button>
            <button
              onClick={() => setViewMode("reader")}
              className={`px-3 py-1 rounded-lg font-bold transition ${viewMode === "reader" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"}`}
            >
              Full Document
            </button>
            <button
              onClick={() => setViewMode("notes")}
              className={`px-3 py-1 rounded-lg font-bold transition ${viewMode === "notes" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"}`}
            >
              Notes Only
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-6">
          <div
            className={`grid grid-cols-1 ${viewMode === "split" ? "lg:grid-cols-2" : "grid-cols-1"} gap-6 h-full`}
          >
            {/* COLUMN 1: DOCUMENT VIEWER */}
            {(viewMode === "split" || viewMode === "reader") && (
              <div className="space-y-3 flex flex-col h-full min-h-[480px]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Interactive Document Viewer:</span>
                  </label>

                  {hasFile && (
                    <button
                      onClick={handleOpenNativeTab}
                      className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <Maximize2 className="h-3 w-3" />
                      <span>Expand Native View</span>
                    </button>
                  )}
                </div>

                {isLoading && (
                  <div className="border border-slate-200 rounded-2xl bg-slate-50 flex-grow min-h-[480px] h-[580px] flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs">Loading document...</span>
                  </div>
                )}

                {loadFailed && (
                  <div className="border border-slate-200 rounded-2xl bg-slate-50 flex-grow min-h-[480px] h-[580px] flex flex-col items-center justify-center gap-2 text-rose-600 px-6 text-center">
                    <AlertCircle className="h-6 w-6" />
                    <span className="text-xs font-bold">
                      {loadStatus === "missing"
                        ? "This file isn't available in this device's offline cache."
                        : "Couldn't load this document."}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      It may need to be re-downloaded while online, or was
                      cleared from browser storage.
                    </span>
                  </div>
                )}

                {hasFile && isPdf && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 shadow-inner flex-grow min-h-[480px] h-[580px] relative">
                    <object
                      data={blobUrl}
                      type="application/pdf"
                      className="w-full h-full rounded-2xl"
                    >
                      <iframe
                        src={blobUrl}
                        title={title}
                        className="w-full h-full border-none"
                      >
                        <div className="p-8 text-center text-white space-y-3">
                          <p>
                            Your browser does not support embedded PDF rendering
                            directly inside an iframe.
                          </p>
                          <button
                            onClick={handleOpenNativeTab}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Open Document in Browser Tab</span>
                          </button>
                        </div>
                      </iframe>
                    </object>
                  </div>
                )}

                {hasFile && !isPdf && (
                  <div className="border border-slate-200 rounded-2xl bg-slate-50 flex-grow min-h-[480px] h-[580px] flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <File className="h-8 w-8 text-slate-300" />
                    <p className="text-xs text-slate-500">
                      Inline preview isn't available for this file type.
                    </p>
                    <button
                      onClick={handleDownloadFile}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download File</span>
                    </button>
                  </div>
                )}

                {!isLoading && !loadFailed && !hasFile && (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 flex-grow min-h-[300px]">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b pb-2">
                      <File className="h-4 w-4 text-indigo-500" />
                      <span>Text Guide Summary:</span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {summaryContent ||
                        "No guide summary or attached file payload found."}
                    </p>
                  </div>
                )}

                {hasFile && summaryContent && (
                  <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-0.5">
                    <h5 className="text-[10px] font-extrabold uppercase text-indigo-900 tracking-wider">
                      Instructor Context:
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {summaryContent}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* COLUMN 2: LOCAL NOTEBOOK */}
            {(viewMode === "split" || viewMode === "notes") && (
              <div className="space-y-3 flex flex-col h-full">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5 text-indigo-600" />
                    My Personal Study Notes:
                  </span>
                  <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Auto-saved 100% Locally
                  </span>
                </label>

                <textarea
                  rows={viewMode === "notes" ? 20 : 16}
                  placeholder="Type private study notes, formulas, or key takeaways for this guide..."
                  value={currentNote}
                  onChange={(e) =>
                    onNoteChange && onNoteChange(noteKey, e.target.value)
                  }
                  className="w-full p-4 border border-slate-200 rounded-2xl text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/80 text-slate-800 flex-grow font-medium shadow-inner"
                />

                <p className="text-[10px] text-slate-400 italic">
                  * Personal notes persist in browser memory (LocalStorage) and
                  remain available when offline.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Zero-Data Local Document Reader
          </span>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md ml-auto"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
}
