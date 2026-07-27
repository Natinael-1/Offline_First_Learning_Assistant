import { useState, useEffect, useRef, useCallback } from "react";

/*
 BookOpen,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  RefreshCw,
*/
import {
  Plus,
  FileText,
  Award,
  Radio,
  MessageSquare,
  BarChart3,
  Wifi,
  WifiOff,
  ArrowLeft,
  CheckCircle2,
  Users,
  LogOut,
} from "lucide-react";

import TeacherCoursesTab from "./TeacherCoursesTab";
import TeacherContentPublisherTab from "./TeacherContentPublisherTab";
import TeacherQuizBuilderTab from "./TeacherQuizBuilderTab";
import TeacherAnnouncementsTab from "./TeacherAnnouncementsTab";
import TeacherQAQueueTab from "./TeacherQAQueueTab";
import TeacherGradebookTab from "./TeacherGradebookTab";

import CreateCourseModal from "./Modals/CreateCourseModal";
import QuizCreatorModal from "./Modals/QuizCreatorModal";
import StudentScoreDetailsModal from "./Modals/StudentScoreDetailsModal";

const INITIAL_TEACHER_COURSES = [
  {
    id: 101,
    title: "Frontend Web Development",
    subject: "Computer Science",
    teacher: "Instructor Amina",
    description:
      "Master modern responsive design, HTML5, CSS Grid, Flexbox, and JavaScript fundamentals.",
    enrolledStudents: 28,
    materials: [
      {
        id: "mat_101_1",
        title: "HTML5 Semantic Architecture & Standards.pdf",
        size: "2.8 MB",
        type: "pdf",
        readTime: "15 min",
        content:
          "Semantic HTML introduces meaning to the web page rather than just presentation.",
      },
      {
        id: "mat_101_2",
        title: "CSS Flexbox & Responsive Layout Guide.pdf",
        size: "3.4 MB",
        type: "pdf",
        readTime: "25 min",
        content:
          "Flexbox (Flexible Box Layout) is designed for one-dimensional layouts.",
      },
    ],
    worksheets: [
      {
        id: "ws_101_1",
        title: "Responsive Navigation Bar Exercise",
        dueDate: "Tomorrow, 11:59 PM",
        status: "Active",
      },
      {
        id: "ws_101_2",
        title: "CSS Grid Photo Gallery Challenge",
        dueDate: "Jul 28, 2026",
        status: "Draft",
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
            question: "Which CSS property creates a flex container?",
            options: ["display: flex", "position: flex", "flex-direction: row"],
            correctAnswer: 0,
          },
          {
            id: 2,
            question: "What is a PWA Service Worker primary role?",
            options: [
              "Database connection",
              "Intercept calls & manage offline cache",
              "Style HTML",
            ],
            correctAnswer: 1,
          },
        ],
      },
    ],
    announcements: [
      {
        id: "ann_101_1",
        date: "Jul 22, 2026",
        title: "Live Q&A Session Postponed",
        content: "Our live review is moved to Friday at 3:00 PM CAT.",
        sentViaSMS: true,
      },
    ],
    discussions: [
      {
        id: "disc_101_1",
        author: "Natinael Boda",
        role: "Student",
        date: "Jul 21, 2026",
        text: "When we use grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)), does it wrap automatically?",
        status: "synced",
        replies: [
          {
            author: "Instructor Amina",
            role: "Teacher",
            date: "Jul 21, 2026",
            text: "Yes Natinael! auto-fit collapses empty tracks.",
          },
        ],
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
    enrolledStudents: 34,
    materials: [
      {
        id: "mat_102_1",
        title: "Relational Database Normalization 1NF to 3NF.pdf",
        size: "1.9 MB",
        type: "pdf",
        readTime: "20 min",
        content:
          "Database normalization reduces data redundancy and improves data integrity.",
      },
    ],
    worksheets: [],
    quizzes: [],
    announcements: [],
    discussions: [],
  },
];

export default function TeacherPortal({
  currentUser = {
    username: "Instructor Amina",
    email: "amina@teacher.edu",
    role: "teacher",
  },
  isOnlineSimulated = true,
  onLogout,
}) {
  // Navigation & Workspace State
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem("teacher_courses");
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_COURSES;
  });

  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeTab, setActiveTab] = useState("courses"); // 'courses' | 'publisher' | 'quizzes' | 'announcements' | 'qa' | 'gradebook'

  // Offline Pending Drafts Outbox (LocalStorage)
  const [teacherDrafts, setTeacherDrafts] = useState(() => {
    const saved = localStorage.getItem("teacher_pending_drafts");
    return saved ? JSON.parse(saved) : [];
  });

  // Cross-Portal Synced Submissions (Student Scores Ledger)
  // TODO: this reads "student_quiz_attempts" once at mount, with no persistence
  // back to storage and no listener for changes made in a StudentPortal tab.
  // The seeded demo record also carries studentName/studentEmail fields that
  // StudentPortal's real attempt records never set — so real submissions will
  // show up in the gradebook with no student identity attached. This needs a
  // shared data layer (or at least a `storage` event listener + a corrected
  // attempt shape on the student side), not a local patch here.
  const [quizAttempts, setQuizAttempts] = useState(() => {
    const saved = localStorage.getItem("student_quiz_attempts");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "attempt_demo_1",
            quizId: "quiz_101_1",
            quizTitle: "CSS Grid & Flexbox Self-Evaluation",
            courseId: 101,
            score: 85,
            totalQuestions: 3,
            correctCount: 2,
            studentName: "Natinael Boda",
            studentEmail: "natinael@student.edu",
            timestamp: "Jul 25, 2026",
            status: "synced",
          },
        ];
  });

  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isQuizCreatorOpen, setIsQuizCreatorOpen] = useState(false);
  const [selectedAttemptDetail, setSelectedAttemptDetail] = useState(null);

  // Status Notification Banner
  const [statusMessage, setStatusMessage] = useState(null);
  const notificationTimerRef = useRef(null);

  // Auto-Persistence Hooks
  useEffect(() => {
    localStorage.setItem("teacher_courses", JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(
      "teacher_pending_drafts",
      JSON.stringify(teacherDrafts),
    );
  }, [teacherDrafts]);

  // Stable across renders so effects that depend on it don't re-fire spuriously,
  // and so a new call always clears any still-pending timer from a prior call
  // (fixes the race where a fast second toast got wiped early by the first
  // toast's timeout).
  const triggerNotification = useCallback((text, type = "success") => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setStatusMessage({ text, type });
    notificationTimerRef.current = setTimeout(() => {
      setStatusMessage(null);
      notificationTimerRef.current = null;
    }, 4000);
  }, []);

  // Clear any pending timer on unmount
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current)
        clearTimeout(notificationTimerRef.current);
    };
  }, []);

  const activeCourse = courses.find((c) => c.id === activeCourseId);

  /*const prevOnlineRef = useRef(isOnlineSimulated);

  useEffect(() => {
    const justReconnected = isOnlineSimulated && !prevOnlineRef.current;
    prevOnlineRef.current = isOnlineSimulated;

    if (justReconnected) {
      setTeacherDrafts((currentDrafts) => {
        if (currentDrafts.length > 0) {
          triggerNotification(
            `Online Gateway Active: Synced ${currentDrafts.length} pending draft(s) to cloud database.`,
            "success",
          );
        }
        return [];
      });
    }
  }, [isOnlineSimulated, triggerNotification]);*/

  const prevOnlineRef = useRef(isOnlineSimulated);

  useEffect(() => {
    const justReconnected = isOnlineSimulated && !prevOnlineRef.current;
    prevOnlineRef.current = isOnlineSimulated;
    if (!justReconnected) return;
    setTeacherDrafts((currentDrafts) => {
      if (currentDrafts.length === 0) return currentDrafts;
      const announcementDrafts = currentDrafts.filter(
        (d) => d.type === "ADD_ANNOUNCEMENT",
      );

      if (announcementDrafts.length > 0) {
        setCourses((prevCourses) =>
          prevCourses.map((course) => {
            const draftsForCourse = announcementDrafts.filter(
              (d) => d.courseId === course.id,
            );
            if (draftsForCourse.length === 0) return course;

            const smsRequestedByNoticeId = new Map(
              draftsForCourse.map((d) => [
                d.payload.noticeId,
                d.payload.smsRequested,
              ]),
            );

            return {
              ...course,
              announcements: course.announcements.map((ann) =>
                smsRequestedByNoticeId.has(ann.id)
                  ? {
                      ...ann,
                      status: "synced",
                      sentViaSMS:
                        ann.sentViaSMS || !!smsRequestedByNoticeId.get(ann.id),
                    }
                  : ann,
              ),
            };
          }),
        );
      }

      triggerNotification(
        `Online Gateway Active: Synced ${currentDrafts.length} pending draft(s) to cloud database.`,
        "success",
      );

      return [];
    });
  }, [isOnlineSimulated, triggerNotification]);

  const handleCreateCourse = (newCourseData) => {
    const newCourse = {
      id: Date.now(),
      ...newCourseData,
      teacher: currentUser.username || "Instructor Amina",
      enrolledStudents: 0,
      materials: [],
      worksheets: [],
      quizzes: [],
      announcements: [],
      discussions: [],
    };

    setCourses((prev) => [newCourse, ...prev]);

    if (!isOnlineSimulated) {
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "CREATE_COURSE", payload: newCourse },
      ]);
      triggerNotification(
        "Course saved locally as draft (Offline Mode).",
        "amber",
      );
    } else {
      triggerNotification(
        `New course "${newCourse.title}" published to school catalog!`,
        "success",
      );
    }

    setIsCreateCourseOpen(false);
  };

  const handleAddMaterial = (courseId, material) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return { ...c, materials: [material, ...c.materials] };
        }
        return c;
      }),
    );

    if (!isOnlineSimulated) {
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "ADD_MATERIAL", courseId, payload: material },
      ]);
    }
    triggerNotification(
      `Material "${material.title}" attached to course.`,
      "success",
    );
  };

  const handleSaveQuiz = (courseId, newQuiz) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return { ...c, quizzes: [newQuiz, ...c.quizzes] };
        }
        return c;
      }),
    );

    if (!isOnlineSimulated) {
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "ADD_QUIZ", courseId, payload: newQuiz },
      ]);
    }
    triggerNotification(
      `Quiz "${newQuiz.title}" created successfully!`,
      "success",
    );
    setIsQuizCreatorOpen(false);
  };

  /*const handlePostAnnouncement = (courseId, notice, sendSMS) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return { ...c, announcements: [notice, ...c.announcements] };
        }
        return c;
      }),
    );

    if (sendSMS) {
      triggerNotification(
        `Notice posted & queued for SMS carrier broadcast via Africa's Talking API.`,
        "success",
      );
    } else {
      triggerNotification(`Course notice posted successfully.`, "success");
    }
  };*/
  const handlePostAnnouncement = (courseId, notice, sendSMS) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return { ...c, announcements: [notice, ...c.announcements] };
        }
        return c;
      }),
    );
    if (!isOnlineSimulated) {
      setTeacherDrafts((prev) => [
        ...prev,
        {
          type: "ADD_ANNOUNCEMENT",
          courseId,
          payload: {
            noticeId: notice.id,
            smsRequested: notice.smsRequested,
          },
        },
      ]);
    }

    if (sendSMS) {
      triggerNotification(
        `Notice posted & queued for SMS carrier broadcast via Africa's Talking API.`,
        "success",
      );
    } else {
      triggerNotification(`Course notice posted successfully.`, "success");
    }
  };

  /*const handleReplyQuestion = (courseId, discussionId, replyText) => {
    const newReply = {
      author: currentUser.username || "Instructor Amina",
      role: "Teacher",
      date: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      text: replyText,
    };

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedDiscussions = c.discussions.map((d) => {
            if (d.id === discussionId) {
              return { ...d, replies: [...(d.replies || []), newReply] };
            }
            return d;
          });
          return { ...c, discussions: updatedDiscussions };
        }
        return c;
      }),
    );

    triggerNotification(
      "Instructor response posted to discussion thread.",
      "success",
    );
  };*/

  // Handler to save an instructor's reply to a student question
  /*const handlePostQAReply = (courseId, questionId, replyText) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        // 1. Find the target course
        if (course.id !== courseId) return course;

        // 2. Map through questions and append the reply to the matching question
        const updatedQAPosts = (course.discussions || []).map((q) => {
          if (q.id !== questionId) return q;

          const newReply = {
            id: `rep-${Date.now()}`,
            author: "Instructor (You)",
            text: replyText,
            timestamp: isOnlineSimulated ? "Just now" : "Pending Sync",
          };

          return {
            ...q,
            isAnswered: true, // Mark question as answered
            replies: [...(q.replies || []), newReply], // Add new reply to existing list
          };
        });

        // 3. Return updated course object
        return {
          ...course,
          qaPosts: updatedQAPosts,
        };
      }),
    );
  };*/

  const handlePostQAReply = (courseId, discussionId, replyText) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.id !== courseId) return course;

        const newReply = {
          author: currentUser.username || "Instructor Amina",
          role: "Teacher",
          date: new Date().toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          text: replyText,
        };

        return {
          ...course,
          discussions: course.discussions.map((d) =>
            d.id === discussionId
              ? { ...d, replies: [...(d.replies || []), newReply] }
              : d,
          ),
        };
      }),
    );

    triggerNotification(
      isOnlineSimulated
        ? "Instructor response posted to discussion thread."
        : "Reply saved locally — will sync once reconnected.",
      "success",
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800 pb-12">
      {/* Dynamic Status Notification Banner */}
      {statusMessage && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold text-white ${
              statusMessage.type === "success"
                ? "bg-emerald-600 border-emerald-500"
                : "bg-amber-600 border-amber-500"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* HEADER BAR: Instructor Identity & Sync Engine */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Instructor Control Panel
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {courses.length} Active Modules
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2">
            Welcome, {currentUser?.username || "Instructor Amina"}!
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish course guides, construct interactive quizzes, post SMS
            announcements, and monitor student score ledgers.
          </p>
        </div>

        {/* Dynamic Sync Status Indicator */}
        <div className="flex items-center justify-between gap-3">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition ${
              isOnlineSimulated
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-900 border-amber-200"
            }`}
          >
            {isOnlineSimulated ? (
              <Wifi className="h-4 w-4 text-emerald-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-600" />
            )}
            <div className="flex flex-col">
              <span>{isOnlineSimulated ? "Online" : "Offline Mode"}</span>
              {teacherDrafts.length > 0 && (
                <span className="text-[10px] font-medium text-amber-700">
                  ⏳ {teacherDrafts.length} draft item(s) pending publish
                </span>
              )}
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-2xl transition"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* VIEW LEVEL 1: ALL COURSES GRID OR SELECTED COURSE WORKSPACE */}
      {!activeCourse ? (
        <div className="space-y-6 mx-10 md:mx-60">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                My Teaching Curriculum
              </h2>
              <p className="text-xs text-slate-500">
                Select a module to manage materials, quizzes, and gradebooks.
              </p>
            </div>

            <button
              onClick={() => setIsCreateCourseOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition shadow-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Course</span>
            </button>
          </div>

          <TeacherCoursesTab
            courses={courses}
            onSelectCourse={(id) => {
              setActiveCourseId(id);
              setActiveTab("publisher");
            }}
            onOpenCreateModal={() => setIsCreateCourseOpen(true)}
          />
        </div>
      ) : (
        <div className="space-y-6 mx-10 md:mx-70">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setActiveCourseId(null)}
              className="flex mr-10 items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to All Courses</span>
            </button>

            <span className="text-xs font-semibold text-slate-500">
              Editing:{" "}
              <strong className="text-slate-900">{activeCourse.title}</strong>
            </span>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              {activeCourse.subject}
            </span>
            <h2 className="text-2xl font-black">{activeCourse.title}</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {activeCourse.description}
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                {activeCourse.enrolledStudents || 28} Enrolled Students
              </span>
              <span>&bull;</span>
              <span>{activeCourse.materials.length} Materials</span>
              <span>&bull;</span>
              <span>{activeCourse.quizzes.length} Quizzes</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("publisher")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "publisher"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>📖 Publisher ({activeCourse.materials.length})</span>
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
              <span>🧪 Quiz Builder ({activeCourse.quizzes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("announcements")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "announcements"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Radio className="h-4 w-4" />
              <span>
                📢 SMS Broadcasts ({activeCourse.announcements.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("qa")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "qa"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>💬 Q&A Feed ({activeCourse.discussions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("gradebook")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "gradebook"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>📊 Class Gradebook</span>
            </button>
          </div>

          {activeTab === "publisher" && (
            <TeacherContentPublisherTab
              activeCourse={activeCourse}
              onAddMaterial={(material) =>
                handleAddMaterial(activeCourse.id, material)
              }
            />
          )}

          {activeTab === "quizzes" && (
            <TeacherQuizBuilderTab
              activeCourse={activeCourse}
              onOpenQuizCreator={() => setIsQuizCreatorOpen(true)}
              quizAttempts={quizAttempts.filter(
                (a) => a.courseId === activeCourse.id,
              )}
            />
          )}

          {activeTab === "announcements" && (
            <TeacherAnnouncementsTab
              activeCourse={activeCourse}
              isOnlineSimulated={isOnlineSimulated}
              onPostAnnouncement={(notice, sendSMS) =>
                handlePostAnnouncement(activeCourse.id, notice, sendSMS)
              }
            />
          )}

          {activeTab === "qa" && (
            <TeacherQAQueueTab
              activeCourse={activeCourse}
              isOnlineSimulated={isOnlineSimulated}
              onPostReply={(discussionId, replyText) =>
                handlePostQAReply(activeCourse.id, discussionId, replyText)
              }
            />
          )}

          {activeTab === "gradebook" && (
            <TeacherGradebookTab
              activeCourse={activeCourse}
              quizAttempts={quizAttempts.filter(
                (a) => a.courseId === activeCourse.id,
              )}
              onSelectAttemptDetail={(attempt) =>
                setSelectedAttemptDetail(attempt)
              }
            />
          )}
        </div>
      )}

      {isCreateCourseOpen && (
        <CreateCourseModal
          onSubmit={handleCreateCourse}
          onClose={() => setIsCreateCourseOpen(false)}
        />
      )}

      {isQuizCreatorOpen && activeCourse && (
        <QuizCreatorModal
          courseTitle={activeCourse.title}
          onSaveQuiz={(newQuiz) => handleSaveQuiz(activeCourse.id, newQuiz)}
          onClose={() => setIsQuizCreatorOpen(false)}
        />
      )}

      {selectedAttemptDetail && (
        <StudentScoreDetailsModal
          attempt={selectedAttemptDetail}
          onClose={() => setSelectedAttemptDetail(null)}
        />
      )}
    </div>
  );
}
