export default function CourseAssignmentsTab({ activeCourse }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-base text-slate-900">
        Worksheets & Practice Problems
      </h3>

      {activeCourse.worksheets.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-4">
          No assignments published for this course yet.
        </p>
      ) : (
        <div className="space-y-3">
          {activeCourse.worksheets.map((ws) => (
            <div
              key={ws.id}
              className="p-4 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
            >
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{ws.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Due Date: {ws.dueDate}
                </p>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-lg ${
                  ws.status === "Completed"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {ws.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
