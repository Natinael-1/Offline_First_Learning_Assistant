import { useState } from "react";
import {
  Users,
  FileText,
  Award,
  Search,
  Plus,
  FolderPlus,
  Trash2,
} from "lucide-react";

/**
 * TeacherCoursesTab Component
 *
 * Renders the primary dashboard grid of modules published by the instructor.
 * Allows searching/filtering courses and provides actions to manage a specific course
 * or create new course modules.
 *
 * @param {Array} courses - Array of course objects
 * @param {Function} onSelectCourse - Callback triggered when selecting a course card (passes courseId)
 * @param {Function} onOpenCreateModal - Callback to trigger the course creation modal
 */

// Single source of truth for the fallback subject label, used for both
// the filter pills and the actual filtering — keeps them in sync.
const resolveSubject = (course) => course.subject || "General";

export default function TeacherCoursesTab({
  courses = [],
  onSelectCourse,
  onOpenCreateModal,
  onDeleteCourse,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");

  const subjects = ["All", ...new Set(courses.map(resolveSubject))];

  const filteredCourses = courses.filter((course) => {
    const title = course.title || "";
    const description = course.description || "";
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === "All" || resolveSubject(course) === selectedSubject;
    return matchesSearch && matchesSubject;
  });
  const handleDeleteClick = (e, courseId, title) => {
    e.stopPropagation(); // Prevent opening the course workspace when clicking delete
    if (
      window.confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      )
    ) {
      if (typeof onDeleteCourse === "function") {
        onDeleteCourse(courseId);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search and Subject Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search my teaching modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedSubject === subj
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4">
          <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <FolderPlus className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">
              No Teaching Modules Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || selectedSubject !== "All"
                ? "No courses matched your search criteria. Try clearing filters."
                : "Get started by publishing your first course module to student devices."}
            </p>
          </div>
          <button
            onClick={onOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition shadow-md inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Course Module</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const materialsCount = course.materials?.length || 0;
            const quizCount = course.quizzes?.length || 0;
            // Fixed: use nullish coalescing so a real value of 0 (e.g. a
            // freshly created course) displays as 0, not a hardcoded 28.
            const enrolledCount = course.enrolledStudents ?? 0;

            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course.id)}
                className="bg-white border border-slate-200 hover:border-indigo-400 rounded-3xl p-6 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider border border-indigo-100">
                      {resolveSubject(course)}
                    </span>

                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Users className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{enrolledCount} Students</span>
                    </span>
                    <button
                      onClick={(e) =>
                        handleDeleteClick(e, course.id, course.title)
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Delete Course Module"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition leading-snug">
                      {course.title || "Untitled Course"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Instructor:{" "}
                      <strong className="text-slate-700">
                        {course.teacher}
                      </strong>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-indigo-500" />
                      {materialsCount} Materials
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-emerald-500" />
                      {quizCount} Quizzes
                    </span>
                  </div>

                  <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                    Manage &rarr;
                  </span>
                </div>
              </div>
            );
          })}

          <div
            onClick={onOpenCreateModal}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-3xl p-6 transition cursor-pointer flex flex-col items-center justify-center text-center gap-3 min-h-[220px] group"
          >
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition">
                Create New Course
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add a new subject module to school catalog
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
