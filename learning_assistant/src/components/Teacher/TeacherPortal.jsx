import { useState, useEffect, useRef, useCallback } from "react";
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

import { coursesAPI, quizzesAPI } from "../../services/api";

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
    id: 1,
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

  useEffect(() => {
    localStorage.setItem("teacher_courses", JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(
      "teacher_pending_drafts",
      JSON.stringify(teacherDrafts),
    );
  }, [teacherDrafts]);

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

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  const activeCourse = courses.find((c) => c.id === activeCourseId);

  // 1. Fetch live courses from FastAPI backend when online
  /*useEffect(() => {
    async function loadLiveCourses() {
      if (!isOnlineSimulated) return;
      try {
        const liveCourses = await coursesAPI.getAllCourses();
        if (Array.isArray(liveCourses) && liveCourses.length > 0) {
          const formatted = liveCourses.map((c) => ({
            ...c,
            teacher:
              c.teacher?.username || currentUser.username || "Instructor",
            enrolledStudents: c.enrollments?.length || 28,
            materials: c.materials || [],
            worksheets: c.worksheets || [],
            quizzes: c.quizzes || [],
            announcements: c.announcements || [],
            discussions: c.discussions || [],
          }));
          setCourses(formatted);
        }
      } catch (err) {
        console.warn(
          "FastAPI unreachable, loading cached local courses:",
          err.message,
        );
      }
    }
    loadLiveCourses();
  }, [isOnlineSimulated, currentUser.username]);*/

  // Robust Fetcher with Mapping Logic
  useEffect(() => {
    async function loadLiveCourses() {
      // Only attempt fetch if we have an internet connection
      if (!isOnlineSimulated) return;

      try {
        const liveCourses = await coursesAPI.getAllCourses();

        if (Array.isArray(liveCourses)) {
          const formatted = liveCourses.map((c) => ({
            ...c,
            // Provide defaults to prevent UI crashes
            teacher:
              c.teacher?.username || currentUser.username || "Instructor",
            enrolledStudents: c.enrollments?.length || 0,
            materials: c.materials || [],
            worksheets: c.worksheets || [],
            quizzes: c.quizzes || [],
            announcements: c.announcements || [],
            discussions: c.discussions || [],
          }));
          setCourses(formatted);
        }
      } catch (err) {
        console.warn(
          "FastAPI unreachable, using local storage cache:",
          err.message,
        );
      }
    }

    loadLiveCourses();
  }, [isOnlineSimulated, currentUser.username]);

  // 2. Reconnection Sync Engine: Flush offline teacher drafts to FastAPI
  /*const prevOnlineRef = useRef(isOnlineSimulated);

  useEffect(() => {
    const justReconnected = isOnlineSimulated && !prevOnlineRef.current;
    prevOnlineRef.current = isOnlineSimulated;

    if (!justReconnected || teacherDrafts.length === 0) return;

    async function flushTeacherDrafts() {
      const teacherId = currentUser.id || 1;
      let syncedCount = 0;

      for (const draft of teacherDrafts) {
        try {
          if (draft.type === "CREATE_COURSE") {
            await coursesAPI.createCourse(draft.payload, teacherId);
            syncedCount++;
          } else if (draft.type === "ADD_MATERIAL") {
            await coursesAPI.addMaterial(draft.courseId, draft.payload);
            syncedCount++;
          } else if (draft.type === "ADD_QUIZ") {
            await quizzesAPI.createQuiz(draft.courseId, draft.payload);
            syncedCount++;
          } else if (draft.type === "ADD_ANNOUNCEMENT") {
            await coursesAPI.postAnnouncement(
              draft.courseId,
              teacherId,
              draft.payload,
            );
            syncedCount++;
          }
        } catch (err) {
          console.error("Failed to sync draft item:", draft, err);
        }
      }

      if (syncedCount > 0) {
        triggerNotification(
          `Online Gateway Active: Synced ${syncedCount} pending draft(s) to cloud database.`,
          "success",
        );
        setTeacherDrafts([]);
        const freshCourses = await coursesAPI.getAllCourses().catch(() => null);
        if (freshCourses) {
          setCourses(freshCourses);
        }
      }
    }

    flushTeacherDrafts();
  }, [isOnlineSimulated, teacherDrafts, currentUser.id, triggerNotification]);*/

  // 2. Background Sync Engine: Reconnection listener
  const prevOnlineRef = useRef(isOnlineSimulated);
  useEffect(() => {
    const justReconnected = isOnlineSimulated && !prevOnlineRef.current;
    prevOnlineRef.current = isOnlineSimulated;

    if (!justReconnected || teacherDrafts.length === 0) return;

    async function flushTeacherDrafts() {
      const teacherId = currentUser.id || 1;
      let syncedCount = 0;

      const remainingDrafts = [];

      for (const draft of teacherDrafts) {
        try {
          if (draft.type === "CREATE_COURSE") {
            await coursesAPI.createCourse(draft.payload, teacherId);
            syncedCount++;
          } else if (draft.type === "ADD_MATERIAL") {
            await coursesAPI.addMaterial(draft.courseId, draft.payload);
            syncedCount++;
          } else if (draft.type === "ADD_QUIZ") {
            await quizzesAPI.createQuiz(draft.courseId, draft.payload);
            syncedCount++;
          } else if (draft.type === "ADD_DISCUSSION") {
            // You might need to add postDiscussion to your API service for this,
            // or map it to a course announcement if that's your preferred flow
            await coursesAPI.postDiscussion(
              draft.courseId,
              teacherId,
              draft.payload,
            );
            syncedCount++;
          } else if (draft.type === "ADD_ANNOUNCEMENT") {
            await coursesAPI.postAnnouncement(
              draft.courseId,
              teacherId,
              draft.payload,
            );
            syncedCount++;
          }
        } catch (err) {
          console.error("Failed to sync draft item:", draft, err);
          remainingDrafts.push(draft);
        }
      }

      if (syncedCount > 0) {
        triggerNotification(
          `Synced ${syncedCount} offline drafts to server!`,
          "success",
        );
        setTeacherDrafts(remainingDrafts);
        localStorage.setItem(
          "teacher_pending_drafts",
          JSON.stringify(remainingDrafts),
        );

        // Refresh full state
        const freshCourses = await coursesAPI.getAllCourses();
        setCourses(freshCourses);
      }
    }
    flushTeacherDrafts();
  }, [isOnlineSimulated, teacherDrafts, currentUser.id, triggerNotification]);

  //Handle create course function
  const handleCreateCourse = async (newCourseData) => {
    const teacherId = currentUser.id || 1;

    // 1. Create the Robust Object (includes all fields required by your tabs)
    const optimisticCourse = {
      id: Date.now(), // Temporary ID for the UI
      ...newCourseData,
      teacher: currentUser.username || "Instructor Amina",
      enrolledStudents: 0,
      materials: [],
      worksheets: [],
      quizzes: [],
      announcements: [],
      discussions: [],
    };

    // 2. Update UI Optimistically (Immediate feedback)
    setCourses((prev) => [optimisticCourse, ...prev]);
    setIsCreateCourseOpen(false);

    // 3. API Sync Logic
    if (isOnlineSimulated) {
      try {
        const apiResult = await coursesAPI.createCourse(
          {
            title: newCourseData.title,
            subject: newCourseData.subject,
            description: newCourseData.description,
          },
          teacherId,
        );

        // 4. ID Swapping: Update the optimistic item with the REAL DB ID
        setCourses((prev) =>
          prev.map((c) =>
            c.id === optimisticCourse.id
              ? { ...optimisticCourse, id: apiResult.id }
              : c,
          ),
        );

        triggerNotification(`Course published successfully!`, "success");
      } catch (err) {
        console.error(`Error ocurred: ${err}`);
        // Fallback: Save to drafts if API fails
        setTeacherDrafts((prev) => [
          ...prev,
          { type: "CREATE_COURSE", payload: newCourseData },
        ]);
        triggerNotification("Course saved locally (Offline)", "amber");
      }
    } else {
      // Offline mode
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "CREATE_COURSE", payload: newCourseData },
      ]);
      triggerNotification("Saved locally (Offline Mode)", "amber");
    }
  };

  /*const handleCreateCourse = async (newCourseData) => {
    const teacherId = currentUser.id || 1;
    let createdCourse = {
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

    if (isOnlineSimulated) {
      try {
        const apiResult = await coursesAPI.createCourse(
          {
            title: newCourseData.title,
            subject: newCourseData.subject,
            description: newCourseData.description,
          },
          teacherId,
        );
        createdCourse = { ...createdCourse, id: apiResult.id };
        triggerNotification(
          `New course "${createdCourse.title}" published to school database!`,
          "success",
        );
      } catch (err) {
        setTeacherDrafts((prev) => [
          ...prev,
          { type: "CREATE_COURSE", payload: createdCourse },
        ]);
        triggerNotification(
          `Saved locally as draft (${err.message || "Offline"}).`,
          "amber",
        );
      }
    } else {
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "CREATE_COURSE", payload: createdCourse },
      ]);
      triggerNotification(
        "Course saved locally as draft (Offline Mode).",
        "amber",
      );
    }

    setCourses((prev) => [createdCourse, ...prev]);
    setIsCreateCourseOpen(false);
  };*/

  const handleAddMaterial = async (courseId, material) => {
    // 1. Optimistic Update (Immediate UI response)
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, materials: [material, ...c.materials] } : c,
      ),
    );

    // 2. Prepare Payload (Strict Mapping for FastAPI)
    const apiPayload = {
      title: material.title,
      file_type: material.type || "pdf",
      size: material.size || "1 MB",
      read_time: material.readTime || "15 min",
      content: material.content,
    };

    // 3. API Sync Logic
    if (isOnlineSimulated) {
      try {
        await coursesAPI.addMaterial(courseId, apiPayload);
        triggerNotification(
          `Material "${material.title}" synced to cloud!`,
          "success",
        );
      } catch (err) {
        console.error("Sync failed, queuing draft:", err);
        setTeacherDrafts((prev) => [
          ...prev,
          { type: "ADD_MATERIAL", courseId, payload: material },
        ]);
        triggerNotification(
          "Connection lost. Saved locally as draft.",
          "amber",
        );
      }
    } else {
      // 4. Offline Logic
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "ADD_MATERIAL", courseId, payload: material },
      ]);
      triggerNotification("Saved locally (Offline Mode).", "amber");
    }
  };

  /*const handleAddMaterial = async (courseId, material) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return { ...c, materials: [material, ...c.materials] };
        }
        return c;
      }),
    );

    if (isOnlineSimulated) {
      try {
        await coursesAPI.addMaterial(courseId, {
          title: material.title,
          file_type: material.type || "pdf",
          size: material.size || "1 MB",
          read_time: material.readTime || "15 min",
          content: material.content,
        });
        triggerNotification(
          `Material "${material.title}" attached and synced to cloud!`,
          "success",
        );
      } catch (err) {
        console.error(`Error occured: ${err}`);
        setTeacherDrafts((prev) => [
          ...prev,
          { type: "ADD_MATERIAL", courseId, payload: material },
        ]);
        triggerNotification(`Material saved locally as draft.`, "amber");
      }
    } else {
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "ADD_MATERIAL", courseId, payload: material },
      ]);
      triggerNotification(`Material saved locally (Offline Mode).`, "amber");
    }
  };*/
  const handleSaveQuiz = async (courseId, newQuiz) => {
    // 1. Optimistic Update (Immediate UI response)
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, quizzes: [newQuiz, ...c.quizzes] } : c,
      ),
    );

    // 2. Prepare Payload (Strict Mapping)
    const apiPayload = {
      title: newQuiz.title,
      time_limit: newQuiz.timeLimit || "15 mins",
      questions_json: newQuiz.questions, // Ensure this matches your FastAPI schema
    };

    // 3. API Sync Logic
    if (isOnlineSimulated) {
      try {
        await quizzesAPI.createQuiz(courseId, apiPayload);
        triggerNotification(
          `Quiz "${newQuiz.title}" published to server!`,
          "success",
        );
      } catch (err) {
        console.error("Quiz sync failed:", err);
        setTeacherDrafts((prev) => [
          ...prev,
          { type: "ADD_QUIZ", courseId, payload: newQuiz },
        ]);
        triggerNotification(
          "Connection issue. Quiz saved locally as draft.",
          "amber",
        );
      }
    } else {
      // 4. Offline Logic
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "ADD_QUIZ", courseId, payload: newQuiz },
      ]);
      triggerNotification("Quiz saved locally (Offline Mode).", "amber");
    }

    setIsQuizCreatorOpen(false);
  };

  /*const handleSaveQuiz = async (courseId, newQuiz) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return { ...c, quizzes: [newQuiz, ...c.quizzes] };
        }
        return c;
      }),
    );

    if (isOnlineSimulated) {
      try {
        await quizzesAPI.createQuiz(courseId, {
          title: newQuiz.title,
          time_limit: newQuiz.timeLimit || "15 mins",
          questions_json: newQuiz.questions,
        });
        triggerNotification(
          `Quiz "${newQuiz.title}" published to server!`,
          "success",
        );
      } catch (err) {
        setTeacherDrafts((prev) => [
          ...prev,
          { type: "ADD_QUIZ", courseId, payload: newQuiz },
        ]);
        triggerNotification(`Quiz saved locally as draft.`, "amber");
      }
    } else {
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "ADD_QUIZ", courseId, payload: newQuiz },
      ]);
      triggerNotification(`Quiz saved locally (Offline Mode).`, "amber");
    }

    setIsQuizCreatorOpen(false);
  };*/

  const handlePostAnnouncement = async (courseId, notice, sendSMS) => {
    const teacherId = currentUser.id || 1;

    // 1. Optimistic Update (Immediate UI response)
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? { ...c, announcements: [notice, ...c.announcements] }
          : c,
      ),
    );

    // 2. Prepare Payload (Strict mapping for your backend schema)
    const apiPayload = {
      title: notice.title,
      content: notice.content,
      sent_via_sms: sendSMS,
    };

    // 3. API Sync Logic
    if (isOnlineSimulated) {
      try {
        await coursesAPI.postAnnouncement(courseId, teacherId, apiPayload);

        // Better UX: Tell the teacher exactly what happened
        const successMsg = sendSMS
          ? `Notice posted & SMS broadcast dispatched via Africa's Talking API.`
          : `Course notice posted successfully.`;
        triggerNotification(successMsg, "success");
      } catch (err) {
        console.error("Announcement sync failed:", err);
        // Fallback: Queue for background sync
        setTeacherDrafts((prev) => [
          ...prev,
          { type: "ADD_ANNOUNCEMENT", courseId, payload: apiPayload },
        ]);
        triggerNotification(
          "Connection issue. Notice saved locally as draft.",
          "amber",
        );
      }
    } else {
      // 4. Offline Logic
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "ADD_ANNOUNCEMENT", courseId, payload: apiPayload },
      ]);
      triggerNotification("Notice saved locally (Offline Mode).", "amber");
    }
  };

  /*const handlePostAnnouncement = async (courseId, notice, sendSMS) => {
    const teacherId = currentUser.id || 1;
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return { ...c, announcements: [notice, ...c.announcements] };
        }
        return c;
      }),
    );

    const announcementPayload = {
      title: notice.title,
      content: notice.content,
      sent_via_sms: sendSMS,
    };

    if (isOnlineSimulated) {
      try {
        await coursesAPI.postAnnouncement(
          courseId,
          teacherId,
          announcementPayload,
        );
        triggerNotification(
          sendSMS
            ? `Notice posted & SMS broadcast dispatched via Africa's Talking API.`
            : `Course notice posted successfully.`,
          "success",
        );
      } catch (err) {
        setTeacherDrafts((prev) => [
          ...prev,
          { type: "ADD_ANNOUNCEMENT", courseId, payload: announcementPayload },
        ]);
        triggerNotification(`Notice saved locally as draft.`, "amber");
      }
    } else {
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "ADD_ANNOUNCEMENT", courseId, payload: announcementPayload },
      ]);
      triggerNotification(`Notice saved locally (Offline Mode).`, "amber");
    }
  };*/

  const handlePostQAReply = async (courseId, discussionId, replyText) => {
    const userId = currentUser.id || 1;

    // 1. Optimistic Update (Immediate UI response)
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

    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.id !== courseId) return course;
        return {
          ...course,
          discussions: (course.discussions || []).map((d) =>
            d.id === discussionId
              ? { ...d, replies: [...(d.replies || []), newReply] }
              : d,
          ),
        };
      }),
    );

    // 2. Prepare Payload
    const apiPayload = {
      text: replyText,
      parent_id: typeof discussionId === "number" ? discussionId : null,
    };

    // 3. API Sync Logic
    if (isOnlineSimulated) {
      try {
        await coursesAPI.postDiscussion(courseId, userId, apiPayload);
        triggerNotification(
          "Instructor response published to live discussion board.",
          "success",
        );
      } catch (err) {
        console.error("Discussion sync failed, queuing draft:", err);
        // Fallback: Queue for background sync
        setTeacherDrafts((prev) => [
          ...prev,
          { type: "ADD_DISCUSSION", courseId, payload: apiPayload },
        ]);
        triggerNotification(
          "Connection issue. Reply saved locally as draft.",
          "amber",
        );
      }
    } else {
      // 4. Offline Logic
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "ADD_DISCUSSION", courseId, payload: apiPayload },
      ]);
      triggerNotification("Reply saved locally (Offline Mode).", "amber");
    }
  };

  /*const handlePostQAReply = async (courseId, discussionId, replyText) => {
    const userId = currentUser.id || 1;
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

    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.id !== courseId) return course;
        return {
          ...course,
          discussions: (course.discussions || []).map((d) =>
            d.id === discussionId
              ? { ...d, replies: [...(d.replies || []), newReply] }
              : d,
          ),
        };
      }),
    );

    if (isOnlineSimulated) {
      try {
        await coursesAPI.postDiscussion(courseId, userId, {
          text: replyText,
          parent_id: typeof discussionId === "number" ? discussionId : null,
        });
        triggerNotification(
          "Instructor response published to live discussion board.",
          "success",
        );
      } catch (err) {
        triggerNotification(
          "Reply saved locally — will sync once reconnected.",
          "amber",
        );
      }
    } else {
      triggerNotification("Reply saved locally (Offline Mode).", "amber");
    }
  };*/
  //Handles delete course
  const handleDeleteCourse = async (courseId) => {
    // Optimistic UI update
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    if (activeCourseId === courseId) {
      setActiveCourseId(null);
    }

    if (isOnlineSimulated) {
      try {
        await coursesAPI.deleteCourse(courseId);
        triggerNotification("Course deleted successfully!", "success");
      } catch (err) {
        console.err(`Error ocurred: ${err}`);
        setTeacherDrafts((prev) => [
          ...prev,
          { type: "DELETE_COURSE", courseId },
        ]);
        triggerNotification(
          "Course removal queued for sync (Offline)",
          "amber",
        );
      }
    } else {
      setTeacherDrafts((prev) => [
        ...prev,
        { type: "DELETE_COURSE", courseId },
      ]);
      triggerNotification(
        "Course removal queued for sync (Offline Mode)",
        "amber",
      );
    }
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
              <span>
                {isOnlineSimulated ? "Online Gateway Active" : "Offline Mode"}
              </span>
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
            onDeleteCourse={handleDeleteCourse}
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
              <span>{activeCourse.materials?.length || 0} Materials</span>
              <span>&bull;</span>
              <span>{activeCourse.quizzes?.length || 0} Quizzes</span>
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
              <span>📖 Publisher ({activeCourse.materials?.length || 0})</span>
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
              <span>🧪 Quiz Builder ({activeCourse.quizzes?.length || 0})</span>
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
                📢 SMS Broadcasts ({activeCourse.announcements?.length || 0})
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
              <span>💬 Q&A Feed ({activeCourse.discussions?.length || 0})</span>
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
