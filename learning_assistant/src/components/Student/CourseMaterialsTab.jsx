/*import { FileText, Eye } from "lucide-react";

export default function CourseMaterialsTab({
  activeCourse,
  setActiveMaterial,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-base text-slate-900">
        Course Materials & Textbook Guides
      </h3>
      <p className="text-xs text-slate-500">
        Click any guide to open the in-app document reader and take private
        study notes offline.
      </p>

      <div className="divide-y divide-slate-100 border-t border-slate-100">
        {activeCourse.materials.map((mat) => (
          <div
            key={mat.id}
            className="py-4 flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <h4 className="font-bold text-slate-800 text-sm">
                  {mat.title}
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Size: {mat.size} • Est. Read Time: {mat.readTime}
              </p>
            </div>

            <button
              onClick={() => setActiveMaterial(mat)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Open Guide</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}*/

import { FileText, Eye } from "lucide-react";

/**
 * CourseMaterialsTab Component
 *
 * Displays the list of reading guides, PDFs, and textbook materials
 * for the selected course, safely parsing both camelCase (React state)
 * and snake_case (FastAPI/PostgreSQL) attribute keys.
 */
export default function CourseMaterialsTab({
  activeCourse,
  setActiveMaterial,
}) {
  const materials = activeCourse?.materials || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-base text-slate-900">
        Course Materials & Textbook Guides
      </h3>
      <p className="text-xs text-slate-500">
        Click any guide to open the in-app document reader and take private
        study notes offline.
      </p>

      <div className="divide-y divide-slate-100 border-t border-slate-100">
        {materials.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">
            No educational materials or textbook guides uploaded for this course
            yet.
          </p>
        ) : (
          materials.map((mat) => {
            // Support both camelCase (React) and snake_case (FastAPI DB) keys
            const readTimeFormatted = mat.readTime || mat.read_time || "15 min";
            const fileSizeFormatted = mat.size || "0 MB";

            return (
              <div
                key={mat.id}
                className="py-4 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <h4 className="font-bold text-slate-800 text-sm">
                      {mat.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Size: {fileSizeFormatted} &bull; Est. Read Time:{" "}
                    {readTimeFormatted}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveMaterial(mat);
                    console.log(mat);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Open Guide</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
