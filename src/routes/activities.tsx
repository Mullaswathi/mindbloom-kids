import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Brain, Check, Eraser, PenLine, Puzzle, Sparkles, Timer, Wind } from "lucide-react";
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
  {
    icon: Brain,
    title: "Attention Games",
    text: "Spot-the-change and sorting challenges in 3-minute rounds.",
  },
  {
    icon: Puzzle,
    title: "Memory Challenges",
    text: "Card pairs and sequence recall that get harder as skills grow.",
  },
  {
    icon: Puzzle,
    title: "Brain Puzzles",
    text: "Logic and pattern puzzles for a quick, satisfying win.",
  },
  {
    icon: Sparkles,
    title: "Pattern Match",
    text: "Find the next shape in each sequence and build pattern skills through play.",
  },
];

const habits = [
  "Morning routine done",
  "20 minutes reading",
  "Movement break",
  "Screens off before bed",
];

type SlatePoint = { x: number; y: number };
type SlateStroke = {
  type: "stroke";
  points: SlatePoint[];
  color: string;
  size: number;
  erase: boolean;
};
type SlateText = { type: "text"; text: string; x: number; y: number; color: string };
type SlateMark = SlateStroke | SlateText;

function Activities() {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const SelectedGame =
    selectedActivity === "Attention Games"
      ? CardMatch
      : selectedActivity === "Memory Challenges"
        ? NumberMemory
        : selectedActivity === "Brain Puzzles"
          ? OddOneOut
          : PatternMatch;

  return (
    <>
      <PageHero
        eyebrow="Interactive activities"
        title="Play that quietly builds focus"
        description="Short, repeatable activities designed with occupational therapists — do one before homework or whenever the day needs a reset."
      />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((activity) => {
            const active = activity.title === selectedActivity;

            return (
              <article
                key={activity.title}
                className="card-soft p-6 transition-transform duration-200 hover:-translate-y-1"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-grass-soft text-grass">
                  <activity.icon className="size-5" />
                </span>
                <h2 className="mt-4 text-lg font-bold">{activity.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{activity.text}</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-4 rounded-full font-bold"
                  aria-expanded={active}
                  onClick={() => setSelectedActivity(active ? null : activity.title)}
                >
                  {active ? "Close game" : "Play"}
                </Button>
              </article>
            );
          })}
        </div>

        {selectedActivity && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedActivity} game`}
            className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-background/95 p-4 backdrop-blur-sm sm:p-8"
          >
            <div className="w-full max-w-3xl rounded-[2rem] border border-border bg-background p-5 shadow-2xl sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-extrabold sm:text-3xl">{selectedActivity}</h2>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full font-bold"
                  onClick={() => setSelectedActivity(null)}
                >
                  Close
                </Button>
              </div>
              <SelectedGame />
            </div>
          </div>
        )}

        <WritingSlate />

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <FocusTimer />
          <HabitTracker />
          <BreathingExercise />
        </div>
      </section>
    </>
  );
}

const slateColors = [
  { name: "Chalk white", value: "#ffffff" },
  { name: "Red", value: "#f87171" },
  { name: "Orange", value: "#fb923c" },
  { name: "Sunny yellow", value: "#fde047" },
  { name: "Mint green", value: "#86efac" },
  { name: "Sky blue", value: "#7dd3fc" },
  { name: "Purple", value: "#c4b5fd" },
  { name: "Candy pink", value: "#f9a8d4" },
  { name: "Turquoise", value: "#5eead4" },
];

function WritingSlate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [marks, setMarks] = useState<SlateMark[]>([]);
  const [draft, setDraft] = useState<SlateStroke | null>(null);
  const [color, setColor] = useState(slateColors[0]!.value);
  const [thickness, setThickness] = useState(5);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [text, setText] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(bounds.width * ratio));
      canvas.height = Math.max(1, Math.round(bounds.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);

      [...marks, ...(draft ? [draft] : [])].forEach((mark) => {
        if (mark.type === "text") {
          context.globalCompositeOperation = "source-over";
          context.fillStyle = mark.color;
          context.font = `bold 28px ${getComputedStyle(document.body).fontFamily}`;
          context.fillText(mark.text, mark.x * bounds.width, mark.y * bounds.height);
          return;
        }

        if (mark.points.length === 0) return;
        context.globalCompositeOperation = mark.erase ? "destination-out" : "source-over";
        context.strokeStyle = mark.color;
        context.lineWidth = mark.size;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.beginPath();
        context.moveTo(mark.points[0]!.x * bounds.width, mark.points[0]!.y * bounds.height);
        mark.points.slice(1).forEach((point) => {
          context.lineTo(point.x * bounds.width, point.y * bounds.height);
        });
        if (mark.points.length === 1) {
          context.lineTo(mark.points[0]!.x * bounds.width + 0.1, mark.points[0]!.y * bounds.height);
        }
        context.stroke();
      });

      context.globalCompositeOperation = "source-over";
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [marks, draft]);

  const getPoint = (event: PointerEvent<HTMLCanvasElement>): SlatePoint => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    };
  };

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    setDraft({
      type: "stroke",
      points: [getPoint(event)],
      color,
      size: thickness,
      erase: tool === "eraser",
    });
  };

  const continueDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const point = getPoint(event);
    setDraft((current) => current && { ...current, points: [...current.points, point] });
  };

  const finishDrawing = () => {
    drawingRef.current = false;
    if (draft) setMarks((existing) => [...existing, draft]);
    setDraft(null);
  };

  const addText = () => {
    const value = text.trim();
    if (!value) return;
    setMarks((existing) => [...existing, { type: "text", text: value, x: 0.08, y: 0.55, color }]);
    setText("");
  };

  return (
    <section className="mt-12" aria-labelledby="writing-slate-title">
      <div className="mb-5 text-center">
        <h2 id="writing-slate-title" className="text-3xl font-extrabold">
          My Little Writing Slate ✏️
        </h2>
        <p className="mt-2 text-muted-foreground">Write, draw, and learn at your own pace!</p>
      </div>

      <div className="rounded-[2rem] border-4 border-amber-200 bg-[#173b32] p-3 shadow-lg sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white/10 p-3 text-white">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Drawing tools">
            <Button
              type="button"
              size="sm"
              variant={tool === "pen" ? "default" : "secondary"}
              aria-pressed={tool === "pen"}
              onClick={() => setTool("pen")}
              className="rounded-full font-bold"
            >
              <PenLine className="mr-2 size-4" /> Pen
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tool === "eraser" ? "default" : "secondary"}
              aria-pressed={tool === "eraser"}
              onClick={() => setTool("eraser")}
              className="rounded-full font-bold"
            >
              <Eraser className="mr-2 size-4" /> Eraser
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pen color">
            {slateColors.map((slateColor) => (
              <button
                key={slateColor.value}
                type="button"
                aria-label={slateColor.name}
                aria-pressed={color === slateColor.value}
                onClick={() => {
                  setColor(slateColor.value);
                  setTool("pen");
                }}
                className={`size-8 rounded-full border-2 ${color === slateColor.value ? "border-white ring-2 ring-amber-300" : "border-white/40"}`}
                style={{ backgroundColor: slateColor.value }}
              />
            ))}
          </div>

          <label className="flex min-w-36 flex-1 items-center gap-2 text-sm font-semibold">
            Pen size
            <input
              type="range"
              min="2"
              max="24"
              value={thickness}
              onChange={(event) => setThickness(Number(event.target.value))}
              className="min-w-20 flex-1 accent-amber-300"
              aria-label="Pen thickness"
            />
          </label>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-full font-bold"
            onClick={() => {
              setMarks([]);
              setDraft(null);
            }}
          >
            Clear Slate
          </Button>
        </div>

        <canvas
          ref={canvasRef}
          aria-label="Drawing slate. Draw with a mouse, finger, or stylus."
          className="h-[300px] w-full touch-none cursor-crosshair rounded-xl border border-white/20 bg-[#203f38] sm:h-[420px]"
          onPointerDown={startDrawing}
          onPointerMove={continueDrawing}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
        />

        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            addText();
          }}
        >
          <label className="sr-only" htmlFor="slate-text">
            Text to write on the slate
          </label>
          <input
            id="slate-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type your name, letters, numbers, or words"
            className="min-w-0 flex-1 rounded-xl border border-white/30 bg-white px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          />
          <Button type="submit" className="rounded-full font-bold">
            Write on slate
          </Button>
        </form>
      </div>
    </section>
  );
}

const patternRounds = [
  { sequence: ["🔴", "🔵", "🔴", "🔵"], choices: ["🔴", "🔵", "🟡"], answer: "🔴" },
  { sequence: ["⭐", "⭐", "🌙", "⭐", "⭐"], choices: ["⭐", "🌙", "☀️"], answer: "🌙" },
  { sequence: ["🟢", "🟡", "🟢", "🟡"], choices: ["🟢", "🟡", "🔵"], answer: "🟢" },
];

function PatternMatch() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [message, setMessage] = useState("Choose what comes next in the pattern.");
  const round = patternRounds[roundIndex % patternRounds.length]!;

  const choose = (choice: string) => {
    setMessage(choice === round.answer ? "Great pattern spotting! ⭐" : "Try the next pattern!");
    setRoundIndex((index) => index + 1);
  };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-4xl">
        {round.sequence.map((shape, index) => (
          <span key={`${shape}-${index}`}>{shape}</span>
        ))}
        <span className="font-bold text-muted-foreground">?</span>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        {round.choices.map((choice) => (
          <Button
            key={choice}
            type="button"
            variant="secondary"
            className="size-14 rounded-2xl text-2xl"
            aria-label={`Choose ${choice}`}
            onClick={() => choose(choice)}
          >
            {choice}
          </Button>
        ))}
      </div>
    </div>
  );
}

const memorySymbols = ["🍎", "⭐", "🐸", "🚀", "🦋", "🍉"];

function CardMatch() {
  const [deck, setDeck] = useState<{ id: number; symbol: string }[]>([]);
  const [openCards, setOpenCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [message, setMessage] = useState("Start a round and find all the matching pairs.");

  useEffect(() => {
    if (openCards.length !== 2) return;

    const [first, second] = openCards;
    const isMatch = deck[first!]!.symbol === deck[second!]!.symbol;
    const timeout = window.setTimeout(() => {
      if (isMatch) {
        setMatchedCards((matched) => {
          const nextMatched = [...matched, first!, second!];
          setMessage(
            nextMatched.length === deck.length
              ? "You found every pair! Great memory! ⭐"
              : "A match! Find another pair.",
          );
          return nextMatched;
        });
      } else {
        setMessage("Those cards don't match. Try another pair!");
      }

      setOpenCards([]);
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [deck, openCards]);

  const startRound = () => {
    const shuffled = [...memorySymbols, ...memorySymbols]
      .map((symbol, index) => ({ id: index, symbol, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ id, symbol }) => ({ id, symbol }));
    setDeck(shuffled);
    setOpenCards([]);
    setMatchedCards([]);
    setMessage("Find the matching pairs.");
  };

  const flipCard = (index: number) => {
    if (openCards.length === 2 || openCards.includes(index) || matchedCards.includes(index)) return;
    setOpenCards((open) => [...open, index]);
  };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {message}
      </p>
      {deck.length === 0 ? (
        <Button type="button" className="mt-4 rounded-full font-bold" onClick={startRound}>
          Start matching game
        </Button>
      ) : (
        <>
          <div className="mx-auto mt-4 grid max-w-md grid-cols-4 gap-2">
            {deck.map((card, index) => {
              const isVisible = openCards.includes(index) || matchedCards.includes(index);
              return (
                <button
                  key={card.id}
                  type="button"
                  aria-label={
                    isVisible ? `Card showing ${card.symbol}` : `Reveal card ${index + 1}`
                  }
                  aria-pressed={isVisible}
                  onClick={() => flipCard(index)}
                  className={`flex aspect-square items-center justify-center rounded-xl text-xl transition-colors ${
                    isVisible ? "bg-sky-soft" : "bg-grass-soft hover:bg-grass-soft/70"
                  }`}
                >
                  {isVisible ? card.symbol : "?"}
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-4 rounded-full font-bold"
            onClick={startRound}
          >
            New game
          </Button>
        </>
      )}
    </div>
  );
}

function NumberMemory() {
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
    setDigits(Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join(""));
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
          <p className="font-display text-3xl font-extrabold text-muted-foreground">
            Level {level}
          </p>
        )}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        {phase === "input" ? (
          <Button
            className="rounded-full font-bold"
            onClick={() => {
              const ok = guess.trim() === digits;
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

function OddOneOut() {
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
              setScore((s) => (ok ? s + 1 : s));
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
