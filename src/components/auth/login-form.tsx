"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, Github, Chrome, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signUp, signInWithOAuth } from "@/server/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    if (!isSupabaseConfigured) {
      // Scaffold mode: no backend — go straight to the dashboard.
      window.location.href = mode === "signup" ? "/onboarding" : "/";
      return;
    }
    setPending(true);
    const action = mode === "login" ? signIn : signUp;
    const res = await action(null, formData);
    setPending(false);
    if (res && !res.ok) setError(res.error);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong ring-hairline w-full max-w-md rounded-3xl p-8 shadow-glass"
    >
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
          <Sparkles className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản LIFE OS"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hệ điều hành cho cuộc sống của bạn.
        </p>
      </div>

      <form action={onSubmit} className="space-y-3">
        {mode === "signup" && (
          <Field icon={User} name="name" type="text" placeholder="Tên của bạn" />
        )}
        <Field icon={Mail} name="email" type="email" placeholder="Email" />
        <Field icon={Lock} name="password" type="password" placeholder="Mật khẩu" />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="h-11 w-full" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> hoặc <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="glass" className="h-11" onClick={() => signInWithOAuth("google")}>
          <Chrome className="size-4" /> Google
        </Button>
        <Button variant="glass" className="h-11" onClick={() => signInWithOAuth("github")}>
          <Github className="size-4" /> GitHub
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
          className="font-medium text-primary hover:underline"
        >
          {mode === "login" ? "Đăng ký" : "Đăng nhập"}
        </button>
      </p>

      {!isSupabaseConfigured && (
        <p className="mt-4 text-center text-[11px] text-muted-foreground/70">
          Chế độ demo — chưa cấu hình Supabase. Nhấn nút để vào thẳng dashboard.
        </p>
      )}
      <p className="mt-2 text-center text-[11px]">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Bỏ qua & xem dashboard →
        </Link>
      </p>
    </motion.div>
  );
}

function Field({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: typeof Mail }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="h-11 pl-10" {...props} />
    </div>
  );
}
