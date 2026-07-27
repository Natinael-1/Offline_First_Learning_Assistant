import { useState } from "react";
import { useNavigate } from "react-router-dom";

/*
ArrowRight,

*/
import {
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

// Example email addresses provided by the school
const PRE_AUTHORIZED_EMAILS = {
  student: [
    "student1@student.edu",
    "student2@student.edu",
    "natinael@student.edu",
    "abebe@student.edu",
  ],
  teacher: ["amina@teacher.edu", "joshua@teacher.edu", "kwame@teacher.edu"],
  admin: ["admin@admin.edu", "it_support@admin.edu"],
};

export default function Home({ isOnline, toast, setToast, onLoginSuccess }) {
  const navigate = useNavigate();

  // Navigation on the header
  const [activeTab, setActiveTab] = useState("home");

  // Authentication Forms State
  const [authMode, setAuthMode] = useState("login");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Registration Fields (Added registerPhone)
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");

  // Database State - simulating persistent storage
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem("school_registered_users");
    return saved
      ? JSON.parse(saved)
      : [
          {
            email: "admin@admin.edu",
            username: "SuperAdmin",
            password: "password123",
            phone: "+250788000111",
            role: "admin",
          },
          {
            email: "amina@teacher.edu",
            username: "Instructor Amina",
            password: "password123",
            phone: "+250788123456",
            role: "teacher",
          },
          {
            email: "natinael@student.edu",
            username: "Natinael Boda",
            password: "password123",
            phone: "+250788555666",
            role: "student",
          },
        ];
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

  const handleLogin = (e) => {
    e.preventDefault();
    const emailLower = loginEmail.trim().toLowerCase();

    const user = registeredUsers.find(
      (u) =>
        (u.email.toLowerCase() === emailLower || u.username === loginEmail) &&
        u.password === loginPassword,
    );

    if (user) {
      setLoginEmail("");
      setLoginPassword("");
      completeLogin(
        user,
        `Welcome back, ${user.username}! Role: ${user.role.toUpperCase()}`,
      );
    } else {
      triggerToast(
        "Invalid credentials. Please verify your school email/username and password.",
        "error",
      );
    }
  };

  const handleRegister = (e) => {
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

    const isPreAuthorized =
      PRE_AUTHORIZED_EMAILS[detectedRole].includes(emailLower);
    if (!isPreAuthorized) {
      triggerToast(
        `Access Denied! ${emailLower} is not on the school's pre-authorized registry. Contact IT support.`,
        "error",
      );
      return;
    }

    if (registeredUsers.some((u) => u.email.toLowerCase() === emailLower)) {
      triggerToast(
        "An account with this email is already registered. Please log in instead.",
        "error",
      );
      setAuthMode("login");
      return;
    }

    // Phone Number Validation
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

    // Automatically format phone to +250... if missing international prefix
    const formattedPhone = cleanPhone.startsWith("+")
      ? cleanPhone
      : `+250${cleanPhone.replace(/^0+/, "")}`;

    const newUser = {
      email: emailLower,
      username: registerUsername.trim(),
      phone: formattedPhone,
      password: registerPassword,
      role: detectedRole,
    };

    persistUsers([...registeredUsers, newUser]);

    setRegisterEmail("");
    setRegisterUsername("");
    setRegisterPhone("");
    setRegisterPassword("");
    setRegisterConfirmPassword("");

    completeLogin(
      newUser,
      `Account created! Linked phone ${formattedPhone} for SMS alerts. Routed to ${detectedRole.toUpperCase()} page.`,
    );
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

    const isPreAuthorized =
      PRE_AUTHORIZED_EMAILS[detectedRole].includes(emailLower);
    const existingAccount = registeredUsers.find(
      (u) => u.email.toLowerCase() === emailLower,
    );

    if (!isPreAuthorized && !existingAccount) {
      triggerToast(
        "This email is not listed in the pre-authorized school directory.",
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
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-grow w-full">
        {activeTab === "home" && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <span className="bg-indigo-100 text-indigo-700 text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
                An ALU Software Engineering Project
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                Empowering Classrooms <br />
                <span className="text-indigo-600">
                  With or Without Connection
                </span>
              </h1>
              <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Welcome to the official School Portal for the Offline-First
                Learning Assistant. Sign up using your school-provided email to
                access textbooks, assignments, and quizzes locally on your
                browser.
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
                  Zero-Data Offline Study and Resource Access
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Download study materials or open quizzes while connected to
                  the school's internet, then review modules, notes,
                  announcements, and other resources offline.
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
                  Quizzes taken offline calculate score sheets immediately. Your
                  grades are securely queued in the browser's storage and
                  synchronized when internet is restored.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="bg-indigo-50 text-indigo-600 h-10 w-10 rounded-xl flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  Integrated SMS Carrier Gate
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Basic phone users receive critical coursework alerts,
                  deadlines, and grades pushed seamlessly using the Africa's
                  Talking API SMS system.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
            <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-md font-bold uppercase tracking-wider">
              Our Core Mission
            </span>
            <h2 className="text-3xl font-black text-slate-900 leading-none">
              About the Learning Assistant
            </h2>

            <p className="text-slate-600 leading-relaxed">
              In many rural or remote regions, educational content distribution
              is bottlenecked by weak cellular signals, spotty power grids, and
              expensive mobile internet tariffs.
            </p>

            <div className="border-l-4 border-indigo-500 pl-4 py-1 bg-slate-50 rounded-r-lg">
              <p className="text-sm font-semibold text-indigo-950 italic">
                Our mission is to establish permanent educational resilience by
                caching textbooks, PDFs, and evaluations inside the user's
                mobile device memory.
              </p>
            </div>

            <p className="text-slate-600 leading-relaxed">
              By packaging curriculum modules into compressed JSON study guides,
              students can download their work at school once and complete their
              quizzes back home in their villages. The system preserves
              localized database schemas in the browser to ensure data
              integrity, synchronizing scores directly to the central PostgreSQL
              cloud server using idempotent transaction verification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Offline Caching Mechanics
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Uses standard browser Cache APIs and persistent Service
                  Workers to load fully functional software applications
                  offline.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Stateless JWT Authentication
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Verifies student identities securely without requiring
                  real-time authentication server checks.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6 max-w-2xl mx-auto">
            <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-md font-bold uppercase tracking-wider">
              Support Desks
            </span>
            <h2 className="text-3xl font-black text-slate-900 leading-none">
              Connect With Our IT Desk
            </h2>

            <p className="text-slate-600 leading-relaxed">
              If you have any issues logging in or registering your
              school-issued email address, please contact your school's
              technical department.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-4">
              <Phone className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  SMS Gateway Integration Desk
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  No active internet? No problem. Send any text message query
                  starting with the keyword{" "}
                  <strong className="text-slate-900">"SUPPORT"</strong> to our
                  regional carrier number. Your ticket will be dispatched to our
                  database via the Africa's Talking SMS API.
                </p>
                <div className="bg-slate-900 text-white rounded-lg px-3 py-1.5 mt-3 text-xs font-mono inline-block">
                  Support SMS Code: +250 788 123 456
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="text-center md:text-left space-y-1">
            <p className="font-medium text-slate-300">
              &copy; {new Date().getFullYear()} Offline-First Learning
              Assistant. All rights reserved.
            </p>
            <p className="text-[10px] text-slate-500">
              Educational resource portal verified under school-authorized
              domains.
            </p>
          </div>

          <div className="flex gap-4 text-[11px] text-white">
            <button
              onClick={() => setActiveTab("home")}
              className="hover:text-indigo-400 transition"
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className="hover:text-indigo-400 transition"
            >
              Our Mission
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className="hover:text-indigo-400 transition"
            >
              Support Desk
            </button>
          </div>
        </div>
      </footer>

      {/* AUTHENTICATION MODAL */}
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

            {authMode === "register" && registerEmail && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  getRoleFromEmail(registerEmail)
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}
              >
                {getRoleFromEmail(registerEmail) ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>
                      Detected Domain:{" "}
                      <strong className="uppercase">
                        {getRoleFromEmail(registerEmail)}
                      </strong>
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>
                      Please enter a domain ending with @student.edu,
                      @teacher.edu, or @admin.edu
                    </span>
                  </>
                )}
              </div>
            )}

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
                      placeholder="e.g., natinael@student.edu"
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
                  <div className="flex justify-end">
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
                      placeholder=""
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
