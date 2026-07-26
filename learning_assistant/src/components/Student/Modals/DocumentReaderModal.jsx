import { FileText, X, Edit3 } from "lucide-react";

export default function DocumentReaderModal({
  activeMaterial,
  activeCourseId,
  personalNotes,
  onNoteChange,
  onClose,
}) {
  if (!activeMaterial) return null;

  const noteKey = `${activeCourseId}_${activeMaterial.id}`;
  const currentNote = personalNotes[noteKey] || "";

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            <h3 className="font-bold text-sm truncate max-w-md">
              {activeMaterial.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
            title="Close Reader"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Document Content & Notes Input */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Document Content Box */}
          <div className="prose prose-slate text-xs leading-relaxed space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200 pb-2 mb-2">
              <span>
                Est. Reading Time: <strong>{activeMaterial.readTime}</strong>
              </span>
              <span>
                File Size: <strong>{activeMaterial.size}</strong>
              </span>
            </div>
            <p className="font-medium text-slate-700 leading-relaxed">
              {activeMaterial.content}
            </p>
          </div>

          {/* Personal Notes Section */}
          <div className="pt-2 space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5 text-indigo-600" />
              My Personal Study Notes(Saved Locally):
            </label>
            <textarea
              rows={4}
              placeholder="Type private study notes, formulas, or key takeaways for this guide..."
              value={currentNote}
              onChange={(e) => onNoteChange(noteKey, e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-slate-800"
            />
            <p className="text-[10px] text-slate-400 italic">
              * Notes auto-save immediately to (localStorage) as you type.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
}
