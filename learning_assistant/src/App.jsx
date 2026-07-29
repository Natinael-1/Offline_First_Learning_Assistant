import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/homepage";
import StudentPortal from "./components/Student/StudentPortal";
import TeacherPortal from "./components/Teacher/TeacherPortal.jsx";
import AdminPortal from "./components/Admin/AdminPortal.jsx";
import ReloadPrompt from "./components/ReloadPrompt.jsx";

export default function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("school_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("school_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("school_current_user");
    }
  }, [currentUser]);

  useEffect(() => {
    // 1. Listen for browser hardware events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 2. Active Health Check: Pings backend to confirm real network reachability
    const checkRealConnection = async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/api/health", {
          method: "GET",
          cache: "no-store",
        });
        setIsOnline(res.ok);
      } catch (err) {
        console.error(`Error occured: ${err}`);
        setIsOnline(false);
      }
    };

    // Run check immediately on mount and every 10 seconds
    checkRealConnection();
    const intervalId = setInterval(checkRealConnection, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  /*useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);*/

  const triggerToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    triggerToast("Logged out successfully.", "success");
  };

  return (
    <BrowserRouter>
      <ReloadPrompt />
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
          {toast.message}
        </div>
      )}

      <Routes>
        {/* PUBLIC ROUTE: landing page + auth modal. If already logged in, bounce to the right portal */}
        <Route
          path="/"
          element={
            currentUser ? (
              <Navigate to={`/${currentUser.role}`} replace />
            ) : (
              <Home
                onLoginSuccess={setCurrentUser}
                isOnline={isOnline}
                toast={toast}
                setToast={setToast}
                triggerToast={triggerToast}
              />
            )
          }
        />

        <Route
          path="/student"
          element={
            currentUser?.role === "student" ? (
              <StudentPortal
                currentUser={currentUser}
                isOnlineSimulated={isOnline}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/teacher"
          element={
            currentUser?.role === "teacher" ? (
              <TeacherPortal
                currentUser={currentUser}
                isOnlineSimulated={isOnline}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin"
          element={
            currentUser?.role === "admin" ? (
              <AdminPortal
                currentUser={currentUser}
                isOnlineSimulated={isOnline}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
