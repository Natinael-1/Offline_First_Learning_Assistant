import { useState, useEffect, useRef } from "react";
import CourseMaterialsTab from "./CourseMaterialsTab.jsx";
import CourseAssignmentsTab from "./CourseAssignmentsTab.jsx";
import CourseQuizzesTab from "./CourseQuizzesTab.jsx";
import CourseNotices from "./CourseNoticesTab.jsx";
import CourseDiscussionTab from "./CourseDiscussionTab.jsx";
import DocumentReaderModal from "./Modals/DocumentReaderModal.jsx";
import FlashcardModal from "./Modals/FlashcardModal.jsx";
import QuizRunnerModal from "./Modals/QuizRunnerModal.jsx";
import {
  savePDFToCache,
  deletePDFFromCache,
  getMaterialCacheUrl,
} from "../../utils/cacheStorage";

import {
  BookOpen,
  Download,
  CheckCircle,
  Clock,
  MessageSquare,
  FileText,
  Sparkles,
  ArrowLeft,
  Search,
  Wifi,
  WifiOff,
  Award,
} from "lucide-react";
//API end points
import { coursesAPI, quizzesAPI } from "../../services/api";

// Removes heavy PDF before saving to localStorage
function sanitizeCoursesForStorage(coursesList) {
  if (!Array.isArray(coursesList)) return [];

  return coursesList.map((course) => ({
    ...course,
    materials: Array.isArray(course.materials)
      ? course.materials.map((mat) => {
          const cleanMaterial = { ...mat };
          delete cleanMaterial.file_data;
          delete cleanMaterial.fileData;
          return cleanMaterial;
        })
      : [],
  }));
}

// Seed Initial Mock Courses Data (Matches the database Schema)
const INITIAL_COURSES = [
  {
    id: 101,
    title: "Frontend Web Development",
    subject: "Computer Science",
    teacher: "Instructor Amina",
    description:
      "Master modern responsive design, HTML5, CSS Grid, Flexbox, and JavaScript fundamentals.",
    streakDays: 4,
    materials: [
      {
        id: "mat_101_1",
        title: "HTML5 Semantic Architecture & Standards.pdf",
        size: "2.8 MB",
        type: "pdf",
        readTime: "15 min",
        content:
          "Semantic HTML introduces meaning to the web page rather than just presentation. For example, using <header>, <nav>, <main>, and <footer> tags helps search engines and screen readers parse content structure efficiently.",
      },
      {
        id: "mat_101_2",
        title: "CSS Flexbox & Responsive Layout Guide.pdf",
        size: "3.4 MB",
        type: "pdf",
        readTime: "25 min",
        content:
          "Flexbox (Flexible Box Layout) is designed for one-dimensional layouts. Key properties include display: flex, justify-content (alignment along main axis), and align-items (alignment along cross axis).",
      },
      {
        id: "mat_101_3",
        title: "PWA Service Worker Fundamentals.pdf",
        size: "4.1 MB",
        type: "pdf",
        readTime: "30 min",
        content:
          "Service Workers act as proxy servers between the web application, the browser, and the network. They enable offline capabilities, intercept network requests, and manage local Cache Storage.",
      },
    ],
    worksheets: [
      {
        id: "ws_101_1",
        title: "Responsive Navigation Bar Exercise",
        dueDate: "Tomorrow, 11:59 PM",
        status: "In Progress",
      },
      {
        id: "ws_101_2",
        title: "CSS Grid Photo Gallery Challenge",
        dueDate: "Jul 28, 2026",
        status: "Not Started",
      },
    ],
    quizzes: [
      {
        id: "quiz_101_1",
        title: "CSS Grid & Flexbox Self-Evaluation",
        timeLimit: "10 mins",
        questions: [
          {
            id: 1,
            question: "Which CSS property is used to create a flex container?",
            options: [
              "display: flex",
              "position: flex",
              "flex-direction: row",
              "align-content: flex",
            ],
            correctAnswer: 0,
          },
          {
            id: 2,
            question: "What is the primary function of a PWA Service Worker?",
            options: [
              "Connect directly to PostgreSQL",
              "Intercept network calls & handle offline caching",
              "Style HTML elements",
              "Compress images on the cloud",
            ],
            correctAnswer: 1,
          },
          {
            id: 3,
            question:
              "Which HTML5 tag is most appropriate for independent, self-contained content?",
            options: ["<div>", "<section>", "<article>", "<span>"],
            correctAnswer: 2,
          },
        ],
      },
    ],
    announcements: [
      {
        id: "ann_101_1",
        date: "Jul 22, 2026",
        title: "Live Q&A Session Postponed",
        content:
          "Our live review is moved to Friday at 3:00 PM CAT. Please make sure you have downloaded the PWA PDF guide in advance!",
      },
      {
        id: "ann_101_2",
        date: "Jul 18, 2026",
        title: "New Study Pack Released",
        content:
          "Chapter 3 study pack is now uploaded. Click 'Download Complete Course Pack' to cache it for offline reading.",
      },
    ],
    discussions: [
      {
        id: "disc_101_1",
        author: "Natinael Boda",
        role: "Student",
        date: "Jul 21, 2026",
        text: "When we use grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)), does it wrap automatically on smaller screens?",
        status: "synced",
        replies: [
          {
            author: "Instructor Amina",
            role: "Teacher",
            date: "Jul 21, 2026",
            text: "Yes Natinael! auto-fit will collapse empty tracks and stretch remaining items to fit the available space.",
          },
        ],
      },
    ],
    flashcards: [
      {
        front: "What does PWA stand for?",
        back: "Progressive Web Application",
      },
      {
        front: "Which hook executes side-effects in React?",
        back: "useEffect()",
      },
      {
        front: "Which CSS display mode handles 2D layouts?",
        back: "display: grid",
      },
    ],
  },
  {
    id: 102,
    title: "Introduction to PostgreSQL",
    subject: "Computer Science",
    teacher: "Instructor Amina",
    description:
      "Relational database modeling, SQL syntax, indexes, foreign key constraints, and performance tuning.",
    streakDays: 2,
    materials: [
      {
        id: "mat_102_1",
        title: "Relational Database Normalization 1NF to 3NF.pdf",
        size: "1.9 MB",
        type: "pdf",
        readTime: "20 min",
        content:
          "Database normalization reduces data redundancy and improves data integrity. First Normal Form (1NF) eliminates repeating groups, 2NF eliminates partial dependencies, and 3NF eliminates transitive dependencies.",
      },
    ],
    worksheets: [
      {
        id: "ws_102_1",
        title: "SQL JOIN Queries & Schema Diagram Exercise",
        dueDate: "Jul 30, 2026",
        status: "Not Started",
      },
    ],
    quizzes: [
      {
        id: "quiz_102_1",
        title: "SQL Select, Join & Indexing Quiz",
        timeLimit: "15 mins",
        questions: [
          {
            id: 1,
            question:
              "Which SQL clause is used to filter records based on aggregate functions?",
            options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
            correctAnswer: 1,
          },
          {
            id: 2,
            question:
              "What type of key uniquely identifies a row in another table?",
            options: [
              "Primary Key",
              "Foreign Key",
              "Candidate Key",
              "Composite Key",
            ],
            correctAnswer: 1,
          },
        ],
      },
    ],
    announcements: [
      {
        id: "ann_102_1",
        date: "Jul 20, 2026",
        title: "PostgreSQL Database Schema Released",
        content:
          "Check the 7-table schema overview in your course materials before starting Worksheet 1.",
      },
    ],
    discussions: [],
    flashcards: [
      {
        front: "Primary Key constraint purpose?",
        back: "Uniquely identifies each row in a database table.",
      },
      {
        front: "What does ACID stand for in databases?",
        back: "Atomicity, Consistency, Isolation, Durability",
      },
    ],
  },
  {
    id: 103,
    title: "General Physics: Mechanics & Energy",
    subject: "Physics",
    teacher: "Instructor Joshua",
    description:
      "Newtonian mechanics, kinetic and potential energy, impulse, momentum, and rotational motion.",
    streakDays: 0,
    materials: [
      {
        id: "mat_103_1",
        title: "Newton's Laws of Motion & Force Vectors.pdf",
        size: "5.2 MB",
        type: "pdf",
        readTime: "35 min",
        content:
          "Newton's First Law states an object remains at rest or in uniform motion unless acted upon by a net force. Second Law: F = ma. Third Law: Action and reaction forces are equal and opposite.",
      },
    ],
    worksheets: [],
    quizzes: [],
    announcements: [
      {
        id: "ann_103_1",
        date: "Jul 15, 2026",
        title: "Midterm Physics Formula Sheet Available",
        content:
          "Make sure to download the formula PDF before entering offline study zones.",
      },
    ],
    discussions: [],
    flashcards: [
      { front: "Formula for Kinetic Energy?", back: "KE = 1/2 * m * v^2" },
      {
        front: "Unit of Force in SI system?",
        back: "Newton (N) = kg * m / s^2",
      },
    ],
  },
];

export default function StudentPortal({
  onLogout,
  currentUser,
  isOnlineSimulated = true,
}) {
  // Global State
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeTab, setActiveTab] = useState("materials"); // 'materials' | 'assignments' | 'quizzes' | 'notices' | 'discussion'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");

  // Offline Persistence States (LocalStorage)
  const [cachedCourseIds, setCachedCourseIds] = useState(() => {
    const saved = localStorage.getItem("student_cached_courses");
    return saved ? JSON.parse(saved) : [101]; // Seed Course 101 as cached
  });

  const [personalNotes, setPersonalNotes] = useState(() => {
    const saved = localStorage.getItem("student_personal_notes");
    return saved ? JSON.parse(saved) : {};
  });

  const [quizAttempts, setQuizAttempts] = useState(() => {
    const saved = localStorage.getItem("student_quiz_attempts");
    return saved ? JSON.parse(saved) : [];
  });

  const [discussionsState, setDiscussionsState] = useState(() => {
    const saved = localStorage.getItem("student_discussions");
    return saved ? JSON.parse(saved) : {};
  });

  // Modal Interactive State Engine
  const [activeMaterial, setActiveMaterial] = useState(null); // Document Reader Modal
  const [activeQuiz, setActiveQuiz] = useState(null); // Quiz Runner Modal
  const [activeFlashcards, setActiveFlashcards] = useState(null); // Flashcard Modal
  const [newCommentText, setNewCommentText] = useState("");
  const prevOnlineRef = useRef(isOnlineSimulated);

  //To make the download and cache button functional
  const [downloadingCourseId, setDownloadingCourseId] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      "student_cached_course_ids", // 👈 Updated key name to prevent collision
      JSON.stringify(cachedCourseIds),
    );
  }, [cachedCourseIds]);

  useEffect(() => {
    localStorage.setItem(
      "student_personal_notes",
      JSON.stringify(personalNotes),
    );
  }, [personalNotes]);

  // Handler: Save Personal Notes
  const handleNoteChange = (noteKey, text) => {
    setPersonalNotes((prev) => ({
      ...prev,
      [noteKey]: text,
    }));
  };

  // Handler: Quiz Start & Submission
  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    //setQuizUserAnswers({});
    //setQuizSubmittedResult(null);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeCourse) return;

    const now = Date.now();
    const currentDate = new Date(now).toLocaleDateString();

    // 1. The "Rich" Object (Used for your UI State)
    // This maintains the structure your CourseDiscussionTab expects.
    const newComment = {
      id: `disc_${now}`,
      author: currentUser?.username || "Student",
      role: "Student",
      date: currentDate,
      text: newCommentText.trim(),
      status: isOnlineSimulated ? "synced" : "pending_sync",
      replies: [],
    };

    // 2. Update UI Optimistically
    const courseDiscussions =
      discussionsState[activeCourse.id] || activeCourse.discussions || [];
    setDiscussionsState((prev) => ({
      ...prev,
      [activeCourse.id]: [newComment, ...courseDiscussions],
    }));

    // 3. The "Slim" Payload (Used for the API)
    // Send ONLY what the backend needs (text).
    const apiPayload = {
      text: newCommentText.trim(),
    };

    // 4. API Sync Logic
    if (isOnlineSimulated) {
      try {
        await coursesAPI.postDiscussion(
          activeCourse.id,
          currentUser.id,
          apiPayload,
        );
      } catch (err) {
        console.error("Discussion sync failed:", err);
        // Optional: you could add logic to move this to 'pending_sync' state if it fails
      }
    }

    setNewCommentText("");
  };

  // Filter Courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === "All" || c.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await coursesAPI.getAllCourses();
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data); // Full data (with file_data) stays in React memory!

          // Save ONLY the lightweight sanitized data to localStorage (~20 KB)
          const sanitizedData = sanitizeCoursesForStorage(data);
          localStorage.setItem(
            "student_cached_courses",
            JSON.stringify(sanitizedData),
          );
        }
      } catch (err) {
        console.error(`Error Occurred: ${err}`);
        console.warn(
          "FastAPI unreachable, loading cached data from LocalStorage.",
        );
        const savedCache = localStorage.getItem("student_cached_courses");
        if (savedCache) {
          try {
            setCourses(JSON.parse(savedCache));
          } catch (e) {
            console.error("Failed to parse cached courses:", e);
          }
        }
      }
    }
    loadCourses();
  }, []);

  // 2. Sync Engine: Flush attempts and discussions to server when reconnecting
  useEffect(() => {
    const justReconnected = isOnlineSimulated && !prevOnlineRef.current;
    prevOnlineRef.current = isOnlineSimulated;

    if (justReconnected) {
      async function syncPending() {
        const pendingQuiz = quizAttempts.filter(
          (a) => a.status === "pending_sync",
        );
        if (pendingQuiz.length > 0) {
          try {
            await quizzesAPI.syncOfflineAttempts(currentUser.id, pendingQuiz);
            setQuizAttempts((prev) =>
              prev.map((a) => ({ ...a, status: "synced" })),
            );
          } catch (err) {
            console.error("Sync failed:", err);
          }
        }
      }
      syncPending();
    }
  }, [isOnlineSimulated, quizAttempts, currentUser.id]);

  // Sync Logic
  useEffect(() => {
    localStorage.setItem("student_quiz_attempts", JSON.stringify(quizAttempts));
  }, [quizAttempts]);
  useEffect(() => {
    localStorage.setItem(
      "student_discussions",
      JSON.stringify(discussionsState),
    );
  }, [discussionsState]);

  // Derived
  const activeCourse = courses.find((c) => c.id === activeCourseId);
  const subjects = [
    "All",
    ...new Set(courses.map((c) => c.subject || "General")),
  ];
  const pendingSyncCount = quizAttempts.filter(
    (a) => a.status === "pending_sync",
  ).length;

  //Package downloader and cacher function
  const handleToggleDownloadPack = async (courseId, e) => {
    e?.stopPropagation();

    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const isCurrentlyCached = cachedCourseIds.includes(courseId);

    // --- CASE 1: REMOVE FROM CACHE ---
    if (isCurrentlyCached) {
      setDownloadingCourseId(courseId);
      try {
        if (Array.isArray(course.materials)) {
          for (const mat of course.materials) {
            if (mat.id) {
              await deletePDFFromCache(mat.id);
            }
          }
        }
        setCachedCourseIds((prev) => prev.filter((id) => id !== courseId));
      } catch (err) {
        console.error("Failed to remove course pack from Cache Storage:", err);
      } finally {
        setDownloadingCourseId(null);
      }
      return;
    }

    // --- CASE 2: DOWNLOAD TO CACHE ---
    if (!course.materials || course.materials.length === 0) {
      alert("This course has no PDF materials to cache.");
      return;
    }

    setDownloadingCourseId(courseId);

    try {
      let successCount = 0;
      const totalMaterials = course.materials.length;

      for (const mat of course.materials) {
        let rawPayload = mat.file_data || mat.fileData;

        // Fetch fresh material payload from FastAPI if missing from state
        if (!rawPayload && navigator.onLine) {
          try {
            const res = await fetch(
              `http://localhost:8000/api/courses/${courseId}`,
            );
            if (res.ok) {
              const fullCourse = await res.json();
              const fullMat = fullCourse.materials?.find(
                (m) => m.id === mat.id,
              );
              rawPayload = fullMat?.file_data || fullMat?.fileData;
            }
          } catch (fetchErr) {
            console.warn(
              `Could not fetch online material #${mat.id}:`,
              fetchErr,
            );
          }
        }

        if (mat.id && rawPayload) {
          const saved = await savePDFToCache(mat.id, rawPayload);
          if (saved) successCount++;
        }
      }

      // ONLY set as cached if ALL materials in the course succeeded!
      if (successCount === totalMaterials && totalMaterials > 0) {
        setCachedCourseIds((prev) => Array.from(new Set([...prev, courseId])));
      } else {
        alert(
          `Saved ${successCount} of ${totalMaterials} materials. Some materials could not be fetched.`,
        );
      }
    } catch (err) {
      console.error("Failed to cache course pack:", err);
    } finally {
      setDownloadingCourseId(null);
    }
  };
  // Auto-detect which courses are saved in Cache Storage on page load / courses update
  useEffect(() => {
    async function syncCachedCourses() {
      if (!("caches" in window) || !courses || courses.length === 0) return;

      try {
        const cache = await caches.open("user-uploaded-materials");
        const requests = await cache.keys();
        const cachedUrls = requests.map((req) => req.url);

        // Find all course IDs where EVERY material exists in Cache Storage
        const verifiedCachedCourseIds = courses
          .filter((course) => {
            if (!course.materials || course.materials.length === 0)
              return false;
            return course.materials.every((mat) => {
              const expectedKey = getMaterialCacheUrl(mat.id);
              return cachedUrls.some((url) => url.includes(expectedKey));
            });
          })
          .map((course) => course.id);

        setCachedCourseIds(verifiedCachedCourseIds);
      } catch (err) {
        console.error("Failed to sync cached course states:", err);
      }
    }

    syncCachedCourses();
  }, [courses]);

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800 min-h-screen">
      {/* HEADER BAR: Student Identity & Status Indicator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">
              Student Workspace
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2">
            Welcome back, {currentUser?.username || "Student"}!
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a course master card to access offline study materials,
            practice quizzes, and teacher Q&A.
          </p>
        </div>

        {/* Dynamic Status Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
          >
            Logout
          </button>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition ${
              isOnlineSimulated
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {isOnlineSimulated ? (
              <Wifi className="h-4 w-4 text-emerald-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-600" />
            )}
            <div className="flex flex-col">
              <span>
                {isOnlineSimulated
                  ? "You are connected"
                  : "You are not connected to server"}
              </span>
              {pendingSyncCount > 0 && (
                <span className="text-[10px] font-medium text-amber-700">
                  ⏳ {pendingSyncCount} item(s) pending sync in outbox
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW LEVEL 1: MASTER COURSE CARDS GRID */}
      {!activeCourse ? (
        <div className="space-y-6 mx-10 md:mx-40">
          {/* Controls: Search & Subject Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses or teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              />
            </div>

            {/* Subject Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {subjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedSubject === subj
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Master Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isCached = cachedCourseIds.includes(course.id);
              const materialsCount = course.materials.length;
              const quizCount = course.quizzes.length;

              return (
                <div
                  key={course.id}
                  onClick={() => {
                    setActiveCourseId(course.id);
                    setActiveTab("materials");
                  }}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {course.subject}
                      </span>

                      <button
                        disabled={downloadingCourseId === course.id}
                        onClick={(e) => handleToggleDownloadPack(course.id, e)}
                        title={
                          isCached
                            ? "Course Pack Downloaded (Click to remove)"
                            : "Download Complete Course Pack for Offline Use"
                        }
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg border transition ${
                          isCached
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        {downloadingCourseId === course.id ? (
                          <>
                            {/* Animated Loading Spinner */}
                            <svg
                              className="animate-spin h-3.5 w-3.5 text-current"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                            <span>Processing...</span>
                          </>
                        ) : isCached ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Clear Cache</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" />
                            <span>Cache Pack</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Course Title & Teacher */}
                    <div>
                      <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Instructor:{" "}
                        {/*<strong className="text-slate-700">
                          {course.teacher}
                        </strong>*/}
                        <strong className="text-slate-700">
                          {/* Add a check: if it's an object, get the username, otherwise just show the value */}
                          {typeof course.teacher === "object"
                            ? course.teacher?.username
                            : course.teacher}
                        </strong>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Card Footer Meta Info */}
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
                      Open Course &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW LEVEL 2: DETAILED COURSE WORKSPACE (5 TABS) */
        <div className="space-y-6 mx-10 md:mx-40">
          {/* Workspace Back Bar */}
          <div className="flex  items-center justify-between">
            <button
              onClick={() => setActiveCourseId(null)}
              className="flex mr-2 items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to All Courses</span>
            </button>

            {/* Offline Flashcard Action */}
            {activeCourse.flashcards && activeCourse.flashcards.length > 0 && (
              <button
                onClick={() => {
                  setActiveFlashcards(activeCourse.flashcards);
                }}
                className="flex ml-2 items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>
                  Practice Offline Flashcards ({activeCourse.flashcards.length})
                </span>
              </button>
            )}
          </div>

          {/* Active Course Master Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-3">
            <div className="flex justify-between items-start">
              <span className="bg-indigo-500/20 text-indigo-300 mr-2 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                {activeCourse.subject}
              </span>

              <button
                onClick={(e) => handleToggleDownloadPack(activeCourse.id, e)}
                className={`flex ml-2 items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl transition border ${
                  cachedCourseIds.includes(activeCourse.id)
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
                }`}
              >
                <Download className="h-3.5 w-3.5" />
                <span>
                  {cachedCourseIds.includes(activeCourse.id)
                    ? "Course Pack Cached Offline"
                    : "Download Complete Course Pack"}
                </span>
              </button>
            </div>

            <h2 className="text-2xl font-black">{activeCourse.title}</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {typeof activeCourse.description === "object"
                ? JSON.stringify(activeCourse.description)
                : activeCourse.description}
            </p>
            <p className="text-xs text-indigo-300 font-semibold pt-1">
              {/* If teacher is an object, access .username; otherwise, display it as-is */}
              Instructor:{" "}
              {activeCourse.teacher?.username || activeCourse.teacher}
            </p>
          </div>

          {/* 5 Organized Workspace Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("materials")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "materials"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>📖 Materials ({activeCourse.materials.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("assignments")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "assignments"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>📝 Assignments ({activeCourse.worksheets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("quizzes")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "quizzes"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>🧪 Quizzes ({activeCourse.quizzes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("notices")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "notices"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>📢 Notices ({activeCourse.announcements.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("discussion")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "discussion"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>💬 Q&A Discussion</span>
            </button>
          </div>

          {/* TAB 1: 📖 MATERIALS & PDF VIEWER */}
          {activeTab === "materials" && (
            <CourseMaterialsTab
              activeCourse={activeCourse}
              setActiveMaterial={setActiveMaterial}
            />
          )}

          {/* TAB 2: 📝 ASSIGNMENTS & WORKSHEETS */}
          {activeTab === "assignments" && (
            <CourseAssignmentsTab activeCourse={activeCourse} />
          )}
          {/* TAB 3: 🧪 QUIZZES & SELF-GRADING ENGINE */}
          {activeTab === "quizzes" && (
            <CourseQuizzesTab
              activeCourse={activeCourse}
              quizAttempts={quizAttempts}
              handleStartQuiz={handleStartQuiz}
            />
          )}
          {/* TAB 4: 📢 NOTICES */}
          {activeTab === "notices" && (
            <CourseNotices activeCourse={activeCourse} />
          )}

          {/* TAB 5: 💬 Q&A DISCUSSION BOARD */}
          {activeTab === "discussion" && (
            <CourseDiscussionTab
              handlePostComment={handlePostComment}
              newCommentText={newCommentText}
              setNewCommentText={setNewCommentText}
              discussionsState={discussionsState}
              activeCourse={activeCourse}
            />
          )}
        </div>
      )}

      {/* MODAL 1: IN-APP DOCUMENT / PDF READER */}
      {activeMaterial && (
        <DocumentReaderModal
          activeMaterial={activeMaterial}
          activeCourseId={activeCourse?.id}
          personalNotes={personalNotes}
          onNoteChange={handleNoteChange}
          onClose={() => setActiveMaterial(null)}
        />
      )}
      {/* MODAL 2: INTERACTIVE QUIZ ENGINE */}
      {activeQuiz && (
        <QuizRunnerModal
          activeCourse={activeCourse}
          currentUser={currentUser}
          activeQuiz={activeQuiz}
          activeCourseId={activeCourse?.id}
          isOnlineSimulated={isOnlineSimulated}
          onSaveAttempt={(attempt) => {
            setQuizAttempts((prev) => [attempt, ...prev]);
          }}
          onClose={() => setActiveQuiz(null)}
        />
      )}

      {/* MODAL 3: OFFLINE FLASHCARD DRILL */}
      {activeFlashcards && (
        <FlashcardModal
          flashcards={activeFlashcards}
          onClose={() => setActiveFlashcards(null)}
        />
      )}
    </div>
  );
}
