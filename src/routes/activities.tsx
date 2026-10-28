import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Award,
  Brain,
  Check,
  Palette,
  Puzzle,
  Search,
  Sparkles,
  Timer,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

const title = "Interactive Activities — Focus, Memory & Calm for ADHD Kids";
const description =
  "Attention games, memory challenges, brain puzzles, a reward system, a daily habit tracker and calm breathing exercises children can use today.";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Activities,
});

type GameId = "color" | "memory" | "odd";

type ActivityCard = {
  title: string;
  text: string;
  category: string;
  icon_key: string;
};

const CARD_HINTS: Record<string, string> = {
  focus: "Play this game",
  memory: "Play this game",
  thinking: "Start the quiz",
  reward: "See your stars",
};

const FALLBACK_CARDS: ActivityCard[] = [
  { title: "Attention Games", text: "Spot-the-change and sorting challenges in 3-minute rounds.", category: "focus", icon_key: "brain" },
  { title: "Memory Challenges", text: "Card pairs and sequence recall that get harder as skills grow.", category: "memory", icon_key: "puzzle" },
  { title: "Brain Puzzles", text: "Logic and pattern puzzles for a quick, satisfying win.", category: "thinking", icon_key: "puzzle" },
  { title: "Reward System", text: "Stars for effort, not perfection — cash them in for family treats.", category: "reward", icon_key: "award" },
];

const ICON_MAP: Record<string, LucideIcon> = {
  brain: Brain,
  puzzle: Puzzle,
  award: Award,
  sparkles: Sparkles,
  palette: Palette,
  search: Search,
  timer: Timer,
  wind: Wind,
  check: Check,
};

function Activities() {
  const [cards, setCards] = useState<ActivityCard[]>(FALLBACK_CARDS);
  const [stars, setStars] = useState(0);
  const [tab, setTab] = useState<GameId>("color");
  const mindRef = useRef<HTMLDivElement | null>(null);
  const brainRef = useRef<HTMLDivElement | null>(null);
  const rewardsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("activity_content")
      .select("title, description, category, icon_key")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (!cancelled && data && data.length > 0) {
          setCards(
            data.map((row) => ({
              title: row.title,
              text: row.description,
              category: row.category,
              icon_key: row.icon_key,
            })),
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addStars = (n: number) => setStars((s) => s + n);

  const openCard = (category: string) => {
    if (category === "memory") setTab("memory");
    else if (category === "thinking") {
      brainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    } else if (category === "reward") {
      rewardsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    } else setTab("color");
    window.setTimeout(() => mindRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  return (
    <>
      <PageHero
        eyebrow="Interactive activities"
        title="Play that quietly builds focus"
        description="Short, repeatable activities designed with occupational therapists — do one before homework or whenever the day needs a reset."
      />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((a) => {
            const Icon = ICON_MAP[a.icon_key] ?? Sparkles;
            return (
              <button
                key={a.title}
                type="button"
                onClick={() => openCard(a.category)}
                aria-label={`Open ${a.title}`}
                className="card-soft cursor-pointer p-6 text-left transition-transform duration-200 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-grass-soft text-grass">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 text-lg font-bold">{a.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{a.text}</p>
                <p className="mt-3 text-xs font-bold text-primary">
                  {CARD_HINTS[a.category] ?? "Tap to play"} →
                </p>
              </button>
            );
          })}
        </div>

        <div ref={mindRef} className="scroll-mt-24">
          <MindGames tab={tab} setTab={setTab} addStars={addStars} />
        </div>

        <div ref={brainRef} className="mt-8 scroll-mt-24">
          <BrainGame onFinish={addStars} />
        </div>

        <div ref={rewardsRef} className="mt-8 scroll-mt-24">
          <StarRewards stars={stars} />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <FocusTimer />
          <HabitTracker />
          <BreathingExercise />
        </div>
      </section>
    </>
  );
}

const games = [
  {
    id: "color",
    label: "Color Match",
    icon: Palette,
    tab: "bg-sky-soft text-sky",
    tabActive: "bg-sky text-primary-foreground",
  },
  {
    id: "memory",
    label: "Number Memory",
    icon: Sparkles,
    tab: "bg-sunny-soft text-primary",
    tabActive: "bg-sunny text-accent-foreground",
  },
  {
    id: "odd",
    label: "Odd One Out",
    icon: Search,
    tab: "bg-grass-soft text-grass",
    tabActive: "bg-grass text-primary-foreground",
  },
] as const;

function MindGames({
  tab,
  setTab,
  addStars,
}: {
  tab: GameId;
  setTab: (t: GameId) => void;
  addStars: (n: number) => void;
}) {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-extrabold">More mind games</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick a tab and play a quick round — each one trains a different thinking muscle.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {games.map((g) => {
          const active = tab === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setTab(g.id)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 hover:-translate-y-1 ${
                active ? `${g.tabActive} -translate-y-1 shadow-md` : g.tab
              }`}
            >
              <g.icon className="size-4" />
              {g.label}
            </button>
          );
        })}
      </div>
      <div key={tab} className="card-soft mt-5 animate-fade-in p-6">
        {tab === "color" && <ColorMatch addStars={addStars} />}
        {tab === "memory" && <NumberMemory addStars={addStars} />}
        {tab === "odd" && <OddOneOut addStars={addStars} />}
      </div>
    </div>
  );
}

const colorWords = [
  { word: "BLUE", className: "text-sky" },
  { word: "GREEN", className: "text-grass" },
  { word: "ORANGE", className: "text-primary" },
];

function ColorMatch({ addStars }: { addStars: (n: number) => void }) {
  const [round, setRound] = useState({ w: 0, c: 1 });
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState("Does the word match its color?");

  const next = () =>
    setRound({
      w: Math.floor(Math.random() * colorWords.length),
      c: Math.floor(Math.random() * colorWords.length),
    });

  const answer = (yes: boolean) => {
    const correct = (round.w === round.c) === yes;
    if (correct) {
      setScore((s) => s + 1);
      addStars(1);
    }
    setMsg(correct ? "Nice spotting! ⭐" : "Not quite — try the next one.");
    next();
  };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">{msg}</p>
      <p className={`mt-6 font-display text-6xl font-extrabold ${colorWords[round.c]!.className}`}>
        {colorWords[round.w]!.word}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button className="rounded-full font-bold" onClick={() => answer(true)}>
          Match
        </Button>
        <Button variant="secondary" className="rounded-full font-bold" onClick={() => answer(false)}>
          No match
        </Button>
      </div>
      <p className="mt-4 text-sm font-bold">Score: {score}</p>
    </div>
  );
}

function NumberMemory({ addStars }: { addStars: (n: number) => void }) {
  const [digits, setDigits] = useState("");
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "done">("idle");
  const [guess, setGuess] = useState("");
  const [level, setLevel] = useState(3);
  const [msg, setMsg] = useState("Remember the number, then type it back.");

  useEffect(() => {
    if (phase !== "show") return;
    const id = setTimeout(() => setPhase("input"), 2500);
    return () => clearTimeout(id);
  }, [phase]);

  const start = (len: number) => {
    setDigits(
      Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join(""),
    );
    setGuess("");
    setPhase("show");
  };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">{msg}</p>
      <div className="mt-6 flex min-h-20 items-center justify-center">
        {phase === "show" ? (
          <p className="font-display text-5xl font-extrabold tracking-widest text-sky">{digits}</p>
        ) : phase === "input" ? (
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            inputMode="numeric"
            className="w-48 rounded-xl border border-border bg-background px-4 py-3 text-center font-display text-2xl font-bold tracking-widest"
            placeholder="Type it"
          />
        ) : (
          <p className="font-display text-3xl font-extrabold text-muted-foreground">Level {level}</p>
        )}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        {phase === "input" ? (
          <Button
            className="rounded-full font-bold"
            onClick={() => {
              const ok = guess.trim() === digits;
              if (ok) addStars(1);
              setMsg(ok ? "Perfect recall! ⭐" : `Close — it was ${digits}.`);
              setLevel((l) => (ok ? Math.min(l + 1, 9) : Math.max(3, l - 1)));
              setPhase("idle");
            }}
          >
            Check
          </Button>
        ) : (
          <Button className="rounded-full font-bold" onClick={() => start(level)}>
            {phase === "idle" ? "Start round" : "Watching…"}
          </Button>
        )}
      </div>
    </div>
  );
}

const oddRounds = [
  { items: ["🍎", "🍌", "🍇", "🚗"], answer: 3 },
  { items: ["🐶", "🐱", "🌳", "🐰"], answer: 2 },
  { items: ["⚽", "🏀", "🎾", "📚"], answer: 3 },
  { items: ["🚂", "✈️", "🚀", "🥕"], answer: 3 },
];

function OddOneOut({ addStars }: { addStars: (n: number) => void }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState("Tap the one that does not belong.");
  const round = oddRounds[i % oddRounds.length]!;

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">{msg}</p>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {round.items.map((item, idx) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              const ok = idx === round.answer;
              if (ok) {
                setScore((s) => s + 1);
                addStars(1);
              }
              setMsg(ok ? "Great thinking! ⭐" : "Look again next round.");
              setI((v) => v + 1);
            }}
            className="rounded-2xl bg-grass-soft py-6 text-3xl transition-transform duration-200 hover:-translate-y-1"
          >
            {item}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm font-bold">Score: {score}</p>
    </div>
  );
}

type BrainQuestion = {
  question: string;
  options: string[];
  answer: number;
};

const BRAIN_QUESTIONS: BrainQuestion[] = [
  { question: "Which number comes next? 2, 4, 6, 8, …", options: ["9", "10", "11", "12"], answer: 1 },
  { question: "Which one does not belong?", options: ["🍎", "🍌", "🍇", "🚗"], answer: 3 },
  { question: "What comes next? 🌞 🌙 🌞 🌙 …", options: ["🌞", "🌙", "⭐", "☁️"], answer: 0 },
  { question: "How many days are in a week?", options: ["5", "6", "7", "8"], answer: 2 },
  { question: "I am tall, gray and have a trunk. What am I?", options: ["Tiger", "Parrot", "Elephant", "Fish"], answer: 2 },
  { question: "Finish the pattern: A, C, E, G, …", options: ["H", "I", "J", "K"], answer: 1 },
  { question: "What is 5 + 3?", options: ["7", "8", "9", "10"], answer: 1 },
  { question: "Which shape has three sides?", options: ["Circle", "Square", "Triangle", "Star"], answer: 2 },
  { question: "The word STOP written backwards is…", options: ["POTS", "TOPS", "SPOT", "STOP"], answer: 0 },
  { question: "Which animal is the biggest?", options: ["Ant", "Mouse", "Cat", "Horse"], answer: 3 },
];

function finalMessage(score: number) {
  if (score === BRAIN_QUESTIONS.length) return "Perfect score! You're a brain champion! 🏆";
  if (score >= 7) return "Great focus! Your brain is getting stronger every day. ⭐";
  if (score >= 4) return "Nice work! Every round makes you sharper. 💪";
  return "Good try! Play again — practice makes progress. 🌱";
}

function BrainGame({ onFinish }: { onFinish: (score: number) => void }) {
  const total = BRAIN_QUESTIONS.length;
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const q = BRAIN_QUESTIONS[index]!;

  const answer = (idx: number) => {
    if (picked !== null || done) return;
    setPicked(idx);
    if (idx === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (picked === null) return;
    if (index + 1 >= total) {
      setDone(true);
      onFinish(score);
    } else {
      setIndex((v) => v + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  };

  return (
    <article className="card-soft p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">Brain Game</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ten quick challenges — patterns, logic and thinking. One at a time!
          </p>
        </div>
        {!done && (
          <Button size="sm" variant="ghost" className="rounded-full font-bold" onClick={restart}>
            Restart game
          </Button>
        )}
      </div>

      {done ? (
        <div className="mt-6 rounded-2xl bg-sunny-soft/60 p-8 text-center">
          <p className="font-display text-5xl font-extrabold text-primary">
            {score} / {total}
          </p>
          <p className="mt-3 text-lg font-bold">{finalMessage(score)}</p>
          <Button className="mt-5 rounded-full font-bold" onClick={restart}>
            Play again
          </Button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Question {index + 1} of {total} · Score {score}
          </p>
          <p className="mt-3 font-display text-2xl font-extrabold">{q.question}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {q.options.map((opt, idx) => {
              const isAnswer = idx === q.answer;
              const chosen = picked === idx;
              const showState = picked !== null && (chosen || isAnswer);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => answer(idx)}
                  disabled={picked !== null}
                  className={`rounded-2xl border border-border px-4 py-4 text-left text-lg font-bold transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-soft disabled:cursor-default ${
                    showState
                      ? isAnswer
                        ? "border-grass bg-grass-soft text-accent-foreground"
                        : "border-destructive/50 bg-destructive/10"
                      : "bg-background"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button className="rounded-full font-bold" onClick={next} disabled={picked === null}>
              {index + 1 >= total ? "Finish" : "Next question"}
            </Button>
            {picked !== null && (
              <p className="text-sm font-bold" role="status">
                {picked === q.answer ? "Correct! Great thinking. ⭐" : `Not quite — the answer is “${q.options[q.answer]}”.`}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function StarRewards({ stars }: { stars: number }) {
  return (
    <article className="card-soft flex items-center gap-6 p-8">
      <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-sunny-soft text-3xl text-primary">
        ⭐
      </span>
      <div>
        <h2 className="text-2xl font-extrabold">My Star Rewards</h2>
        <p className="font-display text-4xl font-extrabold text-primary">
          {stars} {stars === 1 ? "star" : "stars"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Stars are for effort, not perfection. Cash them in for family treats — a board-game night,
          extra story time, or picking Saturday breakfast.
        </p>
      </div>
    </article>
  );
}

function FocusTimer() {
  const [seconds, setSeconds] = useState(600);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const label = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <article className="card-soft p-6">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-sunny-soft text-primary">
        <Timer className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-bold">Focus Timer</h2>
      <p className="mt-1 text-sm text-muted-foreground">Work in one short burst, then take a break.</p>
      <p className="mt-4 font-display text-5xl font-extrabold tabular-nums">{label}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" className="rounded-full font-bold" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="rounded-full font-bold"
          onClick={() => {
            setRunning(false);
            setSeconds(600);
          }}
        >
          Reset
        </Button>
        {[5, 10, 15].map((m) => (
          <Button
            key={m}
            size="sm"
            variant="ghost"
            className="rounded-full font-bold"
            onClick={() => {
              setRunning(false);
              setSeconds(m * 60);
            }}
          >
            {m}m
          </Button>
        ))}
      </div>
    </article>
  );
}

const habits = ["Morning routine done", "20 minutes reading", "Movement break", "Screens off before bed"];

function HabitTracker() {
  const [done, setDone] = useState<string[]>([]);
  const pct = (done.length / habits.length) * 100;

  return (
    <article className="card-soft p-6">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-sky-soft text-sky">
        <Check className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-bold">Daily Habit Tracker</h2>
      <Progress value={pct} className="mt-4" />
      <ul className="mt-4 grid gap-2">
        {habits.map((h) => {
          const active = done.includes(h);
          return (
            <li key={h}>
              <button
                type="button"
                onClick={() =>
                  setDone((d) => (d.includes(h) ? d.filter((x) => x !== h) : [...d, h]))
                }
                className={`flex w-full items-center gap-3 rounded-xl border border-border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  active ? "bg-grass-soft text-accent-foreground" : "hover:bg-muted"
                }`}
              >
                <span
                  className={`flex size-5 items-center justify-center rounded-md border border-border ${active ? "bg-grass text-primary-foreground" : ""}`}
                >
                  {active && <Check className="size-3.5" />}
                </span>
                {h}
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

const phases = [
  { label: "Breathe in", ms: 4000 },
  { label: "Hold", ms: 4000 },
  { label: "Breathe out", ms: 6000 },
];

function BreathingExercise() {
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % phases.length), phases[index]!.ms);
    return () => clearTimeout(id);
  }, [active, index]);

  return (
    <article className="card-soft flex flex-col p-6">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-grass-soft text-grass">
        <Wind className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-bold">Calm Breathing</h2>
      <p className="mt-1 text-sm text-muted-foreground">A 4-4-6 pattern for big feelings.</p>
      <div className="mt-6 flex flex-1 items-center justify-center">
        <div
          className={`flex size-32 items-center justify-center rounded-full bg-sky-soft text-center text-sm font-bold text-foreground transition-transform duration-[3000ms] ${
            active && index === 0 ? "scale-110" : "scale-90"
          }`}
        >
          {active ? phases[index]!.label : "Ready?"}
        </div>
      </div>
      <Button
        className="mt-6 rounded-full font-bold"
        onClick={() => {
          setIndex(0);
          setActive((a) => !a);
        }}
      >
        {active ? "Stop" : "Start breathing"}
      </Button>
    </article>
  );
}
