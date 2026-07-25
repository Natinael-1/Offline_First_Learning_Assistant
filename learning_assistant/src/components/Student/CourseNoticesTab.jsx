export default function CourseNotices({ activeCourse }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-base text-slate-900">
        Instructor Announcements
      </h3>

      <div className="space-y-3">
        {activeCourse.announcements.map((ann) => (
          <div
            key={ann.id}
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-indigo-700">{ann.title}</span>
              <span className="text-slate-400">{ann.date}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {ann.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
