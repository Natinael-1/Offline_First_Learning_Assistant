import { useState } from "react";



import {
  Smartphone,
  CreditCard,
  Radio,
  Send,
  CheckCircle2,
  Plus,
  Zap,
  History,
  Info,
  Calculator,
  Wifi,
  WifiOff,
  Check,
  Server,
  AlertTriangle,
} from "lucide-react";

/**
 
 *
 * @param {Object} smsGateway - Gateway state object containing balance, config, and logs
 * @param {number} studentCount - Total count of enrolled students for estimations
 * @param {boolean} isOnlineSimulated - Connectivity indicator
 * @param {Function} onTopUpCredits - Callback (credits) => void to add units
 */
export default function AdminSMSGatewayTab({
  smsGateway = {
    creditBalance: 1450,
    apiKeyStatus: "active",
    apiUsername: "edusync_rwanda_prod",
    senderId: "EDUSYNC",
    totalDispatchedCount: 184,
    lastDispatchTimestamp: "Jul 26, 2026 14:20 CAT",
    dispatchHistory: [],
  },
  studentCount = 28,
  isOnlineSimulated = true,
  onTopUpCredits,
}) {
  const [topUpAmount, setTopUpAmount] = useState(500);
  const [isTopUpSuccess, setIsTopUpSuccess] = useState(false);

  // Estimator State
  const [estimatorCharCount, setEstimatorCharCount] = useState(140);
  const [estimatorRecipients, setEstimatorRecipients] = useState(
    studentCount || 28,
  );

  // Africa's Talking standard: 160 chars = 1 segment; 153 chars for multi-part concatenated SMS
  const segmentsPerMessage =
    estimatorCharCount <= 160 ? 1 : Math.ceil(estimatorCharCount / 153);
  const totalCreditsNeeded = estimatorRecipients * segmentsPerMessage;
  const canAffordEstimate =
    (smsGateway?.creditBalance || 0) >= totalCreditsNeeded;

  const handleExecuteTopUp = (e) => {
    e.preventDefault();
    if (topUpAmount <= 0) return;

    if (onTopUpCredits) {
      onTopUpCredits(Number(topUpAmount));
    }

    setIsTopUpSuccess(true);
    setTimeout(() => setIsTopUpSuccess(false), 3000);
  };

  const dispatchHistory = smsGateway?.dispatchHistory || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-400/30">
                Cellular Telemetry Hub
              </span>
              <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-purple-400" />
                <span>Africa's Talking Gateway API</span>
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              SMS Carrier Broadcast & Credit Control
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Route critical academic notices and exam reminders directly to
              student feature phones via GSM cell towers.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <div
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                isOnlineSimulated
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
              }`}
            >
              {isOnlineSimulated ? (
                <Wifi className="h-4 w-4 text-emerald-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-amber-400" />
              )}
              <span>
                {isOnlineSimulated
                  ? "Carrier Gateway Active"
                  : "Carrier Offline (Queued)"}
              </span>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Credit Balance */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-1 relative overflow-hidden">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>SMS Wallet Balance</span>
              <Smartphone className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white pt-1">
              {smsGateway?.creditBalance || 0}{" "}
              <span className="text-xs text-purple-300 font-semibold">
                Units
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Approx.{" "}
              <strong className="text-slate-200">
                {Math.floor(
                  (smsGateway?.creditBalance || 0) / (studentCount || 28),
                )}
              </strong>{" "}
              full-roster broadcasts
            </p>
          </div>

          {/* Card 2: API Credentials & Sender ID */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-1">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Shortcode / Sender ID</span>
              <Radio className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white pt-1">
              {smsGateway?.senderId || "EDUSYNC"}
            </div>
            <p className="text-[10px] text-slate-400">
              API User:{" "}
              <span className="font-mono text-indigo-300">
                {smsGateway?.apiUsername}
              </span>
            </p>
          </div>

          {/* Card 3: Total Transmissions */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-1">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Dispatched Texts</span>
              <Send className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white pt-1">
              {smsGateway?.totalDispatchedCount || 0}
            </div>
            <p className="text-[10px] text-slate-400">
              Last dispatch: {smsGateway?.lastDispatchTimestamp || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sub-Card A: Credit Top-Up Interface */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Top Up Carrier SMS Credits
                </h3>
                <p className="text-xs text-slate-500">
                  Purchase units for Africa's Talking API wallet.
                </p>
              </div>
            </div>
          </div>

          {isTopUpSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Successfully added +{topUpAmount} SMS credits to API balance!
              </span>
            </div>
          )}

          <form onSubmit={handleExecuteTopUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Quick Select Preset Amount:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[250, 500, 1000, 2500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTopUpAmount(preset)}
                    className={`py-2 rounded-xl text-xs font-extrabold transition border ${
                      topUpAmount === preset
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Custom Credit Quantity:
              </label>
              <div className="relative">
                <Zap className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={topUpAmount}
                  onChange={(e) =>
                    setTopUpAmount(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none transition"
                  placeholder="Enter custom units"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Authorize & Top Up +{topUpAmount} Credits</span>
            </button>
          </form>
        </div>

        {}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Broadcast Credit Calculator
                </h3>
                <p className="text-xs text-slate-500">
                  Estimate segment cost before sending notices.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Character Length Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Message Character Count:</span>
                <span className="text-indigo-600 font-extrabold">
                  {estimatorCharCount} Chars
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="480"
                value={estimatorCharCount}
                onChange={(e) =>
                  setEstimatorCharCount(parseInt(e.target.value))
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>160 (1 Segment)</span>
                <span>306 (2 Segments)</span>
                <span>459 (3 Segments)</span>
              </div>
            </div>

            {/* Recipient Count Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Target Recipient Count:
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={estimatorRecipients}
                onChange={(e) =>
                  setEstimatorRecipients(
                    Math.max(1, parseInt(e.target.value) || 1),
                  )
                }
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Calculation Output Box */}
            <div
              className={`p-4 rounded-2xl border space-y-2 transition ${
                canAffordEstimate
                  ? "bg-indigo-50/70 border-indigo-200"
                  : "bg-rose-50/70 border-rose-200"
              }`}
            >
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700">Total Credits Required:</span>
                <span
                  className={`text-base font-black ${canAffordEstimate ? "text-indigo-700" : "text-rose-700"}`}
                >
                  {totalCreditsNeeded} Credits
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>
                  {estimatorRecipients} recipients &times; {segmentsPerMessage}{" "}
                  SMS segment{segmentsPerMessage > 1 ? "s" : ""} per user.
                </span>
              </div>

              {!canAffordEstimate && (
                <div className="text-[11px] font-bold text-rose-700 flex items-center gap-1 pt-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    Insufficient balance! Short by{" "}
                    {totalCreditsNeeded - (smsGateway?.creditBalance || 0)}{" "}
                    credits.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-purple-600" />
            <h3 className="font-black text-slate-900 text-base">
              Historical SMS Transmission Logs
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
            {dispatchHistory.length} Recorded Dispatches
          </span>
        </div>

        {dispatchHistory.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
            <Info className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              No broadcast dispatches logged yet.
            </p>
            <p className="text-[11px] text-slate-400">
              When instructors trigger cellular alerts from the Announcements
              tab, delivery metrics will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Broadcast Title / Course</th>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4 text-center">Recipients</th>
                  <th className="py-3 px-4 text-center">Segments</th>
                  <th className="py-3 px-4 text-center">Credits Used</th>
                  <th className="py-3 px-4 text-right">Status & Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {dispatchHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-indigo-600 font-semibold">
                        {item.courseTitle}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.sender}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {item.recipientCount} Users
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {item.segmentsPerMsg} SMS / Person
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-black text-purple-700">
                      -{item.totalCreditsDeducted}
                    </td>

                    <td className="py-3.5 px-4 text-right space-y-0.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>Delivered</span>
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {item.timestamp}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
