export interface KeywordGroup {
  matched: string[];
  missing: string[];
  priority: string[];
}

export interface ImprovedBullet {
  original: string;
  improved: string;
  reason: string;
}

export interface ResumeOptimizer {
  optimizedResumeMarkdown: string;
  improvedBullets: ImprovedBullet[];
  actionVerbsSuggestions: string[];
  formattingSuggestions: string[];
}

export interface InterviewQuestion {
  question: string;
  idealAnswerOutline: string;
}

export interface InterviewPrep {
  resumeBasedQuestions: InterviewQuestion[];
  jdBasedQuestions: InterviewQuestion[];
  behavioralQuestions: InterviewQuestion[];
  focusAreas: string[];
}

export interface OutreachTemplate {
  subject?: string;
  body: string;
}

export interface RecruiterOutreach {
  coldEmail: {
    subject: string;
    body: string;
  };
  linkedInMessage: string;
  referralRequest: string;
}

export interface SurvivalKit {
  atsScore: number;
  matchPercentage: number;
  resumeStrengths: string[];
  resumeWeaknesses: string[];
  keywords: KeywordGroup;
  resumeOptimizer: ResumeOptimizer;
  interviewPrep: InterviewPrep;
  outreach: RecruiterOutreach;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
