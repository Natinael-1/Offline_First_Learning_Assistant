import { useState } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  User,
  Search,
  WifiOff,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export default function TeacherQAQueueTab({
  activeCourse,
  isOnlineSimulated = true,
  onPostReply,
}) {
  const [filter, setFilter] = useState("all"); // 'all' | 'unanswered' | 'answered'
  const [searchQuery, setSearchQuery] = useState("");
  const [replyInputs, setReplyInputs] = useState({});

  // Real student questions live in course.discussions (same field
  // StudentPortal's Q&A tab posts into). No qaPosts fallback — that
  // shape (studentName/question/isAnswered) doesn't match discussions
  // (author/text/replies) and mixing them is exactly what crashed here.
  const questions = activeCourse?.discussions || [];

  const isAnswered = (item) => (item.replies?.length || 0) > 0;

  // Fixed: was reading q.question / q.studentName, which don't exist on
  // discussion objects (they have .text / .author instead) — calling
  // .toLowerCase() on the undefined .question was the crash.
  const filteredQuestions = questions.filter((q) => {
    const answered = isAnswered(q);
    const matchesFilter =
      filter === "all" ? true : filter === "unanswered" ? !answered : answered;

    const matchesSearch =
      (q.text || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.author || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unansweredCount = questions.filter((q) => !isAnswered(q)).length;

  const handleTextChange = (qId, value) => {
    setReplyInputs((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmitReply = (e, qId) => {
    e.preventDefault();
    const text = replyInputs[qId];
    if (!text || !text.trim()) return;

    if (typeof onPostReply === "function") {
      onPostReply(qId, text.trim());
    }

    setReplyInputs((prev) => ({ ...prev, [qId]: "" }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Q&A Discussion Hub
            </span>
            {!isOnlineSimulated && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <WifiOff className="h-3 w-3" /> Offline Mode (Replies Drafted)
              </span>
            )}
          </div>
          <h3 className="text-xl font-black">Student Discussion Queue</h3>
          <p className="text-xs text-slate-300 mt-1">
            Address student confusion, clarify course concepts, and post
            authoritative answers.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl">
          <HelpCircle className="h-6 w-6 text-indigo-400" />
          <div>
            <p className="text-lg font-black">{unansweredCount}</p>
            <p className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">
              Unanswered Posts
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Questions ({questions.length})
          </button>
          <button
            onClick={() => setFilter("unanswered")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filter === "unanswered"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Needs Answer ({unansweredCount})
          </button>
          <button
            onClick={() => setFilter("answered")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filter === "answered"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resolved
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions or students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">
            No questions found
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            There are no student questions matching your selected criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((item) => {
            const answered = isAnswered(item);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                {/* Question Header */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {item.author}
                      </p>
                      <p className="text-[10px] text-slate-400">{item.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === "pending_sync" && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Pending Sync
                      </span>
                    )}
                    {answered ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Answered
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Awaiting Answer
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Body */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    "{item.text}"
                  </p>
                </div>

                {/* Previous Replies */}
                {item.replies && item.replies.length > 0 && (
                  <div className="pl-4 border-l-2 border-indigo-200 space-y-3 my-2">
                    {item.replies.map((reply, idx) => (
                      <div
                        key={idx}
                        className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-indigo-600" />{" "}
                            {reply.author}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {reply.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-normal">
                          {reply.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input Box */}
                <form
                  onSubmit={(e) => handleSubmitReply(e, item.id)}
                  className="pt-2 flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Write an official answer or clarification..."
                    value={replyInputs[item.id] || ""}
                    onChange={(e) => handleTextChange(item.id, e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyInputs[item.id]?.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Reply</span>
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
