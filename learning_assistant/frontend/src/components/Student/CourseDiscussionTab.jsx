import { Send } from "lucide-react";
export default function CourseDiscussionTab({
  handlePostComment,
  newCommentText,
  setNewCommentText,
  discussionsState,
  activeCourse,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <h3 className="font-bold text-base text-slate-900">
        Course Q&A Discussion Board
      </h3>

      {/* Comment Post Form */}
      <form onSubmit={handlePostComment} className="space-y-3">
        <textarea
          rows={3}
          placeholder="Ask Instructor Amina a question or comment on a topic..."
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md flex items-center gap-2"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Post Question</span>
        </button>
      </form>

      {/* Discussions Feed */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        {(
          discussionsState[activeCourse.id] ||
          activeCourse.discussions ||
          []
        ).map((disc) => (
          <div
            key={disc.id}
            className="p-4 border border-slate-200 rounded-xl space-y-2"
          >
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{disc.author}</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                  {disc.role}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{disc.date}</span>
                {disc.status === "pending_sync" && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    ⏳ Saved locally
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {disc.text}
            </p>

            {/* Replies */}
            {disc.replies &&
              disc.replies.map((reply, idx) => (
                <div
                  key={idx}
                  className="mt-3 pl-4 border-l-2 border-indigo-500 space-y-1 bg-slate-50 p-2.5 rounded-r-xl"
                >
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-indigo-900">
                      {reply.author} ({reply.role})
                    </span>
                    <span className="text-slate-400">{reply.date}</span>
                  </div>
                  <p className="text-xs text-slate-600">{reply.text}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
