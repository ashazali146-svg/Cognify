import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function LevelBadge({ level }) {
  const getBadgeColor = () => {
    if (level >= 20) return "from-violet-500 to-purple-600";
    if (level >= 15) return "from-rose-400 to-pink-600";
    if (level >= 10) return "from-amber-400 to-orange-500";
    if (level >= 5) return "from-emerald-400 to-teal-500";
    return "from-sky-400 to-blue-500";
  };

  const getTitle = () => {
    if (level >= 20) return "Grand Master";
    if (level >= 15) return "Expert";
    if (level >= 10) return "Scholar";
    if (level >= 5) return "Learner";
    return "Beginner";
  };

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getBadgeColor()} flex items-center justify-center shadow-lg`}>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{level}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span className="text-sm font-medium text-slate-600">{getTitle()}</span>
      </div>
    </motion.div>
  );
}
