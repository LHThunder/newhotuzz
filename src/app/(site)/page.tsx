import Link from "next/link";
import {
  ArrowRight, MapPin, Mail, Github, Sparkles, Quote, Rocket, Compass, Heart, Wrench,
} from "lucide-react";
import { profile } from "@/lib/profile";

// Bảng màu lấy từ các accent của app — tự thích ứng sáng/tối.
const COLORS = [
  "var(--accent-task)", "var(--accent-goal)", "var(--accent-habit)",
  "var(--accent-finance)", "var(--accent-health)", "var(--accent-learning)", "var(--accent-brain)",
];
const color = (i: number) => `hsl(${COLORS[i % COLORS.length]})`;
const soft = (i: number) => `hsl(${COLORS[i % COLORS.length]} / 0.14)`;

export default function HomePage() {
  const p = profile;

  return (
    <div className="relative overflow-hidden">
      {/* Colorful background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 size-[28rem] rounded-full blur-3xl" style={{ background: "hsl(var(--accent-health) / 0.22)" }} />
        <div className="absolute right-[-8rem] top-32 size-[26rem] rounded-full blur-3xl" style={{ background: "hsl(var(--accent-learning) / 0.20)" }} />
        <div className="absolute bottom-0 left-1/3 size-[30rem] rounded-full blur-3xl" style={{ background: "hsl(var(--accent-task) / 0.18)" }} />
      </div>

      <div className="mx-auto max-w-5xl space-y-24 px-5 py-16 md:px-8 md:py-24">
        {/* ── Hero ── */}
        <section className="flex flex-col items-center text-center">
          {p.openToWork && (
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Sẵn sàng cho cơ hội mới
            </span>
          )}

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full blur-2xl" style={{ background: "conic-gradient(from 0deg, hsl(var(--accent-health)), hsl(var(--accent-goal)), hsl(var(--accent-learning)), hsl(var(--accent-task)), hsl(var(--accent-health)))" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photo} alt={p.name} className="size-32 rounded-full object-cover ring-4 ring-background md:size-36" />
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight md:text-6xl">
            Xin chào, mình là{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(120deg, hsl(var(--accent-health)), hsl(var(--accent-goal)), hsl(var(--accent-learning)))" }}
            >
              {p.name}
            </span>
          </h1>
          {p.role && <p className="mt-3 text-lg font-semibold md:text-xl" style={{ color: color(5) }}>{p.role}</p>}
          <p className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg">{p.statement}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {p.location}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${p.email}`}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundImage: "linear-gradient(120deg, hsl(var(--accent-health)), hsl(var(--accent-goal)))" }}
            >
              <Mail className="size-4" /> Liên hệ với mình
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-6 py-3 font-medium backdrop-blur transition-all hover:bg-accent active:scale-[0.98]"
            >
              Vào Personal OS <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* ── Skills ── */}
        {p.skills?.length > 0 && (
          <Section icon={Wrench} title="Kỹ năng" accent={0}>
            <div className="grid gap-4 sm:grid-cols-2">
              {p.skills.map((group, gi) => (
                <div key={group.group} className="rounded-2xl border border-border bg-background/50 p-5 backdrop-blur">
                  <p className="mb-3 text-sm font-semibold" style={{ color: color(gi) }}>{group.group}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((s) => (
                      <span key={s} className="rounded-lg px-2.5 py-1 text-sm font-medium" style={{ background: soft(gi), color: color(gi) }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Currently ── */}
        <Section icon={Compass} title="Hiện tại" accent={5}>
          <div className="grid gap-3 sm:grid-cols-2">
            {p.currently.map((c, i) => (
              <div key={c.label} className="relative overflow-hidden rounded-2xl border border-border bg-background/50 p-5 backdrop-blur">
                <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: color(i) }} />
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: color(i) }}>{c.label}</p>
                <p className="mt-1 font-semibold">{c.value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Projects ── */}
        <Section icon={Rocket} title="Dự án" accent={1}>
          <div className="grid gap-4 sm:grid-cols-3">
            {p.projects.map((pr, i) => (
              <div key={pr.name} className="group relative overflow-hidden rounded-2xl border border-border bg-background/50 backdrop-blur transition-transform hover:-translate-y-1">
                <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color(i)}, ${color(i + 2)})` }} />
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-semibold">{pr.name}</p>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: soft(i), color: color(i) }}>{pr.tag}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{pr.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Timeline ── */}
        {p.timeline?.length > 0 && (
          <Section icon={Sparkles} title="Hành trình" accent={6}>
            <div className="relative ml-2 space-y-6 border-l-2 border-border pl-8">
              {p.timeline.map((t, i) => (
                <div key={t.year} className="relative">
                  <span
                    className="absolute -left-[41px] grid size-6 place-items-center rounded-full text-[10px] font-bold text-white ring-4 ring-background"
                    style={{ background: color(i) }}
                  >
                    ●
                  </span>
                  <p className="text-sm font-bold" style={{ color: color(i) }}>{t.year}</p>
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Values & interests ── */}
        <Section icon={Heart} title="Giá trị & Sở thích" accent={4}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Giá trị cốt lõi</p>
                <div className="flex flex-wrap gap-2">
                  {p.bio.values.map((v, i) => (
                    <span key={v} className="rounded-lg px-3 py-1.5 text-sm font-medium" style={{ background: soft(i), color: color(i) }}>{v}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Sở thích</p>
                <div className="flex flex-wrap gap-2">
                  {p.bio.interests.map((v, i) => (
                    <span key={v} className="rounded-lg px-3 py-1.5 text-sm font-medium" style={{ background: soft(i + 3), color: color(i + 3) }}>{v}</span>
                  ))}
                </div>
              </div>
            </div>
            <div
              className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-border p-6"
              style={{ background: "linear-gradient(135deg, hsl(var(--accent-task) / 0.12), hsl(var(--accent-health) / 0.12))" }}
            >
              <Quote className="size-6" style={{ color: color(0) }} />
              <p className="mt-3 text-lg font-semibold italic leading-relaxed">“{p.bio.quote}”</p>
            </div>
          </div>
        </Section>

        {/* ── Contact CTA ── */}
        <section
          className="relative overflow-hidden rounded-3xl border border-border p-8 text-center md:p-12"
          style={{ background: "linear-gradient(120deg, hsl(var(--accent-health) / 0.16), hsl(var(--accent-goal) / 0.14), hsl(var(--accent-learning) / 0.16))" }}
        >
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Cùng làm điều gì đó tuyệt vời?</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">Mình luôn sẵn sàng cho những dự án và cơ hội thú vị. Kết nối nhé!</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {p.socials.map((s, i) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-5 py-2.5 text-sm font-medium backdrop-blur transition-all hover:-translate-y-0.5"
                style={{ color: color(i) }}
              >
                {s.label === "Email" && <Mail className="size-4" />}
                {s.label === "GitHub" && <Github className="size-4" />}
                {s.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Section({
  icon: Icon, title, accent, children,
}: { icon: typeof Heart; title: string; accent: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl" style={{ background: soft(accent), color: color(accent) }}>
          <Icon className="size-[18px]" />
        </span>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
