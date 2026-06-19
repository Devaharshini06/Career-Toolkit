import { Shield, Sparkles, Compass } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-600/10 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-extrabold text-slate-950 text-lg tracking-tight">
                Career Survival Kit
              </span>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Land More Interviews. Not Just Better Resumes.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4">
          <div className="bg-slate-50 border border-slate-100 rounded-full px-3 py-1 flex items-center space-x-2 text-xs font-medium text-slate-600 hover:bg-slate-100/50 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Gemini Engine Engaged</span>
          </div>
        </div>
      </div>
    </header>
  );
}
