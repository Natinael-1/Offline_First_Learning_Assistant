import { useState, useEffect, useRef } from "react";

/*
CheckCircle2,
Sparkles,
*/
import {
  Radio,
  Send,
  MessageSquare,
  Phone,
  Clock,
  AlertCircle,
  Smartphone,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

/**
 
 * @param {Object} activeCourse - Active course object containing announcements array
 * @param {boolean} isOnlineSimulated - Network connection status indicator
 * @param {Function} onPostAnnouncement - Callback (noticeObject, sendSMS) => void
 */
export default function TeacherAnnouncementsTab({
  activeCourse,
  isOnlineSimulated = true,
  onPostAnnouncement,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sendSMS, setSendSMS] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const postTimerRef = useRef(null);

  // Cancel any in-flight "post" simulation if this tab unmounts before
  // the 400ms delay finishes (e.g. teacher switches tabs or courses)
  useEffect(() => {
    return () => {
      if (postTimerRef.current) clearTimeout(postTimerRef.current);
    };
  }, []);

  const announcementsList = activeCourse?.announcements || [];
  // Fixed: nullish coalescing so a genuine 0-enrollment course displays
  // as 0, not a hardcoded 28.
  const enrolledCount = activeCourse?.enrolledStudents ?? 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeCourse || isPosting) return;
    if (!title.trim() || !content.trim()) return;

    setIsPosting(true);

    const now = new Date();
    const formattedDate = now.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newNotice = {
      id: `ann_${activeCourse.id}_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      date: formattedDate,
      // smsRequested records what the teacher actually asked for, independent
      // of whether it could be carried out immediately. sentViaSMS records
      // the outcome so far. Without smsRequested, an offline SMS request was
      // indistinguishable from "never asked for SMS" once created.
      smsRequested: sendSMS,
      sentViaSMS: sendSMS && isOnlineSimulated,
      status: isOnlineSimulated ? "synced" : "pending_sync",
    };

    postTimerRef.current = setTimeout(() => {
      if (typeof onPostAnnouncement === "function") {
        onPostAnnouncement(newNotice, sendSMS && isOnlineSimulated);
      }
      setTitle("");
      setContent("");
      setIsPosting(false);
      postTimerRef.current = null;
    }, 400);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: ANNOUNCEMENT & SMS BROADCAST COMPOSER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Course Announcements & SMS Broadcast
              </h3>
              <p className="text-xs text-slate-500">
                Post digital notices to student dashboards and push text alerts
                to basic phones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-200 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
              <span>Africa's Talking Gateway</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
              Notice Headline / Subject:
            </label>
            <input
              type="text"
              placeholder="e.g. Midterm Exam Postponed / New Study Pack Available"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-indigo-600" />
                Notice Message Text:
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {content.length} characters (160 chars per SMS segment)
              </span>
            </label>
            <textarea
              rows={4}
              placeholder="Type your notice here. Keep text concise if dispatching as SMS broadcast..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            />
          </div>

          <div
            className={`p-4 rounded-2xl border transition ${
              sendSMS
                ? "bg-indigo-50/60 border-indigo-300"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendSMS}
                onChange={(e) => setSendSMS(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-900">
                    Dispatch Instant Cellular SMS Broadcast
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                    Feature Phone Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Transmits text messages directly to registered mobile phone
                  numbers via cellular base stations using Africa's Talking API.
                </p>
                {sendSMS && (
                  <div className="pt-1.5 flex flex-wrap items-center gap-4 text-[11px] text-indigo-900 font-semibold">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-indigo-600" />
                      Target Recipients:{" "}
                      <strong>{enrolledCount} Students</strong>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-indigo-600" />
                      Est. Segments:{" "}
                      <strong>
                        {Math.ceil(content.length / 160) || 1} SMS / User
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </label>
          </div>

          {!isOnlineSimulated && sendSMS && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-medium">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                Offline Mode: Notice will save locally as a draft. SMS broadcast
                will execute automatically once reconnected.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              {isOnlineSimulated ? (
                <span className="flex items-center gap-1 text-emerald-700">
                  <Wifi className="h-3.5 w-3.5" /> Gateway Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-700">
                  <WifiOff className="h-3.5 w-3.5" /> Offline Draft Mode
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isPosting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isPosting ? (
                <span>Publishing Broadcast...</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>
                    {sendSMS
                      ? "Post Notice & Trigger SMS"
                      : "Post Web Announcement"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SENT ANNOUNCEMENTS HISTORY FEED */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-slate-900 text-base">
              Sent Course Notices ({announcementsList.length})
            </h3>
            <p className="text-xs text-slate-500">
              History of broadcasts pushed to web dashboards and basic feature
              phones.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            {announcementsList.length} Announcements
          </span>
        </div>

        {announcementsList.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
            <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              No announcements broadcasted yet.
            </p>
            <p className="text-[11px] text-slate-400">
              Use the composer form above to send your first course notice.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcementsList.map((ann) => {
              // Fixed: distinguish "confirmed sent," "queued to send once
              // reconnected," and "never requested" instead of collapsing
              // the offline-but-requested case into "Web Portal Only."
              const smsBadge = ann.sentViaSMS ? (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Smartphone className="h-3 w-3 text-emerald-600" />
                  <span>SMS Sent</span>
                </span>
              ) : ann.smsRequested ? (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Smartphone className="h-3 w-3 text-amber-600" />
                  <span>SMS Queued</span>
                </span>
              ) : (
                <span className="bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                  Web Portal Only
                </span>
              );

              return (
                <div
                  key={ann.id}
                  className="p-5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2 hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-indigo-600 shrink-0" />
                      <h4 className="font-bold text-slate-900 text-xs">
                        {ann.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3 w-3" />
                        {ann.date}
                      </span>

                      {smsBadge}

                      {ann.status === "pending_sync" && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-md">
                          ⏳ Pending Sync
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed pt-1">
                    {ann.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
