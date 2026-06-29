import React from "react";
import { motion } from "framer-motion";
import { Zap, BookOpen, Brain, Sliders } from "lucide-react";

export const COGNITIVE_MODES = {
  adhd: {
    id: "adhd",
    label: "ADHD Focus",
    emoji: "⚡",
    icon: Zap,
    color: "amber",
    description: "Short bursts, frequent rewards, minimal distractions",
    settings: {
      dyslexia_font: false,
      high_contrast: false,
      reduced_animations: false,
      large_text: true,
      show_timer: false,
      questions_per_session: 5,
      show_progress_dots: true,
      celebration_on_correct: true,
      break_reminder: true,
    },
  },
  dyslexia: {
    id: "dyslexia",
    label: "Dyslexia Support",
    emoji: "📖",
    icon: BookOpen,
    color: "sky",
    description: "Dyslexia-friendly font, high contrast, extra reading time",
    settings: {
      dyslexia_font: true,
      high_contrast: true,
      reduced_animations: true,
      large_text: true,
      show_timer: false,
      questions_per_session: 8,
      show_progress_dots: true,
      celebration_on_correct: true,
      break_reminder: false,
    },
  },
  cognitive_lite: {
    id: "cognitive_lite",
    label: "Low Cognitive Load",
    emoji: "🧘",
    icon: Brain,
    color: "emerald",
    description: "Calm, minimal UI — one thing at a time, no rush",
    settings: {
      dyslexia_font: false,
      high_contrast: false,
      reduced_animations: true,
      large_text: true,
      show_timer: false,
      questions_per_session: 5,
      show_progress_dots: false,
      celebration_on_correct: false,
      break_reminder: true,
    },
  },
  custom: {
    id: "custom",
    label: "Custom",
    emoji: "🎛️",
    icon: Sliders,
    color: "violet",
    description: "Manually configure every accessibility option",
    settings: null,
  },
};

const colorMap = {
  amber: {
    card: "border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700",
    badge: "bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300",
    icon: "text-amber-500",
  },
  sky: {
    card: "border-sky-300 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-700",
    badge: "bg-sky-100 dark:bg-sky-800/40 text-sky-700 dark:text-sky-300",
    icon: "text-sky-500",
  },
  emerald: {
    card: "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700",
    badge: "bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300",
    icon: "text-emerald-500",
  },
  violet: {
    card: "border-violet-300 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-700",
    badge: "bg-violet-100 dark:bg-violet-800/40 text-violet-700 dark:text-violet-300",
    icon: "text-violet-500",
  },
};

const neutralCard = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800";

export default function CognitiveModeSelector({ activeMode, onChange }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
        Choose Your Mode
      </p>
      {Object.values(COGNITIVE_MODES).map((mode) => {
        const isActive = activeMode === mode.id;
        const colors = colorMap[mode.color];
        return (
          <motion.button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
              isActive ? colors.card : neutralCard
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{mode.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isActive ? colors.icon : "text-slate-700 dark:text-slate-200"}`}>
                    {mode.label}
                  </span>
                  {isActive && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>Active</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
                  {mode.description}
                </p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
