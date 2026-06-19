import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";

interface AtsScoreCardProps {
  score: number;
  matchPercentage: number;
  strengths: string[];
  weaknesses: string[];
}

export default function AtsScoreCard({
  score,
  matchPercentage,
  strengths,
  weaknesses,
}: AtsScoreCardProps) {
  // Determine color and status message based on ATS score
  let statusText = "Needs Refinement";
  let statusColorClass = "text-amber-600 bg-amber-50 border-amber-100";
  let ringColor = "stroke-amber-500";

  if (score >= 80) {
    statusText = "Excellent Alignment";
    statusColorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
    ringColor = "stroke-emerald-500";
  } else if (score >= 60) {
    statusText = "Competitive Match";
    statusColorClass = "text-indigo-600 bg-indigo-50 border-indigo-100";
    ringColor = "stroke-indigo-500";
  } else {
    statusText = "High Risk of Filter";
    statusColorClass = "text-rose-600 bg-rose-50 border-rose-100";
    ringColor = "stroke-rose-500";
  }

  // Calculate radial offset for SVG progress ring (radius=40, circumference=251.2)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div id="ats-score-module" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visual Circle Gauge Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColorClass}`}>
            {statusText}
          </span>
        </div>

        <h4 className="text-sm font-semibold tracking-tight text-slate-500 mb-6 font-display self-start">
          ATS Relevance Calibration
        </h4>

        <div className="relative flex items-center justify-center h-36 w-36 mb-4">
          {/* Radial Progress Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-slate-100 fill-none"
              strokeWidth="10"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              className={`${ringColor} fill-none transition-all duration-1000 ease-out`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-display">
              {score}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Score
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 max-w-xs mb-1">
          Role Alignment index is at <strong className="text-slate-800">{matchPercentage}%</strong> based on job keyword matches.
        </p>
        <span className="text-[10px] text-slate-400 font-mono">Recommended Score Target: 80+</span>
      </div>

      {/* Strengths Side */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col">
        <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
          <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <h4 className="font-display font-bold text-slate-900 text-sm tracking-tight">
            Resume Strengths ({strengths.length})
          </h4>
        </div>
        <ul className="space-y-3.5 flex-1">
          {strengths.map((strength, index) => (
            <li key={index} className="flex items-start text-xs text-slate-600 leading-relaxed gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weaknesses Side */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col">
        <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
          <div className="bg-rose-50 text-rose-600 p-1.5 rounded-lg">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
          <h4 className="font-display font-bold text-slate-900 text-sm tracking-tight">
            Identified Vulnerabilities ({weaknesses.length})
          </h4>
        </div>
        <ul className="space-y-3.5 flex-1">
          {weaknesses.map((weakness, index) => (
            <li key={index} className="flex items-start text-xs text-slate-600 leading-relaxed gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{weakness}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
