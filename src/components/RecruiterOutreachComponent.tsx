import { useState } from "react";
import { Mail, Linkedin, Users, Clipboard, Check, Send, ShieldPlus } from "lucide-react";
import { RecruiterOutreach } from "../types";

interface RecruiterOutreachComponentProps {
  outreach: RecruiterOutreach | undefined;
}

export default function RecruiterOutreachComponent({ outreach }: RecruiterOutreachComponentProps) {
  const [activeTab, setActiveTab] = useState<"email" | "linkedin" | "referral">("email");
  const [copiedState, setCopiedState] = useState(false);

  if (!outreach) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div id="recruiter-outreach-module" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Menu / Description Panel */}
      <div className="space-y-4">
        <h4 className="font-display font-bold text-slate-950 text-base tracking-tight">
          Recruiter Outreach Strategy
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Landing modern interviews requires direct connection efforts. Send these personalized, high-open-rate communication templates directly to recruitment leaders or employees on LinkedIn.
        </p>

        <div className="flex flex-col gap-2 pt-2">
          {/* Email Tab Button */}
          <button
            onClick={() => {
              setActiveTab("email");
              setCopiedState(false);
            }}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
              activeTab === "email"
                ? "bg-indigo-50 border-indigo-250 text-indigo-950 font-bold shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className={`p-2 rounded-lg ${activeTab === "email" ? "bg-indigo-600 text-white" : "bg-slate-100/80 text-slate-500"}`}>
              <Mail className="h-4 w-4" />
            </span>
            <div className="space-y-0.5">
              <span className="text-xs block">Official Cold Email</span>
              <span className="text-[10px] text-slate-400 font-normal">Highly personalized core cover pitch</span>
            </div>
          </button>

          {/* LinkedIn Connection Pitch */}
          <button
            onClick={() => {
              setActiveTab("linkedin");
              setCopiedState(false);
            }}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
              activeTab === "linkedin"
                ? "bg-indigo-50 border-indigo-250 text-indigo-950 font-bold shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className={`p-2 rounded-lg ${activeTab === "linkedin" ? "bg-indigo-600 text-white" : "bg-slate-100/80 text-slate-500"}`}>
              <Linkedin className="h-4 w-4" />
            </span>
            <div className="space-y-0.5">
              <span className="text-xs block">LinkedIn message (300 char)</span>
              <span className="text-[10px] text-slate-400 font-normal">Brief invite pitch template</span>
            </div>
          </button>

          {/* Employee Referral */}
          <button
            onClick={() => {
              setActiveTab("referral");
              setCopiedState(false);
            }}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
              activeTab === "referral"
                ? "bg-indigo-50 border-indigo-250 text-indigo-950 font-bold shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className={`p-2 rounded-lg ${activeTab === "referral" ? "bg-indigo-600 text-white" : "bg-slate-100/80 text-slate-500"}`}>
              <Users className="h-4 w-4" />
            </span>
            <div className="space-y-0.5">
              <span className="text-xs block">Internal Referral Invite</span>
              <span className="text-[10px] text-slate-400 font-normal">Informational coffee chat ask</span>
            </div>
          </button>
        </div>

        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 mt-6">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
            Recruiter Insider Tip:
          </span>
          <p className="text-[11px] text-amber-700 leading-relaxed font-normal">
            For cold messages, replace standard bracket markers like <strong className="text-amber-900 font-semibold">[Company]</strong> or <strong className="text-amber-900 font-semibold">[Name]</strong> with genuine research snippets to increase reply rates by up to 3x.
          </p>
        </div>
      </div>

      {/* Right Content display Panel */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm min-h-64 flex flex-col justify-between relative overflow-hidden">
          {/* Active Content rendering */}
          {activeTab === "email" && (
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between pb-3 border-b border-rose-50 flex-wrap gap-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  Recommended to send via Gmail to hiring managers
                </span>
                <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100">
                  Target: Hiring Manager
                </span>
              </div>

              {/* Subject box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Subject Line Idea:
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {outreach.coldEmail?.subject || "Polite Inquiry - Interested in Job Role"}
                </p>
              </div>

              {/* Message body */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Email Body:
                </label>
                <p className="text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap bg-slate-50/20 p-4 border border-slate-100 rounded-lg max-h-96 overflow-y-auto">
                  {outreach.coldEmail?.body}
                </p>
              </div>
            </div>
          )}

          {activeTab === "linkedin" && (
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-50 flex-wrap gap-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  Use for LinkedIn "Add a note" connection message
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                  Character Limit: 300 Max
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pitch Text:
                </label>
                <p className="text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap bg-slate-50/20 p-4 border border-slate-100 rounded-lg">
                  {outreach.linkedInMessage}
                </p>
                <div className="flex justify-end text-[10px] text-slate-400 font-mono">
                  Length: {outreach.linkedInMessage?.length || 0} characters
                </div>
              </div>
            </div>
          )}

          {activeTab === "referral" && (
            <div className="space-y-4 flex-1">
              <div className="flex items-between justify-between pb-3 border-b border-emerald-50 flex-wrap gap-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  Request an internal informational interview coffee chat
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                  Target: Current Software Engineer/Employee
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Proposal Body:
                </label>
                <p className="text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap bg-slate-50/20 p-4 border border-slate-100 rounded-lg">
                  {outreach.referralRequest}
                </p>
              </div>
            </div>
          )}

          {/* Clipboard triggers */}
          <div className="border-t border-slate-100 mt-6 pt-4 flex items-center justify-end">
            <button
              onClick={() => {
                let textToCopy = "";
                if (activeTab === "email") {
                  textToCopy = `Subject: ${outreach.coldEmail?.subject}\n\n${outreach.coldEmail?.body}`;
                } else if (activeTab === "linkedin") {
                  textToCopy = outreach.linkedInMessage;
                } else {
                  textToCopy = outreach.referralRequest;
                }
                handleCopy(textToCopy);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-indigo-650 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
            >
              {copiedState ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Outreach Template Copied!</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-4 w-4" />
                  <span>Copy Complete Draft</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
