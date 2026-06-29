import React from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Zap, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import XPBar from "@/components/quiz/XPBar";

export default function QuizComplete({ correct, total, xpEarned, profile, onGoHome, onRetry }) {
  const percentage = Math.round((correct / total) * 100);

  const getMessage = () => {
    if (percentage === 100) return { emoji: "🏆", text: "Perfect score! You're incredible!" };
    if (percentage >= 80) return { emoji: "🌟", text: "Amazing work! Almost perfect!" };
    if (percentage >= 60) return { emoji: "💪", text: "Good effort! Keep practicing!" };
    if (percentage >= 40) return { emoji: "🌱", text: "You're growing! Try again?" };
    return { emoji: "🤗", text: "Every step counts! Let's try again!" };
  };

  const message = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="text-6xl mb-4"
      >
        {message.emoji}
      </motion.div>

      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Quiz Complete!</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">{message.text}</p>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm mb-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{correct}/{total}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Correct</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{percentage}%</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Score</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-violet-500" />
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">+{xpEarned}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">XP Earned</p>
          </div>
        </div>

        {profile && (
          <XPBar xp={profile.xp} xpToNext={profile.xp_to_next_level} level={profile.level} />
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={onRetry} variant="outline" className="flex-1 rounded-xl h-12 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
          <RotateCcw className="w-4 h-4 mr-2" /> Try Again
        </Button>
        <Button onClick={onGoHome} className="flex-1 rounded-xl h-12 bg-sky-500 hover:bg-sky-600 text-white">
          Home <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
