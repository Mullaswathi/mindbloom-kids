import { createFileRoute } from "@tanstack/react-router";
import { Apple, Download, FileText, Lightbulb, Moon } from "lucide-react";
import { PageHero } from "@/components/PageHero";

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
  {
    id: "morning-routine",
    title: "Morning routine picture chart",
    fileName: "mindbloom-morning-routine.pdf",
  },
  {
    id: "homework-planner",
    title: "Homework chunking planner",
    fileName: "mindbloom-homework-planner.pdf",
  },
  {
    id: "feelings-thermometer",
    title: "Feelings thermometer",
    fileName: "mindbloom-feelings-thermometer.pdf",
  },
  {
    id: "weekly-reward",
    title: "Weekly reward chart",
    fileName: "mindbloom-weekly-reward-chart.pdf",
  },
] as const;

async function downloadWorksheet(id: (typeof worksheets)[number]["id"]) {
  const worksheet = worksheets.find((item) => item.id === id);
  if (!worksheet) return;

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;

  doc.setFillColor(226, 244, 250);
  doc.rect(0, 0, pageWidth, 43, "F");
  doc.setTextColor(39, 82, 91);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("MINDBLOOM KIDS", margin, 16);
  doc.setFontSize(19);
  doc.text(worksheet.title, margin, 31, { maxWidth: pageWidth - margin * 2 });
  doc.setTextColor(55, 65, 70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Name: __________________________________", margin, 55);
  doc.text("Date: __________________", pageWidth - 75, 55);

  const checkbox = (label: string, x: number, y: number) => {
    doc.setDrawColor(100, 116, 120);
    doc.rect(x, y - 4, 5, 5);
    doc.text(label, x + 9, y);
  };

  const promptLine = (label: string, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setDrawColor(170, 185, 188);
    doc.line(margin, y + 13, pageWidth - margin, y + 13);
  };

  if (id === "morning-routine") {
    doc.text("Check off each step as you finish it. Your routine can be your own.", margin, 69);
    ["Get dressed", "Brush teeth", "Eat breakfast", "Pack my bag", "Shoes and coat"].forEach(
      (step, index) => checkbox(step, margin + 2, 88 + index * 19),
    );
    promptLine("One thing I am looking forward to:", 194);
    promptLine("A grown-up who can help me:", 226);
  } else if (id === "homework-planner") {
    doc.text("Break schoolwork into small steps. Take a short break between chunks.", margin, 69);
    ["First task", "Next task", "Last task"].forEach((task, index) => {
      const top = 82 + index * 57;
      doc.setDrawColor(170, 185, 188);
      doc.roundedRect(margin, top, pageWidth - margin * 2, 49, 3, 3);
      doc.setFont("helvetica", "bold");
      doc.text(task, margin + 6, top + 10);
      doc.setFont("helvetica", "normal");
      doc.text("Small step: __________________________________________", margin + 6, top + 23);
      doc.text("Break after: __________________________________________", margin + 6, top + 37);
    });
    promptLine("When I finish, I will:", 269);
  } else if (id === "feelings-thermometer") {
    doc.text(
      "Circle the level that feels closest right now. There is no wrong answer.",
      margin,
      69,
    );
    const levels = [
      ["1", "Calm", [190, 232, 214]],
      ["2", "Okay", [220, 239, 190]],
      ["3", "Wiggly", [255, 237, 170]],
      ["4", "Frustrated", [255, 211, 166]],
      ["5", "Overwhelmed", [250, 190, 183]],
    ] as const;
    levels.forEach(([number, label, color], index) => {
      const top = 82 + index * 25;
      doc.setFillColor(...color);
      doc.roundedRect(margin, top, pageWidth - margin * 2, 18, 3, 3, "F");
      doc.setTextColor(45, 55, 60);
      doc.setFont("helvetica", "bold");
      doc.text(number, margin + 8, top + 12);
      doc.setFont("helvetica", "normal");
      doc.text(label, margin + 22, top + 12);
    });
    doc.setTextColor(55, 65, 70);
    promptLine("I notice this in my body:", 224);
    promptLine("Something that could help me:", 258);
  } else {
    doc.text("Choose a few goals together. Mark a box for each day you try.", margin, 69);
    const labelWidth = 46;
    const dayWidth = (pageWidth - margin * 2 - labelWidth) / 7;
    const tableTop = 87;
    doc.setFont("helvetica", "bold");
    ["Goal", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((label, index) => {
      const x = index === 0 ? margin : margin + labelWidth + (index - 1) * dayWidth;
      doc.text(label, x + 1, tableTop);
    });
    doc.setFont("helvetica", "normal");
    ["Get ready", "Start homework", "Move my body", "Wind down"].forEach((goal, row) => {
      const y = tableTop + 12 + row * 22;
      doc.setDrawColor(170, 185, 188);
      doc.line(margin, y + 7, pageWidth - margin, y + 7);
      doc.text(goal, margin + 1, y);
      for (let day = 0; day < 7; day += 1) {
        doc.rect(margin + labelWidth + day * dayWidth + 6, y - 4, 5, 5);
      }
    });
    promptLine("When we reach our goal, we can:", 203);
  }

  doc.setFontSize(8);
  doc.setTextColor(110, 125, 128);
  doc.text("Small steps count. Adapt this page to fit your family.", margin, 285);
  doc.save(worksheet.fileName);
}

const articles = [
  {
    title: "Why rewards stop working (and how to refresh them)",
    excerpt: "Novelty is fuel for an ADHD brain. Rotate rewards before they go stale.",
  },
  {
    title: "Talking to your child's school without conflict",
    excerpt: "A simple one-page summary that teachers actually read and act on.",
  },
  {
    title: "Mornings that don't end in shouting",
    excerpt: "Move three decisions to the night before and watch the pressure drop.",
  },
];

function ParentCorner() {
  return (
    <>
      <PageHero
        eyebrow="Parent corner"
        title="You know your child best — we'll add the tools"
        description="Short, practical guidance you can read in a coffee break and try the same evening."
      />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {guides.map((g) => (
            <article key={g.title} className="card-soft p-6">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-sunny-soft text-primary">
                <g.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-bold">{g.title}</h2>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                {g.points.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="card-soft mt-8 p-8">
          <h2 className="text-2xl font-bold">Free Downloadable Worksheets</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a worksheet to download a print-ready PDF instantly.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {worksheets.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => downloadWorksheet(w.id)}
                  className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-border bg-sky-soft/50 px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-sky-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-label={`Download ${w.title} as a PDF`}
                >
                  <Download className="size-4 shrink-0 text-sky" />
                  <span className="flex-1">{w.title}</span>
                  <span className="shrink-0 text-xs font-bold text-sky">Download PDF</span>
                </button>
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
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
