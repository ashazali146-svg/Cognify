import React from "react";
import { motion } from "framer-motion";

export default function XPBar({ xp, xpToNext, level }) {
  const percentage = Math.min((xp / xpToNext) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Level {level}</span>
        <span className="text-xs text-amber-600/70 dark:text-amber-500/70">{xp} / {xpToNext} XP</span>
      </div>
      <div className="w-full h-3 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
