import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, CheckCircle2, X } from "lucide-react";

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("Service Worker Registered successfully:", r);
    },
    onRegisterError(error) {
      console.error("Service Worker registration error:", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[200] max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-bounce">
      <div className="flex items-center gap-2.5 text-xs">
        {offlineReady ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
        ) : (
          <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin shrink-0" />
        )}
        <div>
          <p className="font-bold text-slate-100">
            {offlineReady
              ? "App Ready for Offline Use"
              : "New School Portal Update Available!"}
          </p>
          <p className="text-[10px] text-slate-400">
            {offlineReady
              ? "All pages cached locally."
              : "Click reload to update your device."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-md"
          >
            Reload
          </button>
        )}
        <button
          onClick={close}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
