import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  BookOpen,
  Mail,
  Lock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Smartphone,
  Layers,
  User,
} from "lucide-react";
import { authAPI } from "../services/api";

// Default seed accounts to ensure seamless offline testing
const DEFAULT_SEED_USERS = [
  {
    id: 1,
    email: "admin@admin.edu",
    username: "SuperAdmin",
    password: "password123",
    phone: "+250788000111",
    role: "admin",
  },
  {
    id: 2,
    email: "amina@teacher.edu",
    username: "Instructor Amina",
    password: "password123",
    phone: "+250788123456",
    role: "teacher",
  },
  {
    id: 3,
    email: "natinael@student.edu",
    username: "Natinael Boda",
    password: "password123",
    phone: "+250788555666",
    role: "student",
  },
];

export default function Home({ isOnline, toast, setToast, onLoginSuccess }) {
  const navigate = useNavigate();

  // Navigation on the header
  const [activeTab, setActiveTab] = useState("home");

  // Authentication Forms State
  const [authMode, setAuthMode] = useState("login");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // PWA Installation State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  // Registration Fields
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("school_registered_users");

      // 1. Process local data: Force every ID to be a Number
      let initialData = [];
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // SANITIZATION: Force ID to be a Number
          initialData = parsed.map((u) => ({ ...u, id: Number(u.id) }));
        }
      }

      // 2. Merge defaults, also forcing their IDs to numbers
      const merged = [...initialData];
      DEFAULT_SEED_USERS.forEach((defaultUser) => {
        if (
          !merged.some(
            (u) => u.email.toLowerCase() === defaultUser.email.toLowerCase(),
          )
        ) {
          merged.push({ ...defaultUser, id: Number(defaultUser.id) });
        }
      });

      return merged;
    } catch (err) {
      console.error("Failed to parse stored users:", err);
      return DEFAULT_SEED_USERS.map((u) => ({ ...u, id: Number(u.id) }));
    }
  });

  const persistUsers = (users) => {
    setRegisteredUsers(users);
    localStorage.setItem("school_registered_users", JSON.stringify(users));
  };

  const triggerToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getRoleFromEmail = (email) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.endsWith("@student.edu")) return "student";
    if (cleanEmail.endsWith("@teacher.edu")) return "teacher";
    if (cleanEmail.endsWith("@admin.edu")) return "admin";
    return null;
  };

  // Route to the right portal after a successful login/registration
  const completeLogin = (user, message) => {
    onLoginSuccess(user);
    setShowAuthModal(false);
    triggerToast(message, "success");
    navigate(`/${user.role}`);
  };

  // UPDATED: Connected to Live Backend API with Offline Fallback
  const handleLogin = async (e) => {
    e.preventDefault();
    const inputClean = loginEmail.trim();
    const passwordClean = loginPassword.trim();

    try {
      // 1. Attempt live authentication via FastAPI
      const data = await authAPI.login(inputClean, passwordClean);
      setLoginEmail("");
      setLoginPassword("");
      completeLogin(
        data.user,
        `Welcome back, ${data.user.username}! Role: ${data.user.role.toUpperCase()}`,
      );
    } catch (error) {
      // 2. Offline / Fallback Authentication against Local Storage
      const user = registeredUsers.find((u) => {
        const emailMatches =
          u.email && u.email.toLowerCase().trim() === inputClean.toLowerCase();
        const usernameMatches =
          u.username &&
          u.username.toLowerCase().trim() === inputClean.toLowerCase();
        const passwordMatches =
          u.password && u.password.trim() === passwordClean;

        return (emailMatches || usernameMatches) && passwordMatches;
      });

      if (user) {
        setLoginEmail("");
        setLoginPassword("");
        completeLogin(
          user,
          `Welcome back, ${user.username}! (Offline Cached Mode)`,
        );
      } else {
        triggerToast(
          error.message ||
            "Invalid credentials. Please verify your login details.",
          "error",
        );
      }
    }
  };

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User installed EduHelp PWA");
    }
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  // UPDATED: Connected to Live Backend API for Pre-Authorized Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    const emailLower = registerEmail.trim().toLowerCase();
    const detectedRole = getRoleFromEmail(emailLower);

    if (!detectedRole) {
      triggerToast(
        "Registration rejected! You must use a school provided email: @student.edu, @teacher.edu, or @admin.edu",
        "error",
      );
      return;
    }

    const cleanPhone = registerPhone.trim();
    if (!cleanPhone) {
      triggerToast(
        "Please enter a valid mobile phone number for SMS alerts.",
        "error",
      );
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      triggerToast("Passwords do not match. Please retype.", "error");
      return;
    }

    const formattedPhone = cleanPhone.startsWith("+")
      ? cleanPhone
      : `+250${cleanPhone.replace(/^0+/, "")}`;

    const newUserPayload = {
      id: Number(Date.now()),
      email: emailLower,
      username: registerUsername.trim(),
      phone: formattedPhone,
      password: registerPassword.trim(),
      role: detectedRole,
    };

    try {
      // 1. Attempt live registration with FastAPI
      const newDbUser = await authAPI.register(newUserPayload);

      // Cache user locally
      persistUsers([
        ...registeredUsers,
        { ...newUserPayload, id: newDbUser.id },
      ]);

      setRegisterEmail("");
      setRegisterUsername("");
      setRegisterPhone("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");

      completeLogin(
        newDbUser,
        `Account registered successfully! Welcome ${newDbUser.username}.`,
      );
    } catch (error) {
      triggerToast(
        error.message ||
          "Registration failed. Ensure email is pre-authorized by admin.",
        "error",
      );
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    const emailLower = resetPasswordEmail.trim().toLowerCase();
    const detectedRole = getRoleFromEmail(emailLower);

    if (!detectedRole) {
      triggerToast(
        "Please enter a valid school email ending in @student.edu, @teacher.edu, or @admin.edu",
        "error",
      );
      return;
    }

    triggerToast(
      isOnline
        ? `Password reset link dispatched to ${emailLower}. Check your school inbox.`
        : "You are offline: Password recovery request pending. Contact support team or use SMS keyword RESET.",
      "success",
    );

    setShowAuthModal(false);
    setResetPasswordEmail("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans">
      {/* Toast Alert System */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-lg border text-sm font-semibold text-white ${
              toast.type === "success"
                ? "bg-emerald-600 border-emerald-500"
                : "bg-rose-600 border-rose-500"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab("home")}
          >
            <BookOpen className="h-6 w-6 text-indigo-400" />
            <span className="font-bold text-lg tracking-tight">
              Offline-First Learning Assistant
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab("home")}
              className={`transition hover:text-indigo-300 ${activeTab === "home" ? "text-indigo-400 font-bold border-b-2 border-indigo-400 pb-1" : "text-slate-300"}`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`transition hover:text-indigo-300 ${activeTab === "about" ? "text-indigo-400 font-bold border-b-2 border-indigo-400 pb-1" : "text-slate-300"}`}
            >
              About Us
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`transition hover:text-indigo-300 ${activeTab === "contact" ? "text-indigo-400 font-bold border-b-2 border-indigo-400 pb-1" : "text-slate-300"}`}
            >
              Contact Us
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {canInstall && (
              <button
                onClick={handleInstallClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span>Install App</span>
              </button>
            )}

            <button
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-grow w-full">
        {activeTab === "home" && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <span className="bg-indigo-100 text-indigo-700 text-3xl px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
                ALU
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                Empowering Classrooms <br />
                <span className="text-indigo-600">
                  With or Without Connection
                </span>
              </h1>
              <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Welcome to your study assistant for the Offline-First resource
                access and use. Sign up or login using your school-provided
                email to access textbooks, assignments, and quizzes teachers
                shared locally on your browser.
              </p>

              <div className="flex justify-center items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    setAuthMode("register");
                    setShowAuthModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition"
                >
                  Register
                </button>
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuthModal(true);
                  }}
                  className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm transition"
                >
                  Login
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="bg-indigo-50 text-indigo-600 h-10 w-10 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  Offline Study and Resource Access
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Download or cache study materials or open quizzes while
                  connected to the internet either in school or areas where
                  there is more internet access, then review modules(courses),
                  notes, announcements, and other resources any time offline.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="bg-indigo-50 text-indigo-600 h-10 w-10 rounded-xl flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  Auto-Syncing Quiz
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  You can take quizzes any time even offline once they are
                  loaded to the app. Even though you take it offline, your
                  results are calculated immediatly based on provided answer.
                  The quiz results then securly stored in the browser local
                  storage. Once your connection is restored, they are
                  automatically synced.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="bg-indigo-50 text-indigo-600 h-10 w-10 rounded-xl flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  Integrated SMS Broadcasting
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  You now no longer suffer from delayed or lack of information.
                  You will receive SMS messages about announcements, exam
                  deadlines, and other notifications in real time by the phone
                  number you provided during registration.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
            <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-md font-bold uppercase tracking-wider">
              Our Mission
            </span>
            <h2 className="text-3xl font-black text-slate-900 leading-none">
              About the Learning Assistant
            </h2>

            <p className="text-slate-600 leading-relaxed">
              Nowadays, people suffer from lack of internet access not only
              because there is no infrastracture or providers, but also because
              data bundle is getting more and more expensive. Many rural or
              remote regions suffer more. As result, educational content
              distribution and access is not balanced in different regions.
            </p>

            <div className="border-l-4 border-indigo-500 pl-4 py-1 bg-slate-50 rounded-r-lg">
              <p className="text-sm font-semibold text-indigo-950 italic">
                Our mission is to make educational resources accessible, and
                also create a formal and professional platform to schools to
                share resources and communicate with students.
              </p>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6 max-w-2xl mx-auto">
            <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-md font-bold uppercase tracking-wider">
              Support Desk
            </span>
            <h2 className="text-3xl font-black text-slate-900 leading-none">
              Connect With Our SupportDesk
            </h2>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-4">
              <Phone className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  SMS Gateway Integration Desk
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  If you suffer from issues while registering, contact us.
                  Support SMS/whatsapp Code:{" "}
                  <span className="bg-grey text-black">+250 000 000 000</span>{" "}
                  (This not real phone. Used here for education purpose)
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-100 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {authMode === "login"
                    ? "School Portal Login"
                    : authMode === "register"
                      ? "Register New Account"
                      : "Reset Password"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Access requires a pre-authorized student, teacher, or admin
                  email.
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold text-sm"
              >
                Close
              </button>
            </div>

            {authMode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    School Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g., natinael@student.edu or Natinael Boda"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot")}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
                >
                  Login
                </button>
              </form>
            )}

            {authMode === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Authorized School Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="e.g., natinael@student.edu"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Choose Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g., NatinaelB"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Phone Field for SMS Alerts */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex justify-between items-center">
                    <span>Mobile Phone Number</span>
                    <span className="text-[10px] font-semibold text-purple-600">
                      SMS Alerts
                    </span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-purple-600" />
                    <input
                      type="tel"
                      placeholder="+250788000000"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Required for cellular notifications
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Secure Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Create password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={registerConfirmPassword}
                      onChange={(e) =>
                        setRegisterConfirmPassword(e.target.value)
                      }
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
                >
                  Register Account
                </button>
              </form>
            )}

            {authMode !== "forgot" && (
              <div className="text-center pt-2">
                {authMode === "login" ? (
                  <p className="text-xs text-slate-500">
                    Haven't created an account?{" "}
                    <button
                      onClick={() => setAuthMode("register")}
                      className="text-indigo-600 hover:underline font-bold"
                    >
                      Register
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <button
                      onClick={() => setAuthMode("login")}
                      className="text-indigo-600 hover:underline font-bold"
                    >
                      Login
                    </button>
                  </p>
                )}
              </div>
            )}

            {authMode === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your school email address (@student.edu, @teacher.edu,
                  or @admin.edu). You will then receive reset instructions.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    School Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="e.g., natinael@student.edu"
                      value={resetPasswordEmail}
                      onChange={(e) => setResetPasswordEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition"
                >
                  Request Password Reset
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="text-xs text-slate-500 hover:text-indigo-600 font-medium"
                  >
                    Remembered your password?{" "}
                    <span className="font-bold text-indigo-600">
                      Back to Login
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
