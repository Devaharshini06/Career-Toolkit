import { Sparkles, Clipboard, Check, Lightbulb, FileText, Download, ListChecks, Eye, Layers } from "lucide-react";
import { useState } from "react";
import { ResumeOptimizer } from "../types";
import Markdown from "react-markdown";

interface ResumeOptimizerProps {
  optimizer: ResumeOptimizer | undefined;
}

export default function ResumeOptimizerComponent({ optimizer }: ResumeOptimizerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"resume" | "bullets" | "formatting">("resume");
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!optimizer) return null;

  const handleCopyResume = () => {
    if (!optimizer.optimizedResumeMarkdown) return;
    navigator.clipboard.writeText(optimizer.optimizedResumeMarkdown);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadMd = () => {
    if (!optimizer.optimizedResumeMarkdown) return;
    const blob = new Blob([optimizer.optimizedResumeMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ATS_Optimized_Resume.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    if (!optimizer.optimizedResumeMarkdown) return;
    // Replace markdown headings or lists for a ultra-pure text representation
    let cleanText = optimizer.optimizedResumeMarkdown
      .replace(/^#\s+(.+)$/gm, "$1\n" + "=".repeat(30))
      .replace(/^##\s+(.+)$/gm, "\n$1\n" + "-".repeat(30))
      .replace(/^###\s+(.+)$/gm, "\n$1")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "-");

    const blob = new Blob([cleanText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ATS_Optimized_Resume.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="resume-optimizer-module" className="space-y-6">
      {/* Sub tabs to navigate between the actual fully optimized resume and the transformation analysis */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-4">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab("resume")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all ${
              activeSubTab === "resume"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>ATS Optimized Resume</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("bullets")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all ${
              activeSubTab === "bullets"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Improvement Highlights</span>
          </button>

          <button
            onClick={() => setActiveSubTab("formatting")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all ${
              activeSubTab === "formatting"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListChecks className="h-3.5 w-3.5" />
            <span>Guideline & Verbs</span>
          </button>
        </div>

        {activeSubTab === "resume" && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyResume}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg transition-colors border border-slate-200"
            >
              {copiedResume ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-3.5 w-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadMd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold rounded-lg transition-colors border border-indigo-100"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .MD</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg transition-all shadow-sm"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Download Text (.TXT)</span>
            </button>
          </div>
        )}
      </div>

      {activeSubTab === "resume" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 flex gap-3 text-xs text-amber-800">
            <Lightbulb className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">True-History Constraint Active</p>
              <p className="text-amber-700/90 mt-0.5 leading-relaxed">
                This resume has been restructured cleanly using a high-density, single-column alignment perfect for parsing. No imaginary projects or fake credentials were added—your genuine career records have simply been optimized and keyword-enriched.
              </p>
            </div>
          </div>

          {/* Simulate printed sheet page layout */}
          <div className="bg-slate-100 rounded-2xl p-4 md:p-8 border border-slate-200/60 shadow-inner flex justify-center">
            <div className="bg-white border border-slate-300 w-full max-w-[800px] shadow-lg rounded-sm p-6 sm:p-10 md:p-12 min-h-[1000px]">
              <div className="markdown-body">
                <Markdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-xl md:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 text-center tracking-tight uppercase">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xs md:text-sm font-bold text-slate-800 mt-6 mb-3 border-b-2 border-slate-200 pb-0.5 tracking-wider uppercase flex items-center justify-between">
                        <span>{children}</span>
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xs font-bold text-slate-800 mt-4 mb-1 tracking-tight">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-xs text-slate-600 mb-2 leading-relaxed text-left">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-4 mb-4 space-y-1.5 text-xs text-slate-600 text-left">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    hr: () => <hr className="border-slate-200 my-5" />,
                  }}
                >
                  {optimizer.optimizedResumeMarkdown}
                </Markdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "bullets" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <h5 className="font-display font-semibold text-slate-900 text-sm tracking-tight">
              Metric-Driven STAR Bullet Transformations
            </h5>
          </div>

          <p className="text-xs text-slate-500">
            See exactly how we reformated weaker bullet points on your original resume into strategic, metric-based STAR statements parsed perfectly by standard corporate filters.
          </p>

          {optimizer.improvedBullets?.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center text-xs text-slate-400">
              No specific bullets need custom standalone highlight. Review the full resume above for holistic optimization!
            </div>
          ) : (
            <div className="space-y-5">
              {optimizer.improvedBullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3 transition-all hover:border-slate-300"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original bullet */}
                    <div className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Current Resume Version
                      </span>
                      <p className="text-xs text-slate-500 italic leading-relaxed">
                        &ldquo;{bullet.original}&rdquo;
                      </p>
                    </div>

                    {/* Optimized bullet */}
                    <div className="bg-indigo-50/30 rounded-xl p-3.5 border border-indigo-100/50 relative group">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                        Optimized Power Version
                      </span>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed pr-6">
                        &ldquo;{bullet.improved}&rdquo;
                      </p>

                      <button
                        onClick={() => handleCopyBullet(bullet.improved, idx)}
                        className="absolute top-3.5 right-3.5 text-slate-400 hover:text-indigo-600 p-1 bg-white hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Copy rewrite snippet"
                      >
                        {copiedIndex === idx ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Clipboard className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Impact explanation */}
                  <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100/50">
                    <Lightbulb className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-700 font-semibold">Strategic Impact:</strong> {bullet.reason}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === "formatting" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action Verbs */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h5 className="font-display font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg">
                <Sparkles className="h-4 w-4" />
              </span>
              <span>Tailored Action Verbs</span>
            </h5>
            <div className="flex flex-wrap gap-2">
              {optimizer.actionVerbsSuggestions?.map((verb, idx) => (
                <span
                  key={idx}
                  className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium cursor-default hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors"
                >
                  {verb}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Start each role description bullet with one of these high-impact words to represent active responsibility.
            </p>
          </div>

          {/* Formatting Guidelines */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h5 className="font-display font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg">
                <Lightbulb className="h-4 w-4" />
              </span>
              <span>ATS Formatting Best Practices</span>
            </h5>
            <ul className="space-y-2.5">
              {optimizer.formattingSuggestions?.map((tip, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-slate-600 leading-relaxed font-normal">
                  <span className="text-indigo-600 font-bold shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
