import { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  Upload,
  FileText,
  Briefcase,
  Play,
  CheckCircle,
  AlertOctagon,
  Award,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  Lock,
  ChevronRight,
  UserCheck,
  Zap,
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AtsScoreCard from "./components/AtsScoreCard";
import KeywordAnalysis from "./components/KeywordAnalysis";
import ResumeOptimizerComponent from "./components/ResumeOptimizerComponent";
import InterviewPrepComponent from "./components/InterviewPrepComponent";
import RecruiterOutreachComponent from "./components/RecruiterOutreachComponent";
import AiCareerCoachComponent from "./components/AiCareerCoachComponent";
import { SurvivalKit } from "./types";

// High-fidelity pre-fill profile data for seamless evaluation & onboarding
const SAMPLE_RESUME = `ALEX CHEN
San Francisco, CA | alexchen@example.com | (555) 019-2834 | github.com/alexchen

SUMMARY
Passionate Entry-Level Software Engineer with academic and internship experience building robust full-stack web applications. Skilled in React, TypeScript, Node.js, and SQL databases. Strong collaborator with a focus on writing clean, scalable, and optimized code.

TECHNICAL SKILLS
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, SQL (PostgreSQL), Python
- Frameworks & Libraries: React, Node.js, Express, Tailwind CSS, Bootstrap, Redux Toolkit
- Developer Tools: Git, GitHub, VS Code, Postman, Docker, Heroku, Vercel, Vite

PROFESSIONAL EXPERIENCE
Software Engineering Intern | TechNova Solutions
June 2025 - August 2025 (San Francisco, CA)
- Assisted in building a client-facing web portal using React and Tailwind CSS.
- Participated in weekly standups and contributed to code reviews with senior engineering team members.
- Wrote basic unit tests using Jest to ensure UI components met requirements.
- Helped migrate legacy CSS files to Tailwind CSS, improving layout responsiveness.

PERSONAL PROJECTS
E-Commerce Bookstore | React, Node.js, Express, PostgreSQL
- Built a web page that allows users to search, browse, and purchase book catalogs online.
- Developed the frontend with responsive cards using React hooks and global Context API state management.
- Implemented basic backend security and REST APIs to fetch inventory counts from a PostgreSQL database server.

Task Planner Mobile App | React Native, Firebase
- Created a workflow task planner app that lets students schedule assignments and setup calendar notifications.
- Integrated simple authentication and data persistence storage using standard Firestore bindings.`;

const SAMPLE_JD = `Title: Junior Full-Stack Software Engineer
Company: CloudScale Systems
Location: San Francisco, CA (Hybrid)

ABOUT THE ROLE:
We are looking for a Junior Full-Stack Engineer to join our high-growth platform squad. In this role, you will help design and maintain scalable web features, write clean type-safe components, and collaborate across engineering, product management, and UX design teams.

CORE RESPONSIBILITIES:
- Write robust, high-fidelity React components utilizing modern TypeScript and Tailwind CSS patterns.
- Design, build, and optimize backend RESTful APIs using Node.js, Express, and PostgreSQL databases.
- Integrate critical state-management frameworks (e.g., Redux Toolkit) to support complex interactive workflows.
- Write thorough automated tests (Jest, React Testing Library) to ensure high code quality.
- Collaborate with engineers to optimize client-side bundle performance and load times.

KEY REQUIREMENTS:
- Strong familiarity with TypeScript, React, and modern ES6+ Javascript standards.
- Production or deep project exposure to Node.js backend integration and database querying with SQL / PostgreSQL.
- Experience with Git, collaborative pull-request workflows, and modern build tooling like Vite.
- High motivation to learn, adapt, and build using modern SaaS styling conventions.
- Excellent communication and collaboration skills. Mentioning test and metrics accomplishments is highly appreciated.`;

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [currentStep, setCurrentStep] = useState<"input" | "results">("input");
  
  // Loading & Generation sequence
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("Initializing calibration sensors...");
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Active core analysis toolkit data
  const [survivalKit, setSurvivalKit] = useState<SurvivalKit | undefined>(undefined);
  
  // Active selected Dashboard tab
  const [activeTab, setActiveTab] = useState<"ats" | "keywords" | "optimizer" | "interview" | "outreach" | "coach">("ats");

  // File drag & upload handlers
  const [dragActive, setDragActive] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileSuccessMsg, setFileSuccessMsg] = useState<string | null>(null);
  const [fileErrorMsg, setFileErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isSupported =
      lowerName.endsWith(".pdf") ||
      lowerName.endsWith(".docx") ||
      lowerName.endsWith(".txt") ||
      lowerName.endsWith(".md");

    if (!isSupported) {
      setFileErrorMsg("Unsupported file type. Please upload a PDF, DOCX, TXT, or MD resume.");
      setFileSuccessMsg(null);
      return;
    }

    setIsParsingFile(true);
    setFileErrorMsg(null);
    setFileSuccessMsg(null);
    setGenerationError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string;
          if (!result) {
            throw new Error("Failed to read file contents.");
          }

          const base64Index = result.indexOf(";base64,");
          if (base64Index === -1) {
            throw new Error("Could not read binary format.");
          }
          const base64Content = result.substring(base64Index + 8);

          const res = await fetch("/api/parse", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileBase64: base64Content,
              fileName: file.name,
            }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to parse document on server.");
          }

          const data = await res.json();
          if (data.text) {
            setResumeText(data.text);
            setFileSuccessMsg(`Successfully parsed "${file.name}"! Your resume text has been imported below.`);
          } else {
            throw new Error("Document parsed, but no text could be extracted.");
          }
        } catch (innerErr: any) {
          console.error("FileReader inner error:", innerErr);
          setFileErrorMsg(innerErr.message || "Failed to process resume document.");
        } finally {
          setIsParsingFile(false);
        }
      };

      reader.onerror = () => {
        setFileErrorMsg("Failed to read file on client.");
        setIsParsingFile(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("FileReader outer error:", err);
      setFileErrorMsg(err.message || "An error occurred starting file processing.");
      setIsParsingFile(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Pre-load mock template function
  const handleLoadSample = () => {
    setResumeText(SAMPLE_RESUME);
    setJobDescription(SAMPLE_JD);
    setFileSuccessMsg("Sample resume and job description preloaded!");
    setFileErrorMsg(null);
    setGenerationError(null);
  };

  // Perform AI generation
  const handleGenerateKit = async () => {
    if (!resumeText.trim()) {
      setGenerationError("Please input or upload your Resume text content.");
      return;
    }
    if (!jobDescription.trim()) {
      setGenerationError("Please paste the job description you wish to align with.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    // Multi-phase loader ticks for premium visual pacing
    const phases = [
      "Deconstructing resume layout syntax & metadata tags...",
      "Analyzing job requirement critical keywords...",
      "Generating metric-driven STAR bullet suggestions...",
      "Compiling tailored interview preparation matrix...",
      "Drafting recruiter outreach copy...",
      "Calibrating Career Coach neural model context..."
    ];

    let currentPhaseIdx = 0;
    setLoadingPhase(phases[0]);
    const interval = setInterval(() => {
      if (currentPhaseIdx < phases.length - 1) {
        currentPhaseIdx++;
        setLoadingPhase(phases[currentPhaseIdx]);
      }
    }, 2800);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed. Please verify your connection or your pasted inputs and retry.");
      }

      const kit = await res.json();
      setSurvivalKit(kit);
      setCurrentStep("results");
      setActiveTab("ats"); // default tab on layout
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Something went wrong generating the Survival Kit. Please retry.");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfcfa] flex flex-col justify-between font-sans selection:bg-emerald-600/10 selection:text-emerald-800">
      <Header />

      <main className="flex-grow">
        {/* Step 1: Input Page Frame */}
        {currentStep === "input" && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
            
            {/* Elegant Hero Banner */}
            <div className="text-center relative max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-150 rounded-full text-[11px] font-bold text-emerald-700 uppercase tracking-widest cursor-default animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Next-Gen Corporate AI Calibration</span>
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-slate-900 leading-tight">
                Land More Interviews.<br />
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 text-transparent bg-clip-text">
                  Not Just Better Resumes.
                </span>
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed font-normal max-w-lg mx-auto">
                Stop guessing. Connect your professional target qualifications with a metric-engineered, emerald-calibrated AI kit — generating custom recruiter messaging pipelines, keyword alignments, interview simulation tests, and dedicated 24/7 mentoring support.
              </p>

              <div>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition-colors border border-emerald-200"
                >
                  <Zap className="h-3.5 w-3.5 text-emerald-600 animate-bounce" />
                  <span>Try Sample Onboarding CV &amp; JD specs</span>
                </button>
              </div>
            </div>

            {/* Input Workspace Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              {/* Left Column: CV Input */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                  <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg font-bold">
                      <FileText className="h-4.5 w-4.5" />
                    </span>
                    <span>1. Upload Candidate Resume</span>
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">PDF, DOCX, TXT, MD</span>
                </div>

                {/* Drag & Drop Frame */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !isParsingFile && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-36 ${
                    dragActive
                      ? "border-emerald-500 bg-emerald-50/20"
                      : "border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/10"
                  } ${isParsingFile ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                    disabled={isParsingFile}
                  />
                  {isParsingFile ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-2">
                      <span className="h-7 w-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                      <span className="text-xs font-semibold text-emerald-700 animate-pulse">Running server-side file parser...</span>
                      <span className="text-[10px] text-slate-400">Extracting format schemas and layout content</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-emerald-500 mb-3" />
                      <span className="text-xs font-semibold text-slate-800">
                        Drag &amp; drop resume file, or click to browse
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 leading-normal max-w-xs">
                        Select **PDF, DOCX, TXT, or MD** resume. Standard enterprise files parse in seconds.
                      </span>
                    </>
                  )}
                </div>

                {/* Upload messages */}
                {fileSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{fileSuccessMsg}</span>
                  </div>
                )}
                {fileErrorMsg && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                    <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{fileErrorMsg}</span>
                  </div>
                )}

                <div className="flex-1 flex flex-col space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Resume Content Draft (Paste details below):
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      if (generationError) setGenerationError(null);
                    }}
                    placeholder={`Paste clean copied resume text or details directly here... \nExample:\n- Alex Chen, software engineer\n- Created React applications...`}
                    className="w-full flex-1 min-h-64 p-4 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-slate-800 placeholder-slate-400 transition-all font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Right Column: Job Spec Input */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                  <h3 className="font-display font-bold text-slate-950 text-sm tracking-tight flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                      <Briefcase className="h-4.5 w-4.5" />
                    </span>
                    <span>2. Paste Target Job Description (JD)</span>
                  </h3>
                  <span className="text-[10px] font-medium text-slate-400">Position specs</span>
                </div>

                <div className="flex-1 flex flex-col space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Paste Job Specs &amp; Responsibilities here:
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(e.target.value);
                      if (generationError) setGenerationError(null);
                    }}
                    placeholder="Paste corporate job descriptions, responsibilities, technical keywords, required tools, and company values here..."
                    className="w-full h-80 lg:flex-1 p-4 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-slate-800 placeholder-slate-400 transition-all font-mono leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Error notifications */}
            {generationError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-4 rounded-xl flex items-start gap-3 max-w-2xl mx-auto animate-fade-in">
                <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-bold text-rose-850">Kit Formulation Blocked</h5>
                  <p className="leading-relaxed font-normal text-rose-750">{generationError}</p>
                </div>
              </div>
            )}

            {/* Submit layout action trigger */}
            <div className="text-center pt-4">
              <button
                id="btn-generate-survival-kit"
                onClick={handleGenerateKit}
                disabled={isGenerating || isParsingFile}
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg glow-btn shadow-emerald-500/10 disabled:bg-slate-300 disabled:shadow-none active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <span className="h-4.5 w-4.5 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>AI CALIBRATING: {loadingPhase}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    <span>Generate Survival Kit</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-400 mt-3 font-mono">
                Average calculation runtime is ~8-15 seconds driven by multi-phase Gemini parameters.
              </p>
            </div>

          </div>
        )}

        {/* Step 2: Dashboard Results Page Frame */}
        {currentStep === "results" && survivalKit && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
            
            {/* Header Title with quick re-runs */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep("input")}
                    className="text-xs text-emerald-600 font-bold hover:underline hover:text-emerald-700"
                  >
                    &larr; Back to Inputs Configuration
                  </button>
                </div>
                <h2 className="font-display font-extrabold text-2xl tracking-tight text-slate-900">
                  Candidate Survival Kit Dashboard
                </h2>
                <p className="text-xs text-slate-500">
                  Target: Junior application aligned using premium AST compliance.
                </p>
              </div>

              <button
                onClick={() => setCurrentStep("input")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Re-align New Resume</span>
              </button>
            </div>

            {/* ATS Overview calibration bar */}
            <AtsScoreCard
              score={survivalKit.atsScore}
              matchPercentage={survivalKit.matchPercentage}
              strengths={survivalKit.resumeStrengths}
              weaknesses={survivalKit.resumeWeaknesses}
            />

            {/* Tab Controller Frame */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar selections */}
              <div className="lg:col-span-1 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block px-3 pb-1">
                  Toolkit Sections
                </span>

                {/* Tab: Keywords */}
                <button
                  onClick={() => setActiveTab("keywords")}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs font-semibold tracking-tight transition-all ${
                    activeTab === "keywords"
                      ? "bg-slate-950 border-slate-950 text-white shadow-md shadow-slate-950/10"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>Keyword Analysis</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-55" />
                </button>

                {/* Tab: Optimizer */}
                <button
                  onClick={() => setActiveTab("optimizer")}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs font-semibold tracking-tight transition-all ${
                    activeTab === "optimizer"
                      ? "bg-slate-950 border-slate-950 text-white shadow-md shadow-slate-950/10"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Resume Optimizer</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-55" />
                </button>

                {/* Tab: Interview Prep */}
                <button
                  onClick={() => setActiveTab("interview")}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs font-semibold tracking-tight transition-all ${
                    activeTab === "interview"
                      ? "bg-slate-950 border-slate-950 text-white shadow-md shadow-slate-950/10"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                    <span>Interview Preparation</span>
                  </div>
                  <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono uppercase shrink-0">
                    Simulator
                  </span>
                </button>

                {/* Tab: Recruiter Outreach */}
                <button
                  onClick={() => setActiveTab("outreach")}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs font-semibold tracking-tight transition-all ${
                    activeTab === "outreach"
                      ? "bg-slate-950 border-slate-950 text-white shadow-md shadow-slate-950/10"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span>Recruiter Outreach</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-55" />
                </button>

                {/* Tab: Coach */}
                <button
                  onClick={() => setActiveTab("coach")}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs font-semibold tracking-tight transition-all ${
                    activeTab === "coach"
                      ? "bg-slate-950 border-slate-950 text-white shadow-md shadow-slate-950/10"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-violet-600 animate-ping"></span>
                    <span>Personal Career Coach AI</span>
                  </div>
                  <span className="bg-violet-100 text-violet-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono uppercase shrink-0">
                    Chat
                  </span>
                </button>

                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-[10.5px] text-slate-400 mt-4 leading-normal">
                  <span className="font-semibold text-slate-600 uppercase tracking-widest block mb-1">
                    Recruiter Calibration
                  </span>
                  Matches are evaluated based on modern high-volume corporate filtering logic systems. Continuous updates applied.
                </div>
              </div>

              {/* Display Content Frame */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Keywords rendering */}
                {activeTab === "keywords" && (
                  <KeywordAnalysis keywords={survivalKit.keywords} />
                )}

                {/* Resume optimizer rendering */}
                {activeTab === "optimizer" && (
                  <ResumeOptimizerComponent optimizer={survivalKit.resumeOptimizer} />
                )}

                {/* Interview Prep rendering with Simulated Voice Mock capability */}
                {activeTab === "interview" && (
                  <InterviewPrepComponent
                    interviewPrep={survivalKit.interviewPrep}
                    resumeText={resumeText}
                    jobDescription={jobDescription}
                  />
                )}

                {/* Recruiter Outreach template copy board */}
                {activeTab === "outreach" && (
                  <RecruiterOutreachComponent outreach={survivalKit.outreach} />
                )}

                {/* Continuous 24/7 AI chat coach client */}
                {activeTab === "coach" && (
                  <AiCareerCoachComponent
                    resumeText={resumeText}
                    jobDescription={jobDescription}
                  />
                )}

              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
