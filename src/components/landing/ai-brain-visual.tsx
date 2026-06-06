"use client";

import { motion } from "framer-motion";
import {
  Brain,
  ClipboardList,
  Target,
  MessageCircle,
  BookOpen,
  Users,
} from "lucide-react";

const nodes = [
  { icon: ClipboardList, label: "Assessments", x: "8%", y: "18%", delay: 0 },
  { icon: Target, label: "Goals", x: "78%", y: "12%", delay: 0.15 },
  { icon: MessageCircle, label: "AI Coach", x: "82%", y: "58%", delay: 0.3 },
  { icon: BookOpen, label: "Vault", x: "12%", y: "62%", delay: 0.45 },
  { icon: Users, label: "Networks", x: "50%", y: "82%", delay: 0.6 },
];

export function AiBrainVisual() {
  return (
    <div className="relative mx-auto aspect-square max-w-lg w-full">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600/20 via-transparent to-teal-500/20 blur-2xl" />
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full border border-violet-500/40 bg-violet-600/10 shadow-[0_0_80px_rgba(139,92,246,0.35)]"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Brain className="h-14 w-14 sm:h-16 sm:w-16 text-violet-300" />
      </motion.div>

      {nodes.map(({ icon: Icon, label, x, y, delay }) => (
        <motion.div
          key={label}
          className="absolute flex flex-col items-center gap-1.5"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + delay, duration: 0.5 }}
        >
          <motion.div
            className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon className="h-5 w-5 text-teal-400" />
          </motion.div>
          <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">{label}</span>
        </motion.div>
      ))}

      <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-30" aria-hidden>
        <line x1="50%" y1="50%" x2="15%" y2="25%" stroke="url(#lineGrad)" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="85%" y2="20%" stroke="url(#lineGrad)" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="88%" y2="65%" stroke="url(#lineGrad)" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="18%" y2="68%" stroke="url(#lineGrad)" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="50%" y2="88%" stroke="url(#lineGrad)" strokeWidth="1" />
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
