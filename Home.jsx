import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, BookOpen, Flame, Settings } from "lucide-react";
import { COGNITIVE_MODES } from "@/components/quiz/CognitiveModeSelector";
import LevelBadge from "@/components/quiz/LevelBadge";
import XPBar from "@/components/quiz/XPBar";
import StatCard from "@/components/quiz/StatCard";
import TopicCard from "@/components/quiz/TopicCard";
import ThemeToggle from "@/components/ThemeToggle";

const TOPICS = [
  { id: "general_knowledge", icon: "🧠", title: "General Knowledge", description: "Fun facts and everyday knowledge", color: "sky" },
  { id: "science", icon: "🔬", title: "Science", description: "Explore the natural world", color: "emerald" },
  { id: "math", icon: "🔢", title: "Math & Logic", description: "Numbers, patterns, and puzzles", color: "amber" },
  { id: "language", icon: "📝", title: "Language & Words", description: "Vocabulary and grammar", color: "violet" },
  { id: "history", icon: "🏛️", title: "History", description: "Stories from the past", color: "rose" },
  { id: "creative", icon: "🎨", title: "Arts & Culture", description: "Music, art, and creativity", color: "orange" },
];

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const profiles = await base44.entities.QuizProfile.filter({ user_id: me.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      } else {
        const newProfile = await base44.entities.QuizProfile.create({
          user_id: me.id,
          display_name: me.full_name || "Learner",
          level: 1,
          xp: 0,
          xp_to_next_level: 100,
          total_quizzes_completed: 0,
          total_correct_answers: 0,
          total_questions_answered: 0,
          current_streak: 0,
          best_streak: 0,
          difficulty_level: "beginner",
          preferred_pace: "relaxed",
          accessibility_preferences: {
            dyslexia_font: true,
            high_contrast: false,
            reduced_animations: false,
            large_text: true,
            show_timer: false,
          },
          badges: [],
        });
        setProfile(newProfile);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleStartQuiz = (topicId) => {
    navigate(`/quiz/${topicId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  const accuracy = profile.total_questions_answered > 0
    ? Math.round((profile.total_correct_answers / profile.total_questions_answered) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Hey, {profile.display_name?.split(" ")[0] || "Learner"} 👋
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">Ready to learn today?</p>
          {profile?.cognitive_mode && profile.cognitive_mode !== "custom" && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-400 mt-0.5">
              {COGNITIVE_MODES[profile.cognitive_mode]?.emoji} {COGNITIVE_MODES[profile.cognitive_mode]?.label} mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/profile" className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </Link>
        </div>
      </header>

      <div className="px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm mb-6"
        >
          <div className="flex items-center gap-5 mb-4">
            <LevelBadge level={profile.level} />
            <div className="flex-1">
              <XPBar xp={profile.xp} xpToNext={profile.xp_to_next_level} level={profile.level} />
              {profile.current_streak > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-medium text-orange-600">{profile.current_streak} day streak!</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={BookOpen} label="Quizzes" value={profile.total_quizzes_completed} color="blue" />
            <StatCard icon={Brain} label="Accuracy" value={`${accuracy}%`} color="green" />
            <StatCard icon={Flame} label="Best Streak" value={profile.best_streak} color="orange" />
          </div>
        </motion.div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Choose a Topic</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TOPICS.map((topic, idx) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <TopicCard
                  icon={topic.icon}
                  title={topic.title}
                  description={topic.description}
                  color={topic.color}
                  onClick={() => handleStartQuiz(topic.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
