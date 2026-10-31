import { useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain,
  BookOpen,
  Gamepad2,
  Users,
  Star,
  Timer,
} from "lucide-react";
import heroKids from "@/assets/hero-kids.jpg";
import { Button } from "@/components/ui/button";
import { sendFeedback } from "@/lib/feedback";

const title = "MindBloom ADHD Kids — Learn, Grow & Shine";
const description =
  "Engaging learning activities, parent guidance and personalized support helping children with Attention-Deficit/Hyperactivity Disorder (ADHD) build confidence, focus and life skills.";

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

const services = [
  {
    icon: Brain,
    title: "ADHD Coaching",
    text: "One-on-one sessions that build focus, routine and self-belief.",
  },
  {
    icon: BookOpen,
    title: "Homework Help",
    text: "Small steps, timers and checklists that make study time calmer.",
  },
  {
    icon: Gamepad2,
    title: "Brain Games",
    text: "Attention, memory and puzzle play designed by specialists.",
  },
  {
    icon: Users,
    title: "Parent Guidance",
    text: "Practical training so support continues at home every day.",
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
        setFeedbackStatus("Thank you! Your feedback has been sent.");
      } else if (result.reason === "not_configured") {
        setFeedbackStatus(
          "Feedback email isn't configured. The site owner needs to add the Resend API key and sender address.",
        );
      } else if (result.reason === "api_key_rejected") {
        setFeedbackStatus(
          "The feedback email API key was rejected. The site owner needs to replace the Resend key.",
        );
      } else if (result.reason === "sender_rejected") {
        setFeedbackStatus(
          "The sender address wasn't accepted. The site owner needs to verify the sender domain in Resend.",
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
            <h1 className="mt-5 text-4xl leading-tight font-extrabold sm:text-6xl">
              Helping Every Child Learn, Grow &amp; Shine
            </h1>

            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Every child learns differently. At MindBloom ADHD Kids we provide engaging learning
              activities, parent guidance and personalized support to help children with ADHD build
              confidence, focus and life skills.
            </p>
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
        <h2 className="text-3xl font-extrabold">How MindBloom Helps Your Child</h2>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Four building blocks that work together — playful practice for your child, practical
          support for you.
        </p>
        <div className="mt-8 grid gap-5">
          {services.map((s) => (
            <article key={s.title} className="card-soft p-6">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-sky-soft text-sky">
                <s.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <Button asChild size="lg" className="rounded-full font-bold">
            <Link to="/activities">Explore Activities</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-5">
        <div className="rounded-3xl bg-grass-soft/60 p-6 sm:p-8">
          <h2 className="text-3xl font-extrabold">Feedback</h2>
          <form
            onSubmit={handleFeedbackSubmit}
            className="mt-6 flex items-center gap-3 rounded-full border border-border bg-white/80 px-4 py-3 shadow-sm"
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
              aria-label="Your feedback"
              className="w-full border-0 bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <div
              role="group"
              aria-label="Rate your experience"
              className="flex shrink-0 items-center gap-1"
            >
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Rate ${value} out of 5`}
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                    className="rounded-sm text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <Star className={`size-5 ${rating >= value ? "fill-current" : ""}`} />
                  </button>
                );
              })}
            </div>
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
            <p role="status" aria-live="polite" className="mt-3 text-sm text-muted-foreground">
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

          <h2 className="text-3xl font-extrabold">
            Ready for a calmer week at home?
          </h2>

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
