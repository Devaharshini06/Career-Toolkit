import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing with generous size limit for rich resume loads
app.use(express.json({ limit: "15mb" }));

// Initialize Google Gemini Client side of our server
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Robust model wrapper with retries and alternate model fallback to handle 503/UNAVAILABLE or rate limits
async function generateWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const modelsToTry = ["gemini-2.5-flash","gemini-2.5-flash-lite","gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.5-flash"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let attempts = 2; // Retry each model 2 times if needed
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        console.log(`[Gemini SDK] Requesting content utilizing model: "${model}" (Attempt ${attempt}/${attempts})`);
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        console.log(`[Gemini SDK] Success! Content generated successfully with model "${model}"`);
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini SDK Warning] Failed with model "${model}" on attempt ${attempt}/${attempts}. Error:`, err.message || err);
        if (attempt < attempts) {
          // brief non-blocking wait
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }
  }

  const detailedErrorMsg = lastError?.message || lastError || "Failed after trying multiple fallback models";
  throw new Error(`Gemini is currently busy. Please retry in a few seconds. Good general advice: please wait a moment or click the button to retry.`);
}


// Endpoint: Extract plain text from PDF, DOCX, TXT, or MD documents
app.post("/api/parse", async (req, res) => {
  try {
    const { fileBase64, fileName } = req.body;
    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: "Missing file content or filename." });
    }

    const buffer = Buffer.from(fileBase64, "base64");
    let extractedText = "";

    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith(".pdf")) {
      // Use Gemini API as our robust, error-free text extraction system for PDFs
      try {
        const parseResponse = await generateWithFallback({
          contents: [
            {
              inlineData: {
                data: fileBase64,
                mimeType: "application/pdf"
              }
            },
            {
              text: "You are an expert document text extraction system. Extract and return ALL readable text, details, education history, work history, and document structural segments from this PDF document verbatim. Do not lose any information, do not summarize, and do not add any meta commentary of your own. Just output the text extracted."
            }
          ]
        });
        extractedText = parseResponse.text || "";
      } catch (gemErr: any) {
        throw new Error(`Failed to parse PDF document. Gemini extraction error: ${gemErr?.message || gemErr}`);
      }
    } else if (lowerName.endsWith(".docx")) {
      // @ts-ignore
      const mammothModule = (await import("mammoth")) as any;
      const mammothParser = mammothModule.default || mammothModule;
      const result = await mammothParser.extractRawText({ buffer });
      extractedText = result.value || "";
    } else if (lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
      extractedText = buffer.toString("utf-8");
    } else {
      return res.status(400).json({ error: "Unsupported file type. Please upload a PDF, DOCX, TXT, or MD resume." });
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ error: "Successfully read document, but no readable text could be extracted." });
    }

    res.json({ text: extractedText.trim() });
  } catch (err: any) {
    console.error("Document parsing error:", err);
    res.status(500).json({ error: `Could not parse document: ${err.message || err}` });
  }
});

// Endpoint: AI-driven Resume & Job Description Analysis
app.post("/api/analyze", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Resume content and Job Description are required." });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured in environment variables." });
    }

    const systemInstruction = `You are an elite corporate technical recruiter and expert career coach. 
Analyze the provided candidate resume against the given target job description (JD). 
Perform an extremely detailed, hyper-personalized, realistic analysis that helps entry-level candidates, students, and career switchers land interviews.
Generate the complete personalized career survival kit toolkit in the requested JSON structure.
For optimizedResumeMarkdown, optimize the candidate's EXACT resume into a clean, modern, single-column ATS-friendly full resume template in markdown format. 
CRITICAL: Do NOT invent, fabricate, or hallucinate any fake companies, job titles, or experience durations. Keep all personal history completely accurate and clean, but polish and reword their descriptive bullet points with high-impact STAR verbs, integrate requested key technical and priority keywords naturally, and format it elegantly with clear, ATS-scannable markdown headers (e.g. ## PROFESSIONAL EXPERIENCE, ## TECHNICAL SKILLS).`;

    const prompt = `--- CANDIDATE RESUME ---
${resumeText}

--- TARGET JOB DESCRIPTION ---
${jobDescription}

Please perform the complete career survival analysis. Be highly specific, cite exact terms from the resume, provide actionable, metric-proven bullet points, and create the full ATS-friendly optimized resume tailored directly to the JD.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { type: Type.INTEGER, description: "A realistic ATS match score from 0 to 100 based on keyword overlap, phrasing, and formatting criteria." },
            matchPercentage: { type: Type.INTEGER, description: "Detailed skill and role alignment percentage." },
            resumeStrengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 detailed highlights of what this resume does exceptionally well relative to the JD." },
            resumeWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 detailed, professional suggestions of missing experience, weak wording, or formatting issues." },
            keywords: {
              type: Type.OBJECT,
              properties: {
                matched: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Direct technologies, tools, and methodologies that appear in both the resume and JD." },
                missing: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important qualifications or tools mentioned in the JD but absent or weak in the resume." },
                priority: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The top 3-5 absolute most critical missing technical or power skills that will get the resume filtered out." }
              },
              required: ["matched", "missing", "priority"]
            },
            resumeOptimizer: {
              type: Type.OBJECT,
              properties: {
                optimizedResumeMarkdown: { type: Type.STRING, description: "A complete polished ATS-friendly resume in standard Markdown, based strictly on the candidate's actual metrics and history but fully optimized for keyword density, layout readability, and STAR impact. Do not invent fake companies or experiences." },
                improvedBullets: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING, description: "A dry, unoptimized bullet point extracted directly from the resume." },
                      improved: { type: Type.STRING, description: "The rewritten modern bullet point emphasizing STAR methodology, metrics, and key technologies." },
                      reason: { type: Type.STRING, description: "Brief explanation explaining what was improved (e.g. brought out scaling impact, added action words, highlighted React)." }
                    },
                    required: ["original", "improved", "reason"]
                  }
                },
                actionVerbsSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Modern, power action verbs tailored specifically to the style of the target role." },
                formattingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "ATS-friendly layout guidelines, section naming, or font choices." }
              },
              required: ["optimizedResumeMarkdown", "improvedBullets", "actionVerbsSuggestions", "formattingSuggestions"]
            },
            interviewPrep: {
              type: Type.OBJECT,
              properties: {
                resumeBasedQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING, description: "Deep tech or project question targeting custom achievements on the resume." },
                      idealAnswerOutline: { type: Type.STRING, description: "How they can address this precisely, citing details from their experience." }
                    },
                    required: ["question", "idealAnswerOutline"]
                  }
                },
                jdBasedQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING, description: "A technical question focusing directly on core technologies, expectations, or team duties listed in the JD." },
                      idealAnswerOutline: { type: Type.STRING, description: "Tailored outline showcasing mastery in those specific areas." }
                    },
                    required: ["question", "idealAnswerOutline"]
                  }
                },
                behavioralQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING, description: "Common behavioral, HR, or situational question applicable to this seniority." },
                      idealAnswerOutline: { type: Type.STRING, description: "Structured outline guided by the STAR format." }
                    },
                    required: ["question", "idealAnswerOutline"]
                  }
                },
                focusAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Topics, frameworks, system design patterns, or algorithms they must review before this interview." }
              },
              required: ["resumeBasedQuestions", "jdBasedQuestions", "behavioralQuestions", "focusAreas"]
            },
            outreach: {
              type: Type.OBJECT,
              properties: {
                coldEmail: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING, description: "High-open-rate subject line tailored to this job." },
                    body: { type: Type.STRING, description: "Fully written cold outreach message matching the candidate's achievements with target team challenges." }
                  },
                  required: ["subject", "body"]
                },
                linkedInMessage: { type: Type.STRING, description: "Ultra-brief, professional connection pitch (max 300 characters)." },
                referralRequest: { type: Type.STRING, description: "A message to send to a normal employee at the target company expressing interest and polite ask for a virtual coffee chat/referral." }
              },
              required: ["coldEmail", "linkedInMessage", "referralRequest"]
            }
          },
          required: [
            "atsScore",
            "matchPercentage",
            "resumeStrengths",
            "resumeWeaknesses",
            "keywords",
            "resumeOptimizer",
            "interviewPrep",
            "outreach"
          ]
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to perform AI analysis." });
  }
});

// Endpoint: AI Career Coach Chat Interface (handles back-and-forth conversation)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, resumeText, jobDescription } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Conversation history 'messages' array is required." });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured in environment variables." });
    }

    // Set up a strong context-aware instruction explaining the candidate's situation
    const systemInstruction = `You are the Career Survival Coach AI, an elite mentor and counselor.
You have absolute mastery over the Candidate's Resume and their Target Job Description.
Be encouraging, practical, and highly realistic. Give exact examples of phrases, elevator pitches, and bullet points whenever requested.

CANDIDATE RESUME:
${resumeText || "No resume uploaded yet (provide general expert advice)."}

TARGET JOB DESCRIPTION:
${jobDescription || "No job description pasted yet."}

Guide the candidate through preparation, how to explain gaps or projects, how to frame accomplishments, and absolute confidence in their search. Maintain a friendly, supportive, yet professional and structured tone. Keep answers reasonably concise but loaded with value.`;

    // Map incoming message format to Gemini's expected parts
    // Let's use simple single-part generateContent to keep it simple, robust and state-aligned
    // We send the history of the conversation in the prompt or use the chats.create controller.
    // Let's simply translate the conversation history into the contents list!
    // Format required by generateContent: contents: [{role: 'user'|'model', parts: [{text: string}]}]
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await generateWithFallback({
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with Career Coach AI." });
  }
});

// Endpoint: AI Interview Answer Evaluation
app.post("/api/grade-answer", async (req, res) => {
  try {
    const { question, answerText, resumeText, jobDescription } = req.body;

    if (!question || !answerText) {
      return res.status(400).json({ error: "question and answerText are required fields." });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured in environment variables." });
    }

    const systemInstruction = `You are a strict, top-tier interviewer grading a candidate's answer.
Formulate a highly constructive, professional feed-forward report based on STAR (Situation, Task, Action, Result) framework concepts, core skills, and technical precision.`;

    const prompt = `--- CONTEXT ---
${resumeText ? `Candidate Resume: \n${resumeText}\n` : ""}
${jobDescription ? `Job Specs: \n${jobDescription}\n` : ""}

--- THE INTERVIEW QUESTION ---
"${question}"

--- THE CANDIDATE'S SUBMITTED RESPONSE ---
"${answerText}"

Analyze this answer. Provide a constructive, realistic 0-100 score, a brief STAR assessment, direct strengths, gaps, actionable tips, and rewrite it into an exemplary perfect response.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "A highly realistic interview readiness score from 0 to 100." },
            starsAssessment: { type: Type.STRING, description: "Breakdown analysis based on STAR components: Situation, Task, Action, and Metric-proven Results." },
            strengths: { type: Type.STRING, description: "Key positive attributes, technical terms, or communication styles they used effectively." },
            gaps: { type: Type.STRING, description: "Identified holes like missing action definitions, lack of metrics/outcomes, or vague scope." },
            howToImprove: { type: Type.STRING, description: "Actionable tips explaining exactly how to structure or rephrase their response next time." },
            improvedPhrase: { type: Type.STRING, description: "An optimized phrase block detailing how the candidate can deliver this exact answer layout perfectly." }
          },
          required: ["score", "starsAssessment", "strengths", "gaps", "howToImprove", "improvedPhrase"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Grading Error:", error);
    res.status(500).json({ error: error.message || "Failed to grade interview response." });
  }
});

// Serve frontend application via Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Career Survival Kit AI Dev Server running at http://localhost:${PORT}`);
  });
}

startServer();
