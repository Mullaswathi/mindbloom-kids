import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import {
  Brain,
  Check,
  Eraser,
  Pencil,
  Puzzle,
  RotateCcw,
  Type,
  Timer,
  Wind,
} from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const title = "Interactive Activities — Focus, Memory & Calm for ADHD Kids";
const description =
  "Focus and memory games, a child-friendly digital writing slate, a daily habit tracker and calm breathing exercises.";

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
    id: "attention",
    icon: Brain,
    title: "Attention Games",
    text: "Spot the color match in a quick, fun round.",
  },
  {
    id: "memory",
    icon: Puzzle,
    title: "Memory Challenges",
    text: "Remember the number and see how many rounds you can complete.",
  },
  {
    id: "puzzles",
    icon: Puzzle,
    title: "Brain Puzzles",
    text: "Find the odd one out in a set of playful pictures.",
  },
  {
    id: "matching",
    icon: Puzzle,
    title: "Matching Card Game",
    text: "Turn over the cards and find all the matching pairs.",
  },
];

const habits = ["Morning routine done", "20 minutes reading", "Movement break", "Screens off before bed"];
type GameId = (typeof activities)[number]["id"];

function Activities() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  return (
    <>
      <PageHero
        eyebrow="Interactive activities"
        title="Play that quietly builds focus"
        description="Short, repeatable activities designed with occupational therapists — do one before homework or whenever the day needs a reset."
      />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((a) => (
            <article
              key={a.title}
              className="card-soft flex h-full flex-col p-6 transition-transform duration-200 hover:-translate-y-1"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-grass-soft text-grass">
                <a.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-bold">{a.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{a.text}</p>
              <Button
                type="button"
                className="mt-auto mt-5 w-full rounded-full font-bold"
                onClick={() => setActiveGame(a.id)}
              >
                Play
              </Button>
            </article>
          ))}
        </div>

        <Dialog
          open={activeGame !== null}
          onOpenChange={(open) => {
            if (!open) setActiveGame(null);
          }}
        >
          <DialogContent className="fixed inset-0 left-0 top-0 block h-dvh w-screen max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 p-4 sm:rounded-none sm:p-8 [&>button]:hidden">
            <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col">
              <DialogHeader className="mb-8 pr-8 text-left">
                <DialogTitle className="text-3xl font-extrabold">
                  {activities.find((activity) => activity.id === activeGame)?.title}
                </DialogTitle>
                <DialogDescription>
                  {activities.find((activity) => activity.id === activeGame)?.text}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-1 items-center justify-center rounded-3xl bg-grass-soft/40 p-4 sm:p-8">
                {activeGame === "attention" && <ColorMatch />}
                {activeGame === "memory" && <NumberMemory />}
                {activeGame === "puzzles" && <OddOneOut />}
                {activeGame === "matching" && <MatchingCardGame />}
              </div>
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveGame(null)}
                  className="rounded-full font-bold"
                >
                  Exit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <WritingSlate />

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <FocusTimer />
          <HabitTracker id="habit-tracker" />
          <BreathingExercise />
        </div>
      </section>
    </>
  );
}

const slateColors = [
  { name: "Chalk white", value: "#ffffff" },
  { name: "Blue", value: "#168bd2" },
  { name: "Green", value: "#36a66a" },
  { name: "Orange", value: "#f58220" },
  { name: "Purple", value: "#9364c7" },
  { name: "Black", value: "#24364b" },
];

function WritingSlate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePointer = useRef<number | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<"pen" | "eraser" | "text">("pen");
  const [color, setColor] = useState(slateColors[0]!.value);
  const [brushSize, setBrushSize] = useState(8);
  const [text, setText] = useState("");

  const getPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
  };

  const startStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d");
    if (!context) return;

    event.preventDefault();
    const point = getPoint(event);

    if (tool === "text") {
      if (!text.trim()) return;
      context.globalCompositeOperation = "source-over";
      context.fillStyle = color;
      context.font = `${Math.max(20, brushSize * 4)}px "Comic Sans MS", "Chalkboard", cursive`;
      context.textBaseline = "top";
      context.fillText(text.trim(), point.x, point.y, canvas.width - point.x);
      return;
    }

    canvas.setPointerCapture(event.pointerId);
    activePointer.current = event.pointerId;
    lastPoint.current = point;

    context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = brushSize * (tool === "eraser" ? 4 : 1);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.arc(point.x, point.y, context.lineWidth / 2, 0, Math.PI * 2);
    context.fill();
  };

  const continueStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== event.pointerId || !lastPoint.current) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;

    event.preventDefault();
    const point = getPoint(event);
    context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = color;
    context.lineWidth = brushSize * (tool === "eraser" ? 4 : 1);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(lastPoint.current.x, lastPoint.current.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPoint.current = point;
  };

  const endStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== event.pointerId) return;
    activePointer.current = null;
    lastPoint.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const clearSlate = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <section className="mt-8" aria-labelledby="writing-slate-title">
      <h2 id="writing-slate-title" className="text-2xl font-extrabold">
        My Little Writing Slate ✏️
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Draw or write with your finger, a stylus, or your mouse.
      </p>
      <div className="card-soft mt-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant={tool === "pen" ? "default" : "secondary"}
            className="rounded-full font-bold"
            aria-pressed={tool === "pen"}
            onClick={() => setTool("pen")}
          >
            <Pencil className="mr-2 size-4" />
            Pen
          </Button>
          <Button
            type="button"
            variant={tool === "eraser" ? "default" : "secondary"}
            className="rounded-full font-bold"
            aria-pressed={tool === "eraser"}
            onClick={() => setTool("eraser")}
          >
            <Eraser className="mr-2 size-4" />
            Eraser
          </Button>
          <Button
            type="button"
            variant={tool === "text" ? "default" : "secondary"}
            className="rounded-full font-bold"
            aria-pressed={tool === "text"}
            onClick={() => setTool("text")}
          >
            <Type className="mr-2 size-4" />
            Text
          </Button>

          <div className="flex items-center gap-2" role="group" aria-label="Pen color">
            {slateColors.map((swatch) => (
              <button
                key={swatch.value}
                type="button"
                aria-label={`${swatch.name} pen`}
                aria-pressed={color === swatch.value}
                onClick={() => {
                  setColor(swatch.value);
                }}
                className={`size-8 rounded-full border-2 ${color === swatch.value ? "border-foreground ring-2 ring-ring ring-offset-2" : "border-white shadow"}`}
                style={{ backgroundColor: swatch.value }}
              />
            ))}
            <label className="flex size-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border text-xs font-bold">
              <span className="sr-only">Choose custom pen color</span>
              <input
                type="color"
                aria-label="Choose custom pen color"
                value={color}
                onChange={(event) => {
                  setColor(event.target.value);
                }}
                className="size-10 cursor-pointer"
              />
            </label>
          </div>

          {tool === "text" && (
            <input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={100}
              aria-label="Text to write on slate"
              placeholder="Type a word, then tap the slate"
              className="min-w-52 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm"
            />
          )}

          <label className="flex min-w-40 flex-1 items-center gap-2 text-sm font-semibold">
            Thickness
            <input
              type="range"
              min="2"
              max="24"
              value={brushSize}
              onChange={(event) => setBrushSize(Number(event.target.value))}
              aria-label="Brush thickness"
              className="w-full accent-primary"
            />
            <span className="w-6 text-right tabular-nums">{brushSize}</span>
          </label>

          <Button
            type="button"
            variant="outline"
            className="rounded-full font-bold"
            onClick={clearSlate}
          >
            <RotateCcw className="mr-2 size-4" />
            Clear Slate
          </Button>
        </div>
        <div className="mt-4 rounded-2xl border-4 border-[#80502d] bg-[#a87343] p-1.5 shadow-inner sm:border-[10px] sm:p-2">
          <canvas
            ref={canvasRef}
            width={1200}
            height={480}
            aria-label="Writing slate drawing area"
            onPointerDown={startStroke}
            onPointerMove={continueStroke}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
            className={`block aspect-[5/2] w-full touch-none rounded-lg border border-[#16432f] bg-[#245b40] shadow-inner ${
              tool === "text" ? "cursor-text" : ""
            }`}
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.035), transparent 55%), radial-gradient(ellipse at 80% 75%, rgba(0,0,0,0.09), transparent 60%)",
            }}
          />
        </div>
      </div>
    </section>
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

  const start = (roundIndex: number) => {
    setDigits(
      Array.from({ length: roundIndex + 1 }, () => Math.floor(Math.random() * 10)).join(""),
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
          <p className="font-display text-3xl font-extrabold text-muted-foreground">
            {phase === "idle" ? "Ready?" : `Level ${round + 1}`}
          </p>
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

const matchingFaces = ["🐸", "🦋", "🐢", "🐝", "🐙", "🐳"];

function createMatchingDeck() {
  return [...matchingFaces, ...matchingFaces]
    .map((emoji, id) => ({ id, emoji, order: Math.random() }))
    .sort((a, b) => a.order - b.order)
    .map(({ id, emoji }) => ({ id, emoji }));
}

function MatchingCardGame() {
  const [cards, setCards] = useState(createMatchingDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (flipped.length !== 2) return;

    const [first, second] = flipped;
    if (first === undefined || second === undefined) return;
    const isMatch = cards[first]?.emoji === cards[second]?.emoji;
    const timeout = window.setTimeout(
      () => {
        if (isMatch) setMatched((current) => [...current, first, second]);
        setFlipped([]);
      },
      isMatch ? 450 : 900,
    );

    return () => window.clearTimeout(timeout);
  }, [cards, flipped]);

  const restart = () => {
    setCards(createMatchingDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const chooseCard = (id: number) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;
    setFlipped((current) => [...current, id]);
    if (flipped.length === 1) setMoves((current) => current + 1);
  };

  const complete = matched.length === cards.length;

  return (
    <div className="w-full max-w-3xl text-center">
      {complete ? (
        <div role="status" aria-live="polite">
          <h3 className="text-3xl font-extrabold">You found every pair! 🎉</h3>
          <p className="mt-3 text-muted-foreground">You matched all the cards in {moves} moves.</p>
          <Button className="mt-6 rounded-full font-bold" onClick={restart}>
            Play again
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="font-bold">Find all 6 matching pairs 🧠</p>
            <p className="text-sm font-semibold">Moves: {moves}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
            {cards.map((card) => {
              const isFaceUp = flipped.includes(card.id) || matched.includes(card.id);
              return (
                <button
                  key={card.id}
                  type="button"
                  aria-label={isFaceUp ? `Card ${card.emoji}` : "Turn over card"}
                  aria-pressed={isFaceUp}
                  disabled={matched.includes(card.id) || flipped.length === 2}
                  onClick={() => chooseCard(card.id)}
                  className={`flex aspect-square items-center justify-center rounded-2xl text-4xl shadow-sm transition-all sm:text-6xl ${
                    isFaceUp
                      ? "scale-[0.98] bg-white"
                      : "bg-sky-soft hover:-translate-y-1 hover:shadow-md"
                  } disabled:cursor-default`}
                >
                  {isFaceUp ? card.emoji : "❔"}
                </button>
              );
            })}
          </div>
          <Button variant="secondary" className="mt-6 rounded-full font-bold" onClick={restart}>
            Start over
          </Button>
        </>
      )}
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
