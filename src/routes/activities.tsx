import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Award, Brain, Check, Palette, Puzzle, Search, Sparkles, Timer, Wind } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const title = "Interactive Activities — Focus, Memory & Calm for ADHD Kids";
const description =
  "Attention games, memory challenges, brain puzzles, pattern games, a daily habit tracker and calm breathing exercises children can use today.";

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

const activities = [
  { icon: Brain, title: "Attention Games", text: "Spot-the-change and sorting challenges in 3-minute rounds." },
  { icon: Puzzle, title: "Memory Challenges", text: "Card pairs and sequence recall that get harder as skills grow." },
  { icon: Puzzle, title: "Brain Puzzles", text: "Logic and pattern puzzles for a quick, satisfying win." },
  { icon: Award, title: "Reward System", text: "Stars for effort, not perfection — cash them in for family treats." },
];

const habits = ["Morning routine done", "20 minutes reading", "Movement break", "Screens off before bed"];

function Activities() {
  return (
    <>
      {activeGame === null && (
        <PageHero
          eyebrow="Interactive activities"
          title="Play that quietly builds focus"
          description="Short, repeatable activities designed with occupational therapists — do one before homework or whenever the day needs a reset."
        />
      )}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((a) => (
            <article
              key={a.title}
              className="card-soft p-6 transition-transform duration-200 hover:-translate-y-1"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-grass-soft text-grass">
                <a.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-bold">{a.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{a.text}</p>
            </article>
          ))}
        </div>

        <MindGames />

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              <FocusTimer />
              <HabitTracker id="habit-tracker" />
              <BreathingExercise />
            </div>
          </>
        )}
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

function MindGames() {
  const [tab, setTab] = useState<(typeof games)[number]["id"]>("color");

  return (
    <div className="mt-8">
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
        {tab === "color" && <ColorMatch />}
        {tab === "memory" && <NumberMemory />}
        {tab === "odd" && <OddOneOut />}
      </div>
    </div>
  );
}

const colorWords = [
  { word: "BLUE", className: "text-sky" },
  { word: "GREEN", className: "text-grass" },
  { word: "ORANGE", className: "text-primary" },
];

function ColorMatch() {
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
    setScore((s) => (correct ? s + 1 : s));
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

function NumberMemory() {
  const [digits, setDigits] = useState("");
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "result" | "done">("idle");
  const [guess, setGuess] = useState("");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(false);
  const totalRounds = 5;

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
    setRound(roundIndex);
    setPhase("show");
  };

  const restart = () => {
    setRound(0);
    setScore(0);
    setGuess("");
    setPhase("idle");
  };

  if (phase === "done") {
    return (
      <div className="text-center" role="status">
        <h3 className="text-2xl font-extrabold">Number Memory complete!</h3>
        <p className="mt-2 text-muted-foreground">
          You remembered {score} out of {totalRounds} numbers. Great effort!
        </p>
        <Button className="mt-5 rounded-full font-bold" onClick={restart}>
          Play again
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">Remember the number, then type it back.</p>
      <div className="mx-auto mt-4 flex max-w-xl justify-between text-sm font-bold">
        <span>
          Round {round + 1} of {totalRounds}
        </span>
        <span>Score: {score}</span>
      </div>
      <Progress value={(round / totalRounds) * 100} className="mx-auto mt-2 max-w-xl" />
      <div className="mt-6 flex min-h-20 items-center justify-center">
        {phase === "show" ? (
          <p className="font-display text-5xl font-extrabold tracking-widest text-sky">{digits}</p>
        ) : phase === "input" ? (
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value.replace(/\D/g, "").slice(0, digits.length))}
            inputMode="numeric"
            aria-label="Type the number you remember"
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
              const isCorrect = guess.trim() === digits;
              setCorrect(isCorrect);
              if (isCorrect) setScore((value) => value + 1);
              setPhase("result");
            }}
          >
            Check
          </Button>
        ) : phase === "result" ? (
          <div role="status" aria-live="polite">
            <p className="font-bold">
              {correct ? "Perfect recall! ⭐" : `Good try! The number was ${digits}.`}
            </p>
            <Button
              className="mt-3 rounded-full font-bold"
              onClick={() => {
                if (round === totalRounds - 1) setPhase("done");
                else start(round + 1);
              }}
            >
              {round === totalRounds - 1 ? "See my score" : "Next round"}
            </Button>
          </div>
        ) : (
          <Button
            className="rounded-full font-bold"
            disabled={phase === "show"}
            onClick={() => start(0)}
          >
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

function OddOneOut() {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const complete = i >= oddRounds.length;
  const round = oddRounds[i];

  const restart = () => {
    setI(0);
    setScore(0);
    setAnswer(null);
  };

  if (complete) {
    return (
      <div className="text-center" role="status">
        <h3 className="text-2xl font-extrabold">Attention round complete!</h3>
        <p className="mt-2 text-muted-foreground">
          You spotted {score} out of {oddRounds.length}. Well noticed!
        </p>
        <Button className="mt-5 rounded-full font-bold" onClick={restart}>
          Play again
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">Tap the one that does not belong.</p>
      <div className="mx-auto mt-4 flex max-w-xl justify-between text-sm font-bold">
        <span>
          Round {i + 1} of {oddRounds.length}
        </span>
        <span>Score: {score}</span>
      </div>
      <Progress value={(i / oddRounds.length) * 100} className="mx-auto mt-2 max-w-xl" />
      <div className="mt-6 grid grid-cols-4 gap-3">
        {round!.items.map((item, idx) => (
          <button
            key={item}
            type="button"
            disabled={answer !== null}
            aria-label={`Choose ${item}`}
            onClick={() => {
              setAnswer(idx);
              if (idx === round!.answer) setScore((value) => value + 1);
            }}
            className={`rounded-2xl bg-grass-soft py-6 text-3xl transition-transform duration-200 hover:-translate-y-1 disabled:cursor-default ${answer === idx ? (idx === round!.answer ? "ring-4 ring-grass" : "ring-4 ring-destructive") : ""}`}
          >
            {item}
          </button>
        ))}
      </div>
      {answer !== null && (
        <div className="mt-4" role="status" aria-live="polite">
          <p className="font-bold">
            {answer === round!.answer
              ? "Great thinking! ⭐"
              : `Good try! ${round!.items[round!.answer]} was the odd one out.`}
          </p>
          <Button
            className="mt-3 rounded-full font-bold"
            onClick={() => {
              setI((value) => value + 1);
              setAnswer(null);
            }}
          >
            {i === oddRounds.length - 1 ? "See my score" : "Next"}
          </Button>
        </div>
      )}
    </div>
  );
}

const rewardGoals = [
  "Try one focus game",
  "Finish one small task",
  "Take a movement break",
  "Practice a calm breath",
  "Read for 10 minutes",
];

const rewardChoices = [
  { name: "Pick a family story", cost: 2 },
  { name: "Choose the family music", cost: 3 },
  { name: "Pick a family activity", cost: 5 },
];

function RewardGame() {
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);
  const [stars, setStars] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);

  const reset = () => {
    setCompletedGoals([]);
    setStars(0);
    setClaimedRewards([]);
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Celebrate effort, one step at a time.</p>
          <h3 className="mt-1 text-xl font-extrabold">Your stars: {stars} ⭐</h3>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full font-bold"
          onClick={reset}
        >
          Start over
        </Button>
      </div>

      <h4 className="mt-6 font-bold">Earn a star</h4>
      <div className="mt-3 grid gap-2">
        {rewardGoals.map((goal) => {
          const complete = completedGoals.includes(goal);
          return (
            <Button
              key={goal}
              type="button"
              variant={complete ? "secondary" : "outline"}
              disabled={complete}
              className="min-h-11 justify-between whitespace-normal rounded-xl font-semibold"
              onClick={() => {
                setCompletedGoals((current) => [...current, goal]);
                setStars((current) => current + 1);
              }}
            >
              {goal}
              <span>{complete ? "Earned ⭐" : "+1 ⭐"}</span>
            </Button>
          );
        })}
      </div>

      <h4 className="mt-6 font-bold">Choose a family reward</h4>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {rewardChoices.map((reward) => {
          const claimed = claimedRewards.includes(reward.name);
          return (
            <Button
              key={reward.name}
              type="button"
              variant="secondary"
              disabled={claimed || stars < reward.cost}
              className="h-auto min-h-16 whitespace-normal rounded-xl px-3 py-2 font-semibold"
              onClick={() => {
                setStars((current) => current - reward.cost);
                setClaimedRewards((current) => [...current, reward.name]);
              }}
            >
              {claimed ? "Chosen!" : `${reward.name} · ${reward.cost} ⭐`}
            </Button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Choose rewards together with a grown-up. Every effort counts.
      </p>
    </div>
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

  const label = useMemo(() => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [seconds]);

  return (
    <article className="card-soft p-6">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-sunny-soft text-primary">
        <Timer className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-bold">Focus Timer</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Work in one short burst, then take a break.
      </p>
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

function HabitTracker({ id }: { id: string }) {
  const [done, setDone] = useState<string[]>([]);
  const pct = (done.length / habits.length) * 100;

  return (
    <article id={id} className="card-soft scroll-mt-6 p-6">
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

