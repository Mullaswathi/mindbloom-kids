export type PrintableWorksheet = {
  id: string;
  title: string;
  description: string;
  prompts: string[];
};

function escapePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7e]/g, "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function wrapText(value: string, maxLength: number) {
  const lines: string[] = [];
  let line = "";

  for (const word of value.split(/\s+/)) {
    if (line && `${line} ${word}`.length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function createPdf(worksheet: PrintableWorksheet) {
  const drawing: string[] = [
    "0.91 0.96 0.91 rg 0 744 595 98 re f",
    "0.17 0.35 0.25 rg",
    `BT /F1 22 Tf 42 795 Td (${escapePdfText(worksheet.title)}) Tj ET`,
    "0.36 0.49 0.38 rg",
  ];

  let y = 770;
  for (const line of wrapText(worksheet.description, 82)) {
    drawing.push(`BT /F1 10 Tf 42 ${y} Td (${escapePdfText(line)}) Tj ET`);
    y -= 14;
  }

  y = 725;
  drawing.push(
    "0.2 0.25 0.22 rg",
    `BT /F1 10 Tf 42 ${y} Td (Name: ____________________________________    Date: ______________) Tj ET`,
  );
  y -= 31;

  const availableHeight = y - 70;
  const rowHeight = Math.min(78, Math.floor(availableHeight / worksheet.prompts.length));

  worksheet.prompts.forEach((prompt, index) => {
    const rowTop = y - index * rowHeight;
    const rowBottom = rowTop - rowHeight + 9;
    drawing.push(
      index % 2 === 0 ? "0.97 0.98 0.95 rg" : "1 1 1 rg",
      `42 ${rowBottom} 511 ${rowHeight - 4} re f`,
      "0.73 0.8 0.72 RG 0.8 w",
      `50 ${rowTop - 9} 12 12 re S`,
      "0.2 0.25 0.22 rg",
      `BT /F1 11 Tf 72 ${rowTop - 9} Td (${escapePdfText(`${index + 1}. ${prompt}`)}) Tj ET`,
    );

    const writingLineY = rowBottom + 18;
    drawing.push(
      "0.82 0.86 0.81 RG 0.6 w",
      `72 ${writingLineY} m 538 ${writingLineY} l S`,
      `${72} ${writingLineY - 17} m 538 ${writingLineY - 17} l S`,
    );
  });

  drawing.push(
    "0.36 0.49 0.38 rg",
    "BT /F1 9 Tf 42 45 Td (Use what works for your family. Small steps and practice count.) Tj ET",
  );

  const stream = drawing.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

export function downloadPrintablePdf(worksheet: PrintableWorksheet) {
  const blob = new Blob([createPdf(worksheet)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${worksheet.id}.pdf`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
