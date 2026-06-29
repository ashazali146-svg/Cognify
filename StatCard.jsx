import React from "react";

export default function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    blue: "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
    green: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    orange: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    purple: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  };

  return (
    <div className="bg-white dark:bg-slate-700/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-600 shadow-sm">
      <div className={`w-9 h-9 rounded-xl ${colorMap[color] || colorMap.blue} flex items-center justify-center mb-2.5`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
