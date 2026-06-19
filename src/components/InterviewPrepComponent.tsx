import { useState } from "react";
import {
  HelpCircle,
  Lightbulb,
  Award,
  ChevronRight,
  Clipboard,
  Check,
  RotateCcw,
  BookOpen,
  Mic,
  MessageSquare,
  AlertCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { InterviewPrep, InterviewQuestion } from "../types";

interface InterviewPrepComponentProps {
  interviewPrep: InterviewPrep | undefined;
  resumeText: string;
  jobDescription: string;
}

export default function InterviewPrepComponent({
  interviewPrep,
  resumeText,
  jobDescription,
}: InterviewPrepComponentProps) {
  const [activeCategory, setActiveCategory] = useState<"resume" | "jd" | "behavioral">("resume");
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(null);

  // Simulation mode states
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeSimQuestion, setActiveSimQuestion] = useState<string>("");
  const [candidateResponse, setCandidateResponse] = useState<string>("");
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [evaluatingLoading, setEvaluatingLoading] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [copiedUpgrade, setCopiedUpgrade] = useState(false);

  if (!interviewPrep) return null;

  // Grouped question pointers
  const categories = {
    resume: {
      title: "Projects & Portfolio Questions",
      badge: "Resume Derived",
      list: interviewPrep.resumeBasedQuestions || [],
    },
    jd: {
      title: "Hard Technology & Core Competencies",
      badge: "JD Highlighted",
      list: interviewPrep.jdBasedQuestions || [],
    },
    behavioral: {
      title: "Situational & Corporate Culture",
      badge: "STAR Format",
      list: interviewPrep.behavioralQuestions || [],
    },
  };

  // Setup default/fallback lists
  const activeQuestionsList = categories[activeCategory].list;

  const launchSimulatorWithQuestion = (q: string) => {
    setActiveSimQuestion(q);
    setCandidateResponse("");
    setEvaluation(null);
    setEvaluationError(null);
    setIsSimulating(true);
  };

  // Submit response to `/api/grade-answer`
  const handleSubmitSimulation = async () => {
    if (!candidateResponse.trim()) {
      setEvaluationError("Please write something so the AI coach can calibrate your structural STAR points.");
      return;
    }

    setEvaluatingLoading(true);
    setEvaluationError(null);
    setEvaluation(null);

    try {
      const res = await fetch("/api/grade-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: activeSimQuestion,
          answerText: candidateResponse,
          resumeText,
          jobDescription,
        }),
      });

      if (!res.ok) {
        throw new Error("Evaluation server failed to assess response.");
      }

      const result = await res.json();
      setEvaluation(result);
    } catch (err: any) {
      console.error(err);
      setEvaluationError(err.message || "Something went wrong scoring your response. Please try again.");
    } finally {
      setEvaluatingLoading(false);
    }
  };

  const handleCopyUpgradeText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpgrade(true);
    setTimeout(() => setCopiedUpgrade(false), 2000);
  };

  return (
    <div id="interview-prep-module" className="space-y-8">
      {/* Simulation banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-850 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 opacity-10">
          <BookOpen className="h-64 w-64" />
        </div>

        <div className="space-y-2 max-w-2xl relative z-10">
          <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            Phase 2 Upgrade Active
          </span>
          <h4 className="font-display font-extrabold text-xl md:text-2xl tracking-tight leading-none text-white">
            Interactive AI Interview Simulator
          </h4>
          <p className="text-xs text-indigo-200 leading-relaxed max-w-md">
            Test yourself under fire! Type your responses to potential interview questions and let Gemini grade your structural delivery based on real recruiter standards.
          </p>
        </div>

        {!isSimulating ? (
          <button
            onClick={() => {
              // Preload the first question
              const firstQ =
                interviewPrep.resumeBasedQuestions?.[0]?.question ||
                interviewPrep.jdBasedQuestions?.[0]?.question ||
                "Tell me about a challenging technical project you worked on and how you resolved issues.";
              launchSimulatorWithQuestion(firstQ);
            }}
            className="px-5 py-3 bg-white hover:bg-indigo-50 text-indigo-950 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 shrink-0 group hover:pr-4"
          >
            <Mic className="h-4 w-4 text-indigo-600 animate-pulse" />
            <span>Launch Mock Simulator</span>
            <ChevronRight className="h-4 w-4 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <button
            onClick={() => setIsSimulating(false)}
            className="px-4 py-2.5 bg-indigo-800 hover:bg-indigo-700 text-indigo-100/90 text-xs font-bold rounded-xl transition-all border border-indigo-700 active:scale-95 shrink-0"
          >
            Exit Simulation Sandbox
          </button>
        )}
      </div>

      {isSimulating && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <h5 className="font-display font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-600 p-1 rounded-lg">
                <MessageSquare className="h-4 w-4" />
              </span>
              <span>Active Question Sandbox</span>
            </h5>
            <span className="text-[10px] font-mono text-slate-400">
              Evaluates metric inclusion, clarity, &amp; action verbs
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              The Interviewer Asks:
            </span>
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              &ldquo;{activeSimQuestion}&rdquo;
            </p>
          </div>

          {!evaluation ? (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-600">
                Your Answer Response:
              </label>
              <textarea
                value={candidateResponse}
                onChange={(e) => {
                  setCandidateResponse(e.target.value);
                  if (evaluationError) setEvaluationError(null);
                }}
                disabled={evaluatingLoading}
                placeholder="Draft your answer here. Try to use structure: state the Situation/Task, the direct Actions you took, and the measured Results (STAR method)."
                className="w-full h-36 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-xs text-slate-800 placeholder-slate-400 transition-all font-mono"
              />

              {evaluationError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{evaluationError}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setIsSimulating(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitSimulation}
                  disabled={evaluatingLoading}
                  className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  {evaluatingLoading ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>AI Reviewing STAR Metrics...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Response &amp; Get Grade</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Calibration Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-5">
                <div className="flex flex-col items-center justify-center text-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm md:col-span-1">
                  <span className="text-3xl font-extrabold text-indigo-600 font-display">
                    {evaluation.score}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Score / 100
                  </span>
                  <div className="mt-2 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {evaluation.score >= 80 ? "Hire Status" : evaluation.score >= 60 ? "Strong Fit" : "Needs Practice"}
                  </div>
                </div>

                <div className="md:col-span-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    STAR Structural Evaluation
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {evaluation.starsAssessment}
                  </p>
                </div>
              </div>

              {/* Strengths & Gaps detail boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    What You Addressed Exceptionally Well
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {evaluation.strengths}
                  </p>
                </div>

                <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                    Missing details or structure weaknesses
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {evaluation.gaps}
                  </p>
                </div>
              </div>

              {/* Tips for structure improvement */}
              <div className="p-4 bg-amber-50/30 border border-amber-100 rounded-xl space-y-2">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Technical / Framing Advice to Boost Score
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {evaluation.howToImprove}
                </p>
              </div>

              {/* Improved phrase template */}
              <div className="bg-indigo-50/30 border border-indigo-150 rounded-xl p-4 relative">
                <span className="text-xs font-bold text-indigo-900 block mb-2">
                  Adaptable Exemplary Response Draft (Recommended phrasing)
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed font-mono whitespace-pre-wrap pr-8">
                  &ldquo;{evaluation.improvedPhrase}&rdquo;
                </p>
                <button
                  onClick={() => handleCopyUpgradeText(evaluation.improvedPhrase)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-indigo-600 p-1.5 bg-white rounded-lg border border-slate-100 transition-all cursor-pointer"
                  title="Copy improved template"
                >
                  {copiedUpgrade ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="flex border-t border-slate-100 pt-4 items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setEvaluation(null);
                    setCandidateResponse("");
                  }}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Try Question Again</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Grab a random question from existing ones pool
                      const allQs = [
                        ...(interviewPrep.resumeBasedQuestions || []),
                        ...(interviewPrep.jdBasedQuestions || []),
                        ...(interviewPrep.behavioralQuestions || []),
                      ];
                      if (allQs.length > 0) {
                        const randomQ = allQs[Math.floor(Math.random() * allQs.length)].question;
                        launchSimulatorWithQuestion(randomQ);
                      }
                    }}
                    className="px-4 py-2 bg-slate-900 text-white hover:bg-indigo-600 text-xs font-bold rounded-lg transition-colors"
                  >
                    Load Random Question
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 columns: Categorized list of questions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-3">
            <h5 className="font-display font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-indigo-600" />
              <span>Personalized Preparation Database</span>
            </h5>

            {/* Tab Swappers */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => {
                  setActiveCategory("resume");
                  setExpandedQuestionIdx(null);
                }}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                  activeCategory === "resume"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Resume Based
              </button>
              <button
                onClick={() => {
                  setActiveCategory("jd");
                  setExpandedQuestionIdx(null);
                }}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                  activeCategory === "jd"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                JD Alignment
              </button>
              <button
                onClick={() => {
                  setActiveCategory("behavioral");
                  setExpandedQuestionIdx(null);
                }}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                  activeCategory === "behavioral"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Behavioral / HR
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Below are targeted predictions of what interviewers will ask you specifically. Select any query to review an optimized response model, or send it to the simulator widget above.
          </p>

          <div className="space-y-3">
            {activeQuestionsList.map((q, idx) => {
              const isExpanded = expandedQuestionIdx === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 bg-white rounded-xl overflow-hidden transition-all hover:border-slate-300"
                >
                  <div
                    onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                    className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/50"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold tracking-wider font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">
                          {categories[activeCategory].badge} Q{idx + 1}
                        </span>
                      </div>
                      <h6 className="text-[12.5px] font-bold tracking-tight text-slate-800 leading-relaxed">
                        {q.question}
                      </h6>
                    </div>
                    <span className="text-xs text-indigo-600 font-bold shrink-0 mt-0.5">
                      {isExpanded ? "Collapse" : "Reveal Answer"}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-slate-50/55 border-t border-slate-100 space-y-4">
                      {/* Guides */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Response Strategy &amp; Bullet points
                        </span>
                        <div className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-200 rounded-lg p-3 whitespace-pre-wrap font-normal">
                          {q.idealAnswerOutline}
                        </div>
                      </div>

                      <div className="flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            launchSimulatorWithQuestion(q.question);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all"
                        >
                          <Mic className="h-3.5 w-3.5" />
                          <span>Try in Mock Simulator</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Prep focus syllabus list */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h5 className="font-display font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg">
                <BookOpen className="h-4 w-4" />
              </span>
              <span>Topics &amp; Syllabus Focus</span>
            </h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review and brush up on these absolute essential skills and parameters prior to the scheduling date:
            </p>
            <div className="space-y-2">
              {interviewPrep.focusAreas?.map((area, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
