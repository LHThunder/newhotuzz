"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Check, Target, Repeat, Wallet,
  HeartPulse, GraduationCap, Brain, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const focusAreas = [
  { key: "goals", label: "Mục tiêu", icon: Target, color: "--accent-goal" },
  { key: "habits", label: "Thói quen", icon: Repeat, color: "--accent-habit" },
  { key: "finance", label: "Tài chính", icon: Wallet, color: "--accent-finance" },
  { key: "health", label: "Sức khoẻ", icon: HeartPulse, color: "--accent-health" },
  { key: "learning", label: "Học tập", icon: GraduationCap, color: "--accent-learning" },
  { key: "brain", label: "Kiến thức", icon: Brain, color: "--accent-brain" },
];

const steps = ["name", "focus", "goal"] as const;

export function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>(["goals", "habits"]);
  const [firstGoal, setFirstGoal] = useState("");

  const next = () => (step < steps.length - 1 ? setStep(step + 1) : router.push("/"));
  const back = () => setStep(Math.max(0, step - 1));
  const toggle = (k: string) =>
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  return (
    <div className="glass-strong ring-hairline w-full max-w-lg rounded-3xl p-8 shadow-glass">
      {/* Progress dots */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {steps.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === step ? "w-8 bg-primary" : i < step ? "w-8 bg-primary/40" : "w-4 bg-muted",
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 0 && (
            <div className="text-center">
              <Emoji>👋</Emoji>
              <h2 className="mt-3 text-xl font-semibold">Chào bạn! Tên bạn là gì?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Để LIFE OS chào bạn mỗi ngày.</p>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Tùng"
                className="mt-5 h-12 text-center text-lg"
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="text-center">
                <Emoji>🎯</Emoji>
                <h2 className="mt-3 text-xl font-semibold">Bạn muốn tập trung vào đâu?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Chọn các lĩnh vực quan trọng nhất.</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {focusAreas.map((a) => {
                  const on = picked.includes(a.key);
                  return (
                    <button
                      key={a.key}
                      onClick={() => toggle(a.key)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all",
                        on ? "border-primary/50 bg-primary/10" : "border-border hover:bg-accent/40",
                      )}
                    >
                      {on && (
                        <span className="absolute right-2 top-2 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </span>
                      )}
                      <a.icon className="size-6" style={{ color: `hsl(var(${a.color}))` }} />
                      <span className="text-xs font-medium">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <Emoji>🚀</Emoji>
              <h2 className="mt-3 text-xl font-semibold">Mục tiêu đầu tiên của bạn?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Một điều bạn muốn đạt được trong 90 ngày tới.</p>
              <Input
                autoFocus
                value={firstGoal}
                onChange={(e) => setFirstGoal(e.target.value)}
                placeholder="Ví dụ: Ra mắt sản phẩm đầu tiên"
                className="mt-5 h-12 text-center"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 0} className="gap-1.5">
          <ArrowLeft className="size-4" /> Quay lại
        </Button>
        <Button onClick={next} disabled={step === 0 && !name.trim()} className="gap-1.5">
          {step === steps.length - 1 ? (
            <>Bắt đầu <Sparkles className="size-4" /></>
          ) : (
            <>Tiếp tục <ArrowRight className="size-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

function Emoji({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-3xl">
      {children}
    </div>
  );
}
