import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  LayoutGrid,
  NotebookPen,
  Palette,
  Paperclip,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/contexts/AuthContext";

const stickyNotes = [
  {
    title: "Team sync",
    bullets: ["Decide launch scope", "Share doc with PM", "Follow up Monday"],
    gradient: "from-amber-200/90 via-orange-100/80 to-white/90",
    badge: "Product",
  },
  {
    title: "Personal board",
    bullets: ["Groceries for the week", "Sketch next side idea", "Read: Atomic Habits"],
    gradient: "from-emerald-100/90 via-teal-50/90 to-white/90",
    badge: "Calm",
  },
  {
    title: "Project Delta",
    bullets: ["Attach mockups", "Pin decisions", "Share meeting recap"],
    gradient: "from-sky-100/90 via-cyan-50/90 to-white/90",
    badge: "Work",
  },
  {
    title: "Quick capture",
    bullets: ["Voice note -> text", "Drop screenshots", "Highlight ideas"],
    gradient: "from-rose-100/90 via-amber-50/90 to-white/90",
    badge: "Fast",
  },
];

const featureList = [
  {
    title: "Feels familiar, looks fresh",
    description:
      "Sidebar + card grid, like native Notes with a brighter coat.",
    icon: NotebookPen,
  },
  {
    title: "Color-coded focus",
    description:
      "Warm gradients and sticky-card layouts keep work vs. personal obvious.",
    icon: Palette,
  },
  {
    title: "Files stay close",
    description:
      "Drop docs, screenshots, or clips straight into the note.",
    icon: Paperclip,
  },
  {
    title: "Private by default",
    description:
      "Auth-protected workspace; token stays in your browser.",
    icon: ShieldCheck,
  },
  {
    title: "Built for momentum",
    description:
      "Keyboard actions for new note, save, and quick navigation.",
    icon: Wand2,
  },
  {
    title: "Cloud-ready",
    description:
      "Works in the browser on any device; no install required.",
    icon: Cloud,
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const primaryCta = isAuthenticated ? "/notes" : "/login";
  const secondaryCta = isAuthenticated ? "/notes" : "/register";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#fbbf24,transparent_45%)] opacity-60 blur-3xl" />
        <div className="absolute right-[-12%] top-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_60%_30%,#38bdf8,transparent_45%)] opacity-50 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_40%_60%,#f43f5e,transparent_55%)] opacity-40 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg shadow-amber-500/15 backdrop-blur">
              <Sparkles className="h-5 w-5 text-amber-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">
                Notx
              </p>
              <p className="text-lg font-semibold text-white">Workspace - synced</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#workflow" className="hover:text-white">
              Flow
            </a>
            <a href="#cta" className="hover:text-white">
              Start
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              asChild
            >
              <Link to="/login">Log in</Link>
            </Button>
            <Button
              className="bg-white text-slate-950 shadow-md shadow-white/25 hover:bg-slate-100"
              asChild
            >
              <Link to="/register">Sign up</Link>
            </Button>
          </div>
        </header>

        <main className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70 shadow shadow-white/10">
              <Sparkles className="h-4 w-4 text-amber-200" />
              <span>12 notes - 3 boards - live</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Notx keeps your notes right where you left them.
              </h1>
              <p className="text-lg text-white/70 md:text-xl">
                Private boards, color-coded cards, and attachments that stay in your workspace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-amber-200 via-orange-400 to-rose-400 px-6 py-3 text-slate-950 shadow-lg shadow-orange-400/30 transition hover:-translate-y-[2px]"
                asChild
              >
                <Link to={primaryCta}>
                  {isAuthenticated ? "Open your workspace" : "Start capturing"}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/10 px-6 py-3 text-white backdrop-blur hover:bg-white/15"
                asChild
              >
                <Link to={secondaryCta}>
                  {isAuthenticated ? "See my notes" : "Create a free account"}
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span>Private, authenticated space</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-sky-200" />
                <span>Attachments stay with your notes</span>
              </div>
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-amber-200" />
                <span>Sticky-note colors that spark focus</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="absolute -right-6 bottom-10 h-32 w-32 rounded-full bg-sky-200/40 blur-3xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-900/40 backdrop-blur">
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-300" />
                <div className="ml-auto flex items-center gap-2 text-xs text-white/60">
                  <Sparkles className="h-4 w-4 text-amber-200" />
                  Live sync on
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {stickyNotes.map((note) => (
                  <div
                    key={note.title}
                    className={`group relative overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br p-4 text-slate-900 shadow-lg shadow-slate-900/10 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20 ${note.gradient}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">{note.title}</p>
                      <span className="rounded-full bg-slate-900/10 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                        {note.badge}
                      </span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-800/80">
                      {note.bullets.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-700/80">
                      <Paperclip className="h-4 w-4" />
                      Drop files, photos, voice notes
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/70 to-transparent opacity-0 transition group-hover:opacity-70" />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300/20 text-amber-100">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Board view</p>
                    <p className="text-xs text-white/60">
                      Stack, pin, and color-code ideas like sticky tiles.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-white text-slate-900 shadow-sm shadow-white/30 hover:bg-slate-100"
                  asChild
                >
                  <Link to={primaryCta}>Open board</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>

        <section id="features" className="mt-16 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Workspace features</p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureList.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-900/30 transition hover:-translate-y-1 hover:bg-white/10"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="workflow"
          className="mt-14 grid gap-5 rounded-3xl border border-white/10 bg-gradient-to-r from-amber-100/10 via-white/5 to-sky-100/10 p-6 text-white shadow-2xl shadow-slate-900/40 backdrop-blur lg:grid-cols-3"
        >
          <div className="lg:col-span-1">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">
              Current flow
            </p>
            <h3 className="mt-3 text-2xl font-semibold">
              Capture, color, share-same workspace.
            </h3>
            <p className="mt-2 text-white/70">
              Drop files, tag with color, switch between personal and work boards.
            </p>
          </div>
          <div className="lg:col-span-2 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Capture instantly",
                text: "Type, paste images, or drag files; it's saved as you go.",
                icon: NotebookPen,
              },
              {
                title: "Organize with color",
                text: "Soft gradients separate projects without visual noise.",
                icon: Palette,
              },
              {
                title: "Stay in control",
                text: "Auth-protected workspace; only you see your notes.",
                icon: ShieldCheck,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-md shadow-slate-900/30"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-base font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="cta"
          className="mt-14 flex flex-col items-start gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 via-amber-100/15 to-sky-100/15 px-6 py-7 shadow-2xl shadow-slate-900/40 backdrop-blur md:flex-row md:items-center md:justify-between"
        >
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Ready when you are
            </p>
            <h3 className="text-2xl font-semibold text-white">
              Open a new note and feel at home immediately.
            </h3>
            <p className="text-sm text-white/70">
              Familiar layout, calming gradients, and attachments that stay right where you need them.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-white text-slate-900 shadow-md shadow-white/25 hover:bg-slate-100"
              asChild
            >
              <Link to={primaryCta}>Open workspace</Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              asChild
            >
              <Link to="/register">Create account</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
