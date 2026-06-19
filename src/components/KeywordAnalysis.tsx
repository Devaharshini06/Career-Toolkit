import { CheckCircle, AlertOctagon, HelpCircle } from "lucide-react";
import { KeywordGroup } from "../types";

interface KeywordAnalysisProps {
  keywords: KeywordGroup;
}

export default function KeywordAnalysis({ keywords }: KeywordAnalysisProps) {
  // Safe default initializations in case of missing keys
  const matched = keywords?.matched || [];
  const missing = keywords?.missing || [];
  const priority = keywords?.priority || [];

  return (
    <div id="keyword-analysis-module" className="space-y-6">
      {/* Alert Header for Critical Gaps */}
      {priority.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3.5">
          <AlertOctagon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-amber-900 tracking-wide font-display">
              Urgent Keyword Mismatch Alert
            </h5>
            <p className="text-xs text-amber-700/90 leading-relaxed">
              Your resume currently lacks references to these vital tools or domains. ATS screeners actively scan for these to determine matching score thresholds. Adding these will yield the largest score increase.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical Priority Missing */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-300">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-100">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
              <h4 className="font-display font-bold text-slate-900 text-sm tracking-tight">
                Critical Priority Gaps
              </h4>
            </div>
            <span className="text-[10px] font-mono bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
              High Impact
            </span>
          </div>

          {priority.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No critical priority gaps detected.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {priority.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-150 border border-rose-100 text-rose-700 cursor-default transition-all"
                >
                  <AlertOctagon className="h-3 w-3 text-rose-500" />
                  <span>{keyword}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Missing Keywords */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-300">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-100">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <h4 className="font-display font-bold text-slate-900 text-sm tracking-tight">
                Missing Requirements
              </h4>
            </div>
            <span className="text-[10px] font-mono bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">
              Missing ({missing.length})
            </span>
          </div>

          {missing.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Excellent! No other standard requirements are missing.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missing.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50/50 hover:bg-amber-100 border border-amber-100/70 text-amber-800/90 cursor-default transition-all"
                >
                  <HelpCircle className="h-3 w-3 text-amber-500" />
                  <span>{keyword}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Matched Keywords */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-300">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-100">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="font-display font-bold text-slate-900 text-sm tracking-tight">
                Covered Skills &amp; Keywords
              </h4>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
              Matched ({matched.length})
            </span>
          </div>

          {matched.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No keyword overlap scanned. Make sure the resume text lists relevant skills.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {matched.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 cursor-default transition-all"
                >
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  <span>{keyword}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
