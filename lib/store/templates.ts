import type { TemplateTheme } from "./types";

export const templateColors: Record<string, TemplateTheme> = {
  g1: { bg: "bg-zinc-900", text: "text-white", accent: "text-amber-400", card: "bg-zinc-800", nav: "bg-zinc-900/80" },
  g2: { bg: "bg-emerald-50", text: "text-emerald-950", accent: "text-emerald-600", card: "bg-white", nav: "bg-emerald-50/80" },
  g3: { bg: "bg-red-500", text: "text-white", accent: "text-white", card: "bg-red-600", nav: "bg-red-500/80" },
  g4: { bg: "bg-orange-100", text: "text-orange-950", accent: "text-orange-600", card: "bg-white", nav: "bg-orange-100/80" },
  r1: { bg: "bg-slate-900", text: "text-white", accent: "text-blue-400", card: "bg-slate-800", nav: "bg-slate-900/80" },
  r2: { bg: "bg-stone-100", text: "text-stone-900", accent: "text-stone-600", card: "bg-white", nav: "bg-stone-100/80" },
  r3: { bg: "bg-amber-200", text: "text-amber-950", accent: "text-amber-700", card: "bg-amber-100", nav: "bg-amber-200/80" },
  r4: { bg: "bg-blue-600", text: "text-white", accent: "text-blue-200", card: "bg-blue-700", nav: "bg-blue-600/80" },
  rl1: { bg: "bg-black", text: "text-white", accent: "text-yellow-500", card: "bg-zinc-900", nav: "bg-black/80" },
  rl2: { bg: "bg-slate-200", text: "text-slate-900", accent: "text-slate-600", card: "bg-white", nav: "bg-slate-200/80" },
  rl3: { bg: "bg-blue-900", text: "text-white", accent: "text-blue-300", card: "bg-blue-800", nav: "bg-blue-900/80" },
  rl4: { bg: "bg-stone-800", text: "text-stone-100", accent: "text-stone-400", card: "bg-stone-700", nav: "bg-stone-800/80" },
  z1: { bg: "bg-white", text: "text-black", accent: "text-slate-500", card: "bg-slate-50", nav: "bg-white/80" },
  z2: { bg: "bg-slate-800", text: "text-white", accent: "text-slate-300", card: "bg-slate-700", nav: "bg-slate-800/80" },
  z3: { bg: "bg-lime-400", text: "text-black", accent: "text-lime-800", card: "bg-lime-300", nav: "bg-lime-400/80" },
  z4: { bg: "bg-amber-800", text: "text-amber-50", accent: "text-amber-300", card: "bg-amber-900", nav: "bg-amber-800/80" },
  ri1: { bg: "bg-rose-100", text: "text-rose-950", accent: "text-rose-600", card: "bg-white", nav: "bg-rose-100/80" },
  ri2: { bg: "bg-slate-100", text: "text-slate-900", accent: "text-slate-500", card: "bg-white", nav: "bg-slate-100/80" },
  ri3: { bg: "bg-black", text: "text-white", accent: "text-rose-500", card: "bg-zinc-900", nav: "bg-black/80" },
  ri4: { bg: "bg-teal-600", text: "text-white", accent: "text-teal-200", card: "bg-teal-700", nav: "bg-teal-600/80" },
  n1: { bg: "bg-cyan-600", text: "text-white", accent: "text-cyan-200", card: "bg-cyan-700", nav: "bg-cyan-600/80" },
  n2: { bg: "bg-green-800", text: "text-green-50", accent: "text-green-300", card: "bg-green-900", nav: "bg-green-800/80" },
  n3: { bg: "bg-gradient-to-br from-orange-400 to-rose-500", text: "text-white", accent: "text-orange-200", card: "bg-white/10", nav: "bg-orange-400/80" },
  n4: { bg: "bg-slate-50", text: "text-slate-800", accent: "text-indigo-600", card: "bg-white", nav: "bg-slate-50/80" },
  n5: { bg: "bg-fuchsia-900", text: "text-fuchsia-400", accent: "text-fuchsia-400", card: "bg-fuchsia-950", nav: "bg-fuchsia-900/80" },
  n6: { bg: "bg-amber-100", text: "text-amber-900", accent: "text-amber-700", card: "bg-white", nav: "bg-amber-100/80" },
  default: { bg: "bg-[#0f1115]", text: "text-white", accent: "text-emerald-500", card: "bg-[#15181e]", nav: "bg-[#0f1115]/80" },
};

export const lightThemes = [
  "g2", "g4", "r2", "r3", "rl2", "z1",
  "ri1", "ri2", "n4", "n6",
];

export function getTheme(template: string): TemplateTheme {
  return templateColors[template] || templateColors.default;
}

export function isLight(template: string): boolean {
  return lightThemes.includes(template);
}