import { type FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, BookOpen, Gamepad2, Users, Star, HeartHandshake, Timer, Trophy } from "lucide-react";
import heroKids from "@/assets/hero-kids.jpg";
import { Button } from "@/components/ui/button";
import { sendFeedback } from "@/lib/feedback";

const title = "MindBloom ADHD Kids — Learn, Grow & Shine";
const description =
  "Engaging learning activities, parent guidance and personalized support helping children with ADHD build confidence, focus and life skills.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

const highlights = [
  { icon: HeartHandshake, label: "Personalized Learning" },
  { icon: Users, label: "Parent Support" },
  { icon: Gamepad2, label: "Interactive Games" },
  { icon: Trophy, label: "Progress Tracking" },
];

const services = [
  { icon: Brain, title: "ADHD Coaching", text: "One-on-one sessions that build focus, routine and self-belief." },
  { icon: BookOpen, title: "Homework Help", text: "Small steps, timers and checklists that make study time calmer." },
  { icon: Gamepad2, title: "Brain Games", text: "Attention, memory and puzzle play designed by specialists." },
  { icon: Users, title: "Parent Guidance", text: "Practical training so support continues at home every day." },
];

const testimonials = [
  {
    quote:
      "Aarav used to melt down over homework. Six weeks in, he sets his own timer and finishes maths before dinner.",
    name: "Priya S., parent of a 9-year-old",
  },
  {
    quote:
      "The parent training changed how we talk at home. Fewer arguments, far more wins worth celebrating.",
    name: "Rahul & Meera, Pune",
  },
  {
    quote:
      "The focus games feel like play to my daughter, but her teacher noticed the difference in class first.",
    name: "Fatima K., Hyderabad",
  },
];

function Index() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

  async function handleFeedbackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSendingFeedback(true);
    setFeedbackStatus("");

    try {
      const result = await sendFeedback({ data: { feedback, rating } });
      if (result.success) {
        setFeedback("");
        setRating(0);
        setFeedbackStatus("Thank you! Your feedback has been sent.");
      } else if (result.reason === "not_configured") {
        setFeedbackStatus("Feedback email is temporarily unavailable. Please try again later.");
      } else if (result.reason === "sender_rejected") {
        setFeedbackStatus(
          "Feedback couldn't be sent due to an email configuration issue. Please try again later.",
        );
      } else if (result.reason === "network_error") {
        setFeedbackStatus("Couldn't connect to the feedback email service. Please try again.");
      } else {
        setFeedbackStatus("The email service couldn't accept your feedback. Please try again later.");
      }
    } catch (error) {
      console.error("Feedback submission failed", {
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      setFeedbackStatus("We couldn't send your feedback. Please try again later.");
    } finally {
      setSendingFeedback(false);
    }
  }

  return (
    <>
      <section className="hero-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-grass-soft px-4 py-1.5 text-xs font-bold tracking-wide text-accent-foreground uppercase">
              <Star className="size-3.5" /> Evidence-informed, family-first
            </span>
            <h1 className="mt-5 text-4xl leading-tight font-extrabold sm:text-6xl">
              Helping Every Child Learn, Grow &amp; Shine
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Every child learns differently. At MindBloom ADHD (Attention-deficit/Hyperactivity
              Disorder) Kids we provide engaging learning activities, parent guidance and
              personalized support to help children with ADHD build confidence, focus and life
              skills.
            </p>

            <ul className="mt-8 flex max-w-[980px] flex-wrap items-center gap-4 rounded-[2rem] border border-border bg-[#f5f0d1]/80 p-4 shadow-sm">
              {highlights.map((h) => (
                <li key={h.label} className="flex min-w-[180px] flex-1 items-center gap-3 rounded-full">
                  <span className="flex size-11 items-center justify-center rounded-full bg-[#f1d785] text-primary shadow-inner">
                    <h.icon className="size-5" />
                  </span>
                  <span className="text-lg font-bold leading-none">{h.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full font-bold">
                <Link to="/contact">Book a Free Consultation</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-full font-bold">
                <Link to="/activities">Start Activities</Link>
              </Button>
            </div>
          </div>
          <img
            src={heroKids}
            width={1600}
            height={1104}
            alt="Illustration of children reading, building blocks and solving puzzles together"
            className="rounded-[2rem] bg-card"
          />
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-5">
        <h2 className="text-3xl font-extrabold">Our Services</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Support built around your child's strengths, delivered by psychologists, special educators
          and occupational therapists.
        </p>

        <div className="mt-8 flex w-full flex-col gap-5">
          {services.map((s) => (
            <article
              key={s.title}
              className="box-border flex w-full items-start gap-5 rounded-[2rem] border border-sky-100 bg-[#f4fbff] p-6 shadow-sm"
            >
              <span className="mt-1 flex size-16 shrink-0 items-center justify-center rounded-full bg-[#d9f3ff] text-sky-700">
                <s.icon className="size-8" />
              </span>
              <div className="flex-1">
                <h3 className="text-2xl font-extrabold leading-tight text-slate-900">{s.title}</h3>
                <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-700">{s.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <Button asChild variant="secondary" className="rounded-full font-bold">
            <Link to="/services">See all services</Link>
          </Button>
        </div>
      </section>

      <section className="mt-20 border-y border-border bg-grass-soft/50 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-extrabold">Feedback</h2>
            <div className="flex gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                    onClick={() => setRating(value)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-5 ${value <= rating ? "fill-current" : "fill-transparent"}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <form
            onSubmit={handleFeedbackSubmit}
            className="mb-8 flex items-center gap-3 rounded-full border border-border bg-white/80 px-4 py-3 shadow-sm"
          >
            <input
              type="text"
              name="feedback"
              value={feedback}
              onChange={(event) => {
                setFeedback(event.target.value);
                setFeedbackStatus("");
              }}
              required
              maxLength={2000}
              disabled={sendingFeedback}
              placeholder="Type your feedback..."
              className="w-full border-0 bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <Button
              type="submit"
              size="sm"
              className="rounded-full font-bold"
              disabled={!feedback.trim() || sendingFeedback}
            >
              {sendingFeedback ? "Sending..." : "Send"}
            </Button>
          </form>
          {feedbackStatus && (
            <p role="status" aria-live="polite" className="mb-8 text-sm text-muted-foreground">
              {feedbackStatus}
            </p>
          )}

        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-5">
        <div className="card-soft flex flex-col items-center gap-5 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-sunny-soft text-primary">
            <Timer className="size-6" />
          </span>
          <h2 className="text-3xl font-extrabold">Ready for a calmer week at home?</h2>
          <p className="max-w-xl text-muted-foreground">
            Start with a free 20-minute consultation. We'll listen, share two strategies you can try
            tonight, and suggest a plan only if it truly fits your family.
          </p>
          <Button asChild size="lg" className="rounded-full font-bold">
            <Link to="/contact">Book a Free Consultation</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
