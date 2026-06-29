import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, Type, Sparkles, Timer, BookOpen } from "lucide-react";

export default function AccessibilityPanel({ preferences, onChange }) {
  const prefs = preferences || {};

  const toggle = (key) => {
    onChange({ ...prefs, [key]: !prefs[key] });
  };

  const options = [
    { key: "dyslexia_font", icon: BookOpen, label: "Dyslexia-friendly font", desc: "Uses a clearer, more readable typeface" },
    { key: "high_contrast", icon: Eye, label: "High contrast", desc: "Stronger color contrast for readability" },
    { key: "large_text", icon: Type, label: "Large text", desc: "Bigger text throughout the app" },
    { key: "reduced_animations", icon: Sparkles, label: "Reduce animations", desc: "Fewer moving elements on screen" },
    { key: "show_timer", icon: Timer, label: "Show timer", desc: "Display time spent on each question" },
  ];

  return (
    <div className="space-y-4">
      {options.map(({ key, icon: Icon, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
              <Icon className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</Label>
              <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>
            </div>
          </div>
          <Switch checked={!!prefs[key]} onCheckedChange={() => toggle(key)} />
        </div>
      ))}
    </div>
  );
}
