export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 w-full mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        <div className="text-center md:text-left space-y-1">
          <p className="font-medium text-slate-300 ">
            &copy; {new Date().getFullYear()} Offline-First Learning Assistant.
          </p>
        </div>
      </div>
    </footer>
  );
}
