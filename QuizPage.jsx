import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizComplete from "@/components/quiz/QuizComplete";
import { COGNITIVE_MODES } from "@/components/quiz/CognitiveModeSelector";

const TOPIC_LABELS = {
  general_knowledge: "General Knowledge",
  science: "Science",
  math: "Math & Logic",
  language: "Language & Words",
  history: "History",
  creative: "Arts & Culture",
};

const DEFAULT_QUESTIONS = 8;

export default function QuizPage() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizDone, setQuizDone] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [adaptiveScore, setAdaptiveScore] = useState(50);
  const [sessionId, setSessionId] = useState(null);
  const [modePrefs, setModePrefs] = useState({});

  const getDifficultyLabel = (score) => {
    if (score >= 70) return "advanced";
    if (score >= 40) return "intermediate";
    return "beginner";
  };

  const generateQuestions = useCallback(async (diffLevel, topicName, numQuestions = DEFAULT_QUESTIONS) => {
    setLoading(true);
    const prompt = `Generate ${numQuestions} quiz questions about "${topicName}" at "${diffLevel}" difficulty level.

IMPORTANT GUIDELINES for accessibility:
- Keep sentences SHORT and CLEAR (max 15 words per sentence)
- Use SIMPLE, everyday words — avoid jargon
- Each question should have exactly 4 answer options
- Make wrong answers plausible but clearly different
- Add a brief, encouraging explanation for each answer
- Questions should be fun and interesting

Return valid JSON matching this schema exactly:
{
  "questions": [
    {
      "question": "the question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_answer": "the correct option text exactly",
      "explanation": "brief clear explanation",
      "difficulty": "${diffLevel}"
    }
  ]
}`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correct_answer: { type: "string" },
                explanation: { type: "string" },
                difficulty: { type: "string" },
              },
            },
          },
        },
      },
    });
    setQuestions(res.questions || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      const profiles = await base44.entities.QuizProfile.filter({ user_id: me.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        const initialScore = p.difficulty_level === "advanced" ? 75 : p.difficulty_level === "intermediate" ? 55 : 30;
        setAdaptiveScore(initialScore);

        // Resolve cognitive mode settings
        const modeId = p.cognitive_mode || "custom";
        const modeConfig = COGNITIVE_MODES[modeId];
        const resolvedPrefs = modeConfig?.settings
          ? { ...p.accessibility_preferences, ...modeConfig.settings }
          : (p.accessibility_preferences || {});
        setModePrefs(resolvedPrefs);

        const numQ = resolvedPrefs.questions_per_session || DEFAULT_QUESTIONS;

        const session = await base44.entities.QuizSession.create({
          user_id: me.id,
          topic: topic,
          difficulty: p.difficulty_level,
          total_questions: numQ,
          status: "in_progress",
          adaptive_score: initialScore,
        });
        setSessionId(session.id);

        await generateQuestions(p.difficulty_level, TOPIC_LABELS[topic] || topic, numQ);
      }
    };
    init();
  }, [topic, generateQuestions]);

  const handleAnswer = async (answer, isCorrect) => {
    let newCorrect = correctCount;
    if (isCorrect) {
      newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      setAdaptiveScore((prev) => Math.min(100, prev + 10));
    } else {
      setAdaptiveScore((prev) => Math.max(0, prev - 8));
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      await finishQuiz(newCorrect);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const finishQuiz = async (finalCorrect) => {
    const baseXp = finalCorrect * 20;
    const bonusXp = finalCorrect === questions.length ? 30 : 0;
    const totalXp = baseXp + bonusXp;
    setXpEarned(totalXp);

    let newXp = (profile.xp || 0) + totalXp;
    let newLevel = profile.level || 1;
    let newXpToNext = profile.xp_to_next_level || 100;
    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel += 1;
      newXpToNext = Math.round(newXpToNext * 1.3);
    }

    const newDifficulty = getDifficultyLabel(adaptiveScore);
    const updatedProfile = {
      level: newLevel,
      xp: newXp,
      xp_to_next_level: newXpToNext,
      total_quizzes_completed: (profile.total_quizzes_completed || 0) + 1,
      total_correct_answers: (profile.total_correct_answers || 0) + finalCorrect,
      total_questions_answered: (profile.total_questions_answered || 0) + questions.length,
      difficulty_level: newDifficulty,
    };

    await base44.entities.QuizProfile.update(profile.id, updatedProfile);
    setProfile((prev) => ({ ...prev, ...updatedProfile }));

    if (sessionId) {
      await base44.entities.QuizSession.update(sessionId, {
        status: "completed",
        correct_answers: finalCorrect,
        wrong_answers: questions.length - finalCorrect,
        xp_earned: totalXp,
        adaptive_score: adaptiveScore,
      });
    }

    setQuizDone(true);
  };

  const handleRetry = async () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setQuizDone(false);
    const numQ = modePrefs.questions_per_session || DEFAULT_QUESTIONS;
    await generateQuestions(getDifficultyLabel(adaptiveScore), TOPIC_LABELS[topic] || topic, numQ);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white dark:from-slate-950 dark:to-slate-900 px-5">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-4" />
        <p className="text-slate-500 text-center">Preparing your questions...</p>
        <p className="text-sm text-slate-400 mt-1">Adapting to your level</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700">
          <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">{TOPIC_LABELS[topic] || "Quiz"}</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{getDifficultyLabel(adaptiveScore)} difficulty</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="px-5 pb-10">
        {quizDone ? (
          <QuizComplete
            correct={correctCount}
            total={questions.length}
            xpEarned={xpEarned}
            profile={profile}
            onGoHome={() => navigate("/")}
            onRetry={handleRetry}
          />
        ) : (
          questions.length > 0 && (
            <QuizQuestion
              key={currentIndex}
              question={questions[currentIndex].question}
              options={questions[currentIndex].options}
              correctAnswer={questions[currentIndex].correct_answer}
              explanation={questions[currentIndex].explanation}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              onAnswer={handleAnswer}
              modePrefs={modePrefs}
            />
          )
        )}
      </div>
    </div>
  );
}
