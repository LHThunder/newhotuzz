import { MapPin, Briefcase, Home, GraduationCap, Quote } from "lucide-react";
import { profile } from "@/lib/profile";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "About — LIFE OS" };

export default function AboutPage() {
  const p = profile;
  return (
    <div className="mx-auto max-w-3xl space-y-12 px-5 py-14 md:px-8 md:py-20">
      {/* Header */}
      <header className="flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.photo} alt={p.name} className="size-24 rounded-full object-cover ring-2 ring-border" />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">{p.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
      </header>

      {/* Bio grid */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <InfoTile icon={Briefcase} label="Công việc" value={p.bio.occupation} />
        <InfoTile icon={MapPin} label="Hiện sống ở" value={p.location} />
        <InfoTile icon={Home} label="Quê" value={p.bio.hometown} />
        <InfoTile icon={GraduationCap} label="Học vấn" value={p.bio.education} />
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">Giới thiệu</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{p.about}</p>
      </section>

      {/* Values & interests */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">Giá trị</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.bio.values.map((v) => <Tag key={v}>{v}</Tag>)}
          </div>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">Sở thích</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.bio.interests.map((v) => <Tag key={v}>{v}</Tag>)}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section>
        <Card>
          <CardContent className="flex items-start gap-3 pt-5">
            <Quote className="size-5 shrink-0 text-primary" />
            <p className="italic text-muted-foreground">"{p.bio.quote}"</p>
          </CardContent>
        </Card>
      </section>

      {/* Timeline */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">Hành trình</h2>
        <div className="mt-5 space-y-0">
          {p.timeline.map((t, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{t.year}</span>
                {i < p.timeline.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
              </div>
              <div className="pb-6">
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <Card className="p-4">
      <Icon className="size-4 text-primary" />
      <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </Card>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-sm text-muted-foreground">{children}</span>;
}
