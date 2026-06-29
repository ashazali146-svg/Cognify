import React from "react";
import { motion } from "framer-motion";

const COLOR_STYLES = {
  sky: "from-sky-50 to-white dark:from-sky-900/20 dark:to-slate-800 hover:border-sky-200 dark:hover:border-sky-700",
  emerald: "from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-800 hover:border-emerald-200 dark:hover:border-emerald-700",
  amber: "from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-800 hover:border-amber-200 dark:hover:border-amber-700",
  violet: "from-violet-50 to-white dark:from-violet-900/20 dark:to-slate-800 hover:border-violet-200 dark:hover:border-violet-700",
  rose: "from-rose-50 to-white dark:from-rose-900/20 dark:to-slate-800 hover:border-rose-200 dark:hover:border-rose-700",
  orange: "from-orange-50 to-white dark:from-orange-900/20 dark:to-slate-800 hover:border-orange-200 dark:hover:border-orange-700",
};

export default function TopicCard({ icon, title, description, color, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl border-2 border-transparent bg-gradient-to-br ${COLOR_STYLES[color] || COLOR_STYLES.sky} transition-all duration-200 shadow-sm hover:shadow-md`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </motion.button>
  );
}
