import Link from "next/link";
import { ArrowRight, MapPin, Mail } from "lucide-react";
import { profile } from "@/lib/profile";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const p = profile;
  return (
    <div className="mx-auto max-w-4xl space-y-16 px-5 py-14 md:px-8 md:py-20">
      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.photo} alt={p.name} className="size-28 rounded-full object-cover ring-2 ring-border md:size-32" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-5xl">
          Xin chào, mình là <span className="text-gradient">{p.name}</span>
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg">{p.statement}</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" /> {p.location}
        </p>
        <Link
          href="/dashboard"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-glow transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          Enter My Personal OS <ArrowRight className="size-4" />
        </Link>
      </section>

      {/* About snippet */}
      <section>
        <SectionTitle>About</SectionTitle>
        <p className="mt-3 leading-relaxed text-muted-foreground">{p.about}</p>
        <Link href="/about" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Đọc thêm về mình <ArrowRight className="size-3.5" />
        </Link>
      </section>

      {/* Currently */}
      <section>
        <SectionTitle>Currently</SectionTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {p.currently.map((c) => (
            <Card key={c.label}>
              <CardContent className="pt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
                <p className="mt-0.5 font-medium">{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section>
        <SectionTitle>Projects</SectionTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {p.projects.map((pr) => (
            <Card key={pr.name}>
              <CardContent className="pt-5">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-semibold">{pr.name}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{pr.tag}</span>
                </div>
                <p className="text-sm text-muted-foreground">{pr.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section>
        <SectionTitle>Contact</SectionTitle>
        <div className="mt-4 flex flex-wrap gap-2">
          {p.socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="glass ring-hairline flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm hover:bg-accent/40"
            >
              {s.label === "Email" && <Mail className="size-4" />}
              {s.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">{children}</h2>;
}
