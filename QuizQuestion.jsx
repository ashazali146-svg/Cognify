import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuizQuestion({ question, options, correctAnswer, explanation, questionNumber, totalQuestions, onAnswer, modePrefs = {} }) {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (option) => {
    if (showResult) return;
    setSelected(option);
  };

  const handleSubmit = () => {
    if (!selected) return;
    setShowResult(true);
  };

  const handleNext = () => {
    onAnswer(selected, selected === correctAnswer);
    setSelected(null);
    setShowResult(false);
    setShowExplanation(false);
  };

  const isCorrect = selected === correctAnswer;
  const largeText = modePrefs.large_text;
  const dyslexiaFont = modePrefs.dyslexia_font;
  const reducedMotion = modePrefs.reduced_animations;
  const celebrate = modePrefs.celebration_on_correct !== false;
  const showDots = modePrefs.show_progress_dots !== false;

  const getOptionStyle = (option) => {
    if (!showResult) {
      if (selected === option)
        return "border-sky-400 bg-sky-50 dark:bg-sky-900/30 ring-2 ring-sky-200 dark:ring-sky-700";
      return "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-sky-200 dark:hover:border-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-900/20";
    }
    if (option === correctAnswer)
      return "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 ring-2 ring-emerald-200 dark:ring-emerald-700";
    if (selected === option && !isCorrect)
      return "border-red-300 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-200 dark:ring-red-800";
    return "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-50";
  };

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reducedMotion ? {} : { opacity: 0, x: -30 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
      className={`w-full ${dyslexiaFont ? "font-mono tracking-wide" : ""}`}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Question {questionNumber} of {totalQuestions}</span>
        {showDots && (
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i < questionNumber
                    ? "bg-amber-400"
                    : i === questionNumber - 1
                    ? "bg-sky-400"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
        )}
        </div>
        <h2 className={`font-semibold text-slate-800 dark:text-slate-100 leading-relaxed tracking-wide ${largeText ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"}`}>
          {question}
        </h2>
      </div>

      <div className="space-y-3 mb-6">
        {options.map((option, idx) => (
          <motion.button
            key={idx}
            onClick={() => handleSelect(option)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${getOptionStyle(option)}`}
            whileTap={!showResult ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-base text-slate-700 dark:text-slate-200 leading-relaxed tracking-wide">{option}</span>
              {showResult && option === correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto flex-shrink-0" />
              )}
              {showResult && selected === option && !isCorrect && (
                <XCircle className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-4 ${
              isCorrect
                ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {isCorrect ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{celebrate ? "🎉 Great job!" : "✓ Correct!"}</span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 font-semibold">💡 Not quite — keep going!</span>
              )}
            </div>
            {!showExplanation && explanation && (
              <button
                onClick={() => setShowExplanation(true)}
                className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mt-1"
              >
                <Lightbulb className="w-3.5 h-3.5" /> See explanation
              </button>
            )}
            {showExplanation && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed tracking-wide">{explanation}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!selected}
            className="rounded-xl px-6 bg-sky-500 hover:bg-sky-600 text-white"
          >
            Check Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="rounded-xl px-6 bg-amber-500 hover:bg-amber-600 text-white"
          >
            Continue <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
