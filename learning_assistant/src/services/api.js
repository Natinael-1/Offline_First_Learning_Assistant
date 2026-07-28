/*const BASE_URL = "http://127.0.0.1:8000/api";

// Helper to retrieve saved JWT token
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper with offline graceful fallback
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API Request Failed] ${endpoint}:`, error.message);
    throw error;
  }
}

export const authAPI = {
  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }
    return data;
  },

  register: async (userData) => {
    return await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("school_current_user");
  },
};

export const coursesAPI = {
  getAllCourses: async () => {
    return await request("/courses/");
  },

  getCourseById: async (courseId) => {
    return await request(`/courses/${courseId}`);
  },

  createCourse: async (courseData, teacherId) => {
    return await request(`/courses/?teacher_id=${teacherId}`, {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  },

  addMaterial: async (courseId, materialData) => {
    return await request(`/courses/${courseId}/materials`, {
      method: "POST",
      body: JSON.stringify(materialData),
    });
  },

  addWorksheet: async (courseId, worksheetData) => {
    return await request(`/courses/${courseId}/worksheets`, {
      method: "POST",
      body: JSON.stringify(worksheetData),
    });
  },

  addFlashcard: async (courseId, flashcardData) => {
    return await request(`/courses/${courseId}/flashcards`, {
      method: "POST",
      body: JSON.stringify(flashcardData),
    });
  },

  postAnnouncement: async (courseId, teacherId, announcementData) => {
    return await request(
      `/courses/${courseId}/announcements?teacher_id=${teacherId}`,
      {
        method: "POST",
        body: JSON.stringify(announcementData),
      },
    );
  },

  postDiscussion: async (courseId, userId, discussionData) => {
    return await request(`/courses/${courseId}/discussions?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify(discussionData),
    });
  },
};

export const quizzesAPI = {
  createQuiz: async (courseId, quizData) => {
    return await request(`/quizzes/?course_id=${courseId}`, {
      method: "POST",
      body: JSON.stringify(quizData),
    });
  },

  getQuizById: async (quizId) => {
    return await request(`/quizzes/${quizId}`);
  },

  syncOfflineAttempts: async (studentId, attemptsArray) => {
    return await request(`/quizzes/sync?student_id=${studentId}`, {
      method: "POST",
      body: JSON.stringify({ attempts: attemptsArray }),
    });
  },
};

export const adminAPI = {
  getPreauthorizedDirectory: async () => {
    return await request("/admin/preauthorized");
  },

  preauthorizeEmails: async (entriesArray) => {
    return await request("/admin/preauthorize", {
      method: "POST",
      body: JSON.stringify(entriesArray),
    });
  },

  getPendingTeachers: async () => {
    return await request("/admin/pending-teachers");
  },

  approveTeacher: async (userId) => {
    return await request(`/admin/approve-teacher/${userId}`, {
      method: "POST",
    });
  },

  getAuditLogs: async () => {
    return await request("/admin/audit-logs");
  },

  getSMSLogs: async () => {
    return await request("/admin/sms-logs");
  },
};*/

const BASE_URL = "http://127.0.0.1:8000/api";

// Helper to retrieve saved JWT token
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper with offline graceful fallback
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.warn(`[API Request Failed] ${endpoint}:`, error.message);
    throw error;
  }
}

export const authAPI = {
  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }
    return data;
  },

  register: async (userData) => {
    return await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("school_current_user");
  },
};

export const coursesAPI = {
  getAllCourses: async () => {
    return await request("/courses/");
  },

  getCourseById: async (courseId) => {
    return await request(`/courses/${courseId}`);
  },

  createCourse: async (courseData, teacherId) => {
    return await request(`/courses/?teacher_id=${teacherId}`, {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  },

  deleteCourse: async (courseId) => {
    return await request(`/courses/${courseId}`, {
      method: "DELETE",
    });
  },

  addMaterial: async (courseId, materialData) => {
    return await request(`/courses/${courseId}/materials`, {
      method: "POST",
      body: JSON.stringify(materialData),
    });
  },

  addWorksheet: async (courseId, worksheetData) => {
    return await request(`/courses/${courseId}/worksheets`, {
      method: "POST",
      body: JSON.stringify(worksheetData),
    });
  },

  addFlashcard: async (courseId, flashcardData) => {
    return await request(`/courses/${courseId}/flashcards`, {
      method: "POST",
      body: JSON.stringify(flashcardData),
    });
  },

  postAnnouncement: async (courseId, teacherId, announcementData) => {
    return await request(
      `/courses/${courseId}/announcements?teacher_id=${teacherId}`,
      {
        method: "POST",
        body: JSON.stringify(announcementData),
      },
    );
  },

  postDiscussion: async (courseId, userId, discussionData) => {
    return await request(`/courses/${courseId}/discussions?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify(discussionData),
    });
  },
};

export const quizzesAPI = {
  createQuiz: async (courseId, quizData) => {
    return await request(`/quizzes/?course_id=${courseId}`, {
      method: "POST",
      body: JSON.stringify(quizData),
    });
  },

  getQuizById: async (quizId) => {
    return await request(`/quizzes/${quizId}`);
  },

  syncOfflineAttempts: async (studentId, attemptsArray) => {
    return await request(`/quizzes/sync?student_id=${studentId}`, {
      method: "POST",
      body: JSON.stringify({ attempts: attemptsArray }),
    });
  },
};

export const adminAPI = {
  getPreauthorizedDirectory: async () => {
    return await request("/admin/preauthorized");
  },

  preauthorizeEmails: async (entriesArray) => {
    return await request("/admin/preauthorize", {
      method: "POST",
      body: JSON.stringify(entriesArray),
    });
  },

  getPendingTeachers: async () => {
    return await request("/admin/pending-teachers");
  },

  approveTeacher: async (userId) => {
    return await request(`/admin/approve-teacher/${userId}`, {
      method: "POST",
    });
  },

  getAuditLogs: async () => {
    return await request("/admin/audit-logs");
  },

  getSMSLogs: async () => {
    return await request("/admin/sms-logs");
  },
};
