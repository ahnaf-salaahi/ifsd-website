"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "TRAIN",
    desc: "Skills, leadership & media training programmes.",
  },
  {
    n: "02",
    title: "GUIDE",
    desc: "One-to-one mentoring & career counselling.",
  },
  {
    n: "03",
    title: "FUND",
    desc: "Scholarship access — Sri Lanka & abroad.",
  },
  {
    n: "04",
    title: "ACHIEVE",
    desc: "University admission & future-ready careers.",
  },
];

export default function HeroJourney() {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-0">
      {steps.map((step, i) => (
        <div key={step.n} className="contents">
          <div className="md:flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="flex flex-col"
            >
              <span className="font-[family-name:var(--font-mono)] text-xs text-amber-400 tracking-widest">
                {step.n}
              </span>
              <span className="font-[family-name:var(--font-display)] text-white text-lg md:text-xl font-semibold mt-1">
                {step.title}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 + 0.1 }}
              className="text-slate-400 text-sm leading-relaxed mt-3 max-w-[240px]"
            >
              {step.desc}
            </motion.p>
          </div>

          {i < steps.length - 1 && (
            <>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 + 0.25 }}
                style={{ originX: 0 }}
                className="hidden md:block h-px bg-gradient-to-r from-rose-500/60 to-amber-400/30 mt-2 mx-4 self-start w-8 lg:w-16"
              />
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 + 0.25 }}
                style={{ originY: 0 }}
                className="md:hidden w-px bg-gradient-to-b from-rose-500/60 to-amber-400/30 ml-2 h-6"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
