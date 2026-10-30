import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Apple, Download, FileText, Heart, Lightbulb, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadPrintablePdf, type PrintableWorksheet } from "@/lib/printable-pdf";

const title = "Parent Corner — ADHD Tips, Diet, Sleep & Free Worksheets";
const description =
  "Practical ADHD tips, diet suggestions, a sleep routine guide, free downloadable worksheets and blog articles for parents of children with ADHD.";

export const Route = createFileRoute("/parent-corner")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ParentCorner,
});

const guides = [
  {
    icon: Lightbulb,
    title: "ADHD Tips",
    points: [
      "Give one instruction at a time, then ask for it back in their words.",
      "Praise the effort you want repeated, within ten seconds of seeing it.",
      "Use visible timers — time is abstract until a child can watch it move.",
    ],
  },
  {
    icon: Apple,
    title: "Diet Suggestions",
    points: [
      "Protein at breakfast steadies the morning far more than cereal alone.",
      "Keep hydration visible: a marked bottle on the study desk.",
      "Discuss supplements with your paediatrician before changing anything.",
    ],
  },
  {
    icon: Moon,
    title: "Sleep Routine Guide",
    points: [
      "Same wind-down order every night; the sequence matters more than the clock.",
      "Screens off 60 minutes before bed, replaced by a predictable quiet activity.",
      "A short 'worry dump' on paper stops bedtime rumination.",
    ],
  },
];

const worksheets = [
  "Morning routine picture chart",
  "Homework chunking planner",
  "Feelings thermometer",
  "Weekly reward chart",
];

const articles = [
  {
    title: "Why rewards stop working (and how to refresh them)",
    excerpt: "Novelty is fuel for an ADHD brain. Rotate rewards before they go stale.",
    introduction:
      "A reward plan can lose its appeal, or the goal may be too big or too far away. That does not mean your child or the plan has failed.",
    steps: [
      "Choose one small, observable action together, such as starting the first homework problem.",
      "Agree on encouragement your child actually values; it does not need to cost money.",
      "Notice effort soon after it happens, then review together whether the plan still feels motivating.",
    ],
    tryToday: "Ask your child, “What would make this first step feel worth trying?”",
  },
  {
    title: "Talking to your child's school without conflict",
    excerpt: "A simple one-page summary that teachers actually read and act on.",
    introduction:
      "A specific, collaborative conversation can help home and school understand what a child needs without assigning blame.",
    steps: [
      "Write down one or two observable examples and when they tend to happen.",
      "Share something that helps your child get started, stay organised or recover after a hard moment.",
      "Ask what the teacher notices, then agree on one small support to try and a date to check in.",
    ],
    tryToday: "Start with: “We’re hoping to understand what’s getting in the way and find one helpful next step together.”",
  },
  {
    title: "Mornings that don't end in shouting",
    excerpt: "Move three decisions to the night before and watch the pressure drop.",
    introduction:
      "Busy mornings ask children to manage many transitions at once. Making a few steps visible and predictable can reduce the amount everyone has to hold in mind.",
    steps: [
      "The night before, choose clothes, pack the bag and decide on breakfast options.",
      "Put a short picture or written checklist where your child gets ready.",
      "In the morning, give one calm instruction at a time and allow a little extra transition time.",
    ],
    tryToday: "Pick just one morning decision to prepare tonight. You do not need to change the whole routine at once.",
  },
];

function ParentCorner() {
  const [selectedArticle, setSelectedArticle] = useState<(typeof articles)[number] | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<(typeof guides)[number] | null>(null);

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 rounded-[1.75rem] border border-[#dce9d9] bg-[#f1f7ed] p-6 sm:p-8">
          <p className="text-sm font-extrabold tracking-[0.14em] text-[#548362] uppercase">
            Our goal for you
          </p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Leave feeling understood, confident and equipped to support your child.
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            There is no one-size-fits-all approach. Start with one idea that feels right for your
            family, adapt it to your child, and remember that small steps count.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {guides.map((g) => (
            <article key={g.title} className="card-soft p-6">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-sunny-soft text-primary">
                <g.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-bold">{g.title}</h2>
              <Button
                type="button"
                variant="link"
                className="mt-3 h-auto border-t border-border p-0 pt-3 font-bold text-primary"
                onClick={() => setSelectedGuide(g)}
              >
                View tips
              </Button>
            </article>
          ))}
        </div>

        <div className="card-soft mt-8 p-8">
          <h2 className="text-2xl font-bold">Free Downloadable Worksheets</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Printable and ready to stick on the fridge. Ask us for the full pack at your free
            consultation.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {worksheets.map((w) => (
              <li
                key={w}
                className="flex items-center gap-3 rounded-xl border border-border bg-sky-soft/50 px-4 py-3 text-sm font-semibold"
              >
                <Download className="size-4 text-sky" />
                {w}
              </li>
            ))}
          </ul>
        </div>

        <h2 className="mt-16 text-3xl font-extrabold">Blog Articles</h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {articles.map((a) => (
            <article key={a.title} className="card-soft p-6">
              <FileText className="size-5 text-grass" />
              <h3 className="mt-3 text-lg font-bold">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.excerpt}</p>
              <Button
                type="button"
                variant="link"
                className="mt-4 h-auto p-0 font-bold text-primary"
                onClick={() => setSelectedArticle(a)}
              >
                View practical steps
              </Button>
            </article>
          ))}
        </div>
      </section>

      <Dialog
        open={selectedArticle !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedArticle(null);
        }}
      >
        <DialogContent className="fixed inset-0 left-0 top-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-0 p-0 sm:rounded-none">
          {selectedArticle && (
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-6 py-16 sm:px-10 sm:py-20">
              <DialogHeader className="text-left">
                <p className="text-sm font-extrabold tracking-[0.14em] text-grass uppercase">
                  Parents' Corner · Practical guide
                </p>
                <DialogTitle className="mt-3 pr-8 text-3xl leading-tight font-extrabold sm:text-5xl">
                  {selectedArticle.title}
                </DialogTitle>
                <DialogDescription className="mt-3 text-base leading-7">
                  {selectedArticle.excerpt}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-10 space-y-8 text-base leading-8">
                <p className="text-muted-foreground">{selectedArticle.introduction}</p>
                <div>
                  <h3 className="text-xl font-bold">A few steps to try</h3>
                  <ol className="mt-5 grid gap-4">
                    {selectedArticle.steps.map((step, index) => (
                      <li
                        key={step}
                        className="flex gap-4 rounded-2xl border border-border bg-card p-5"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-grass-soft text-sm font-extrabold text-grass">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="rounded-3xl bg-grass-soft/60 p-6 sm:p-8">
                  <h3 className="text-xl font-bold">Try today</h3>
                  <p className="mt-2 text-muted-foreground">{selectedArticle.tryToday}</p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Every child and family is different. Adapt these general ideas to your situation
                  and speak with a qualified professional if you need individual support.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedGuide !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedGuide(null);
        }}
      >
        <DialogContent className="fixed inset-0 left-0 top-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-0 p-0 sm:rounded-none">
          {selectedGuide && (
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-6 py-16 sm:px-10 sm:py-20">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-sunny-soft text-primary">
                <selectedGuide.icon className="size-6" aria-hidden="true" />
              </div>
              <DialogHeader className="mt-6 text-left">
                <p className="text-sm font-extrabold tracking-[0.14em] text-primary uppercase">
                  Parents' Corner · Helpful ideas
                </p>
                <DialogTitle className="mt-3 pr-8 text-3xl leading-tight font-extrabold sm:text-5xl">
                  {selectedGuide.title}
                </DialogTitle>
                <DialogDescription className="mt-3 text-base leading-7">
                  Choose one idea that feels right for your family. Adapt it to your child and take
                  things one step at a time.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-10">
                <h3 className="text-xl font-bold">Ideas to try</h3>
                <ul className="mt-5 grid gap-4">
                  {selectedGuide.points.map((point, index) => (
                    <li
                      key={point}
                      className="flex gap-4 rounded-2xl border border-border bg-card p-5"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-grass-soft text-sm font-extrabold text-grass">
                        {index + 1}
                      </span>
                      <span className="leading-7 text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-8 rounded-3xl bg-grass-soft/60 p-6 text-sm leading-6 text-muted-foreground sm:p-8">
                There is no one-size-fits-all approach. Keep the ideas that help, adapt the ones
                that don't, and reach out to a qualified professional for individual guidance.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <section className="bg-[#eaf4e8] px-5 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#548362]">
              <Heart className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-3xl font-extrabold">You deserve care, too.</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Caring for yourself is part of caring for your family. It does not need to be perfect
              or take a lot of time to matter.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Take one small pause to breathe, stretch or drink water.",
              "Ask a trusted person for one specific kind of help.",
              "Notice and celebrate a small thing that went well today.",
              "Speak to yourself with the patience you offer your child.",
            ].map((item, index) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-white bg-white/80 p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#edf5eb] text-sm font-extrabold text-[#548362]">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl">
          <Button asChild className="rounded-full bg-[#548362] font-bold text-white hover:bg-[#426c50]">
            <Link to="/contact">Talk with our team</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

