import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, BookOpen, Target, Zap, Trophy } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LevelBadge from "@/components/quiz/LevelBadge";
import XPBar from "@/components/quiz/XPBar";
import AccessibilityPanel from "@/components/quiz/AccessibilityPanel";
import CognitiveModeSelector, { COGNITIVE_MODES } from "@/components/quiz/CognitiveModeSelector";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const profiles = await base44.entities.QuizProfile.filter({ user_id: me.id });
      if (profiles.length > 0) setProfile(profiles[0]);
      const recentSessions = await base44.entities.QuizSession.filter({ user_id: me.id, status: "completed" }, "-created_date", 10);
      setSessions(recentSessions);
      setLoading(false);
    };
    init();
  }, []);

  const handleUpdatePreferences = async (newPrefs) => {
    await base44.entities.QuizProfile.update(profile.id, { accessibility_preferences: newPrefs });
    setProfile((prev) => ({ ...prev, accessibility_preferences: newPrefs }));
  };

  const handleUpdatePace = async (pace) => {
    await base44.entities.QuizProfile.update(profile.id, { preferred_pace: pace });
    setProfile((prev) => ({ ...prev, preferred_pace: pace }));
  };

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  const accuracy = profile?.total_questions_answered > 0
    ? Math.round((profile.total_correct_answers / profile.total_questions_answered) * 100)
    : 0;

  const handleUpdateCognitiveMode = async (modeId) => {
    const mode = COGNITIVE_MODES[modeId];
    const updates = { cognitive_mode: modeId };
    if (mode.settings) {
      updates.accessibility_preferences = {
        ...profile.accessibility_preferences,
        ...mode.settings,
      };
    }
    await base44.entities.QuizProfile.update(profile.id, updates);
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "mode", label: "My Mode" },
    { id: "accessibility", label: "Accessibility" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700">
            <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">My Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={handleLogout} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </header>

      <div className="px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <LevelBadge level={profile?.level || 1} />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-3">{profile?.display_name || "Learner"}</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">{user?.email}</p>
          <div className="mt-4 max-w-xs mx-auto">
            <XPBar xp={profile?.xp || 0} xpToNext={profile?.xp_to_next_level || 100} level={profile?.level || 1} />
          </div>
        </motion.div>

        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                <BookOpen className="w-5 h-5 text-sky-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{profile?.total_quizzes_completed || 0}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Quizzes Done</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                <Target className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{accuracy}%</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Accuracy</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                <Zap className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{profile?.total_correct_answers || 0}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Correct Answers</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                <Trophy className="w-5 h-5 text-violet-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">{profile?.difficulty_level || "beginner"}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Current Level</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Learning Pace</h3>
              <Select value={profile?.preferred_pace || "relaxed"} onValueChange={handleUpdatePace}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relaxed">🐢 Relaxed — Take your time</SelectItem>
                  <SelectItem value="moderate">🚶 Moderate — Steady pace</SelectItem>
                  <SelectItem value="fast">🏃 Fast — Challenge me!</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {activeTab === "mode" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Pick a preset built for your cognitive style. Each mode adjusts the quiz experience automatically.
            </p>
            <CognitiveModeSelector
              activeMode={profile?.cognitive_mode || "custom"}
              onChange={handleUpdateCognitiveMode}
            />
          </motion.div>
        )}

        {activeTab === "accessibility" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Customize your experience for better focus and readability.</p>
            <AccessibilityPanel
              preferences={profile?.accessibility_preferences}
              onChange={handleUpdatePreferences}
            />
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400">No quizzes completed yet</p>
                <p className="text-sm text-slate-300 mt-1">Start a quiz to see your history here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 capitalize">
                          {(session.topic || "").replace(/_/g, " ")}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {new Date(session.created_date).toLocaleDateString()} · {session.difficulty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {session.correct_answers}/{session.total_questions}
                        </p>
                        <p className="text-xs text-amber-500 font-medium">+{session.xp_earned} XP</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="h-10" />
    </div>
  );
}
