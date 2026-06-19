import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, HelpCircle, AlertCircle, RefreshCw } from "lucide-react";
import { ChatMessage } from "../types";

interface AiCareerCoachProps {
  resumeText: string;
  jobDescription: string;
}

export default function AiCareerCoachComponent({ resumeText, jobDescription }: AiCareerCoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions in the product brief
  const sampleSuggestions = [
    { text: "How should I explain this project?", label: "Pitch Project" },
    { text: "What skills should I learn first?", label: "Learning Path" },
    { text: "Why am I a good fit for this role?", label: "Pitch Fit" },
    { text: "What weaknesses might interviewers notice?", label: "Weaknesses" },
    { text: "How should I answer tell me about yourself?", label: "Elevator Pitch" }
  ];

  // Load a welcoming prompt on initialization
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hi, I'm your AI Career Coach! I have thoroughly ingested your resume and analyzed it against your target job description.\n\nAsk me anything! I can help you draft answers, explain career jumps or technical gaps, simulate tricky follow-up questions, or write an elevator pitch. To get started, try one of the suggestions below!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    if (!customText) {
      setInputText("");
    }
    setChatError(null);

    const userMsg: ChatMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setChatLoading(true);

    try {
      // Send entire history with context
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          resumeText,
          jobDescription
         }),
      });

      if (!response.ok) {
        throw new Error("Gemini is currently busy. Please retry in a few seconds.");
      }

      const result = await response.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: result.text || "I was unable to formulate a response. Let me try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(p => [...p, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || "Failed to deliver message. Check connection and retry.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi! Let's start fresh. I'm ready to answer any questions about your resume, projects, or job alignment hacks. Fire away!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputText("");
    setChatError(null);
  };

  return (
    <div id="career-coach-module" className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col h-[580px] justify-between relative overflow-hidden">
      {/* Header of Coach panel */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="absolute bottom-[-2px] right-[-2px] block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>

          <div>
            <span className="font-display font-semibold text-slate-900 text-sm block">
              Continuous Career Coach AI
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Loaded with active resume + JD specifications
            </span>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg transition-all"
          title="Reset coach chat thread"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages list context pane */}
      <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4 my-2 border-slate-100/30">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === "assistant";
          return (
            <div
              key={index}
              className={`flex items-start gap-3.5 ${isAssistant ? "justify-start" : "justify-end"}`}
            >
              {isAssistant && (
                <div className="bg-indigo-50 border border-indigo-150 text-indigo-700 p-2 rounded-xl shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed space-y-1 ${
                  isAssistant
                    ? "bg-slate-50 border border-slate-100 text-slate-800"
                    : "bg-indigo-600 text-white shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans font-normal leading-relaxed">
                  {msg.content}
                </div>
                <span
                  className={`text-[9px] block text-right font-medium ${
                    isAssistant ? "text-slate-400" : "text-indigo-200"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {!isAssistant && (
                <div className="bg-slate-950 text-white p-2 border border-slate-800 rounded-xl shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* AI Typing dot anim indicator */}
        {chatLoading && (
          <div className="flex items-start gap-3.5 justify-start">
            <div className="bg-indigo-50 border border-indigo-150 text-indigo-700 p-2 rounded-xl shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>

            <div className="bg-slate-50 border border-slate-150 rounded-2xl px-5 py-4 max-w-[70%]">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-[11px] font-mono text-slate-400">Coach is formulating strategy...</span>
              </div>
            </div>
          </div>
        )}

        {chatError && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{chatError}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts footer bar */}
      <div className="shrink-0 space-y-3 pt-3 border-t border-slate-100">
        {messages.length < 3 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Suggested coaching questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug.text)}
                  disabled={chatLoading}
                  className="bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 text-slate-600 hover:text-indigo-700 text-xs py-1.5 px-3 rounded-lg font-medium transition-all text-left truncate max-w-xs cursor-pointer active:scale-95"
                >
                  {sug.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Text Box layout */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            disabled={chatLoading}
            placeholder="Ask your coach anything (e.g. explain project achievements, handle interview anxiety...)"
            className="flex-1 p-3.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all font-normal"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={chatLoading || !inputText.trim()}
            className="p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
