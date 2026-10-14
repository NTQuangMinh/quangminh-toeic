/**
 * Export and Print utilities for Quang Minh TOEIC
 * Supports UTF-8 CSV download for Excel/Anki and printable A4 study sheets.
 */

export interface ExportVocabItem {
  word: string;
  partOfSpeech: string;
  meaningVi: string;
  meaningEn?: string | null;
  pronunciation?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  topic?: string;
  toeicParts?: string;
}

/**
 * Export vocabulary list as UTF-8 CSV with Excel-compatible BOM
 */
export function exportVocabToCSV(
  arg1: string | ExportVocabItem[],
  arg2?: string | ExportVocabItem[]
): void {
  let items: ExportVocabItem[] = [];
  let filename = "tu-vung-toeic.csv";

  if (Array.isArray(arg1)) {
    items = arg1;
    if (typeof arg2 === "string") filename = arg2;
  } else if (typeof arg1 === "string" && Array.isArray(arg2)) {
    filename = arg1;
    items = arg2;
  }

  if (typeof window === "undefined" || items.length === 0) return;

  const headers = [
    "Từ tiếng Anh (Word)",
    "Loại từ (Part of Speech)",
    "Nghĩa tiếng Việt",
    "Nghĩa tiếng Anh",
    "Phiên âm (IPA)",
    "Câu ví dụ TOEIC",
    "Dịch câu ví dụ",
    "Chủ đề (Topic)",
    "Part thi TOEIC",
  ];

  const escapeCSV = (val?: string | null) => {
    if (!val) return '""';
    const clean = val.replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = items.map((item) => [
    escapeCSV(item.word),
    escapeCSV(item.partOfSpeech),
    escapeCSV(item.meaningVi),
    escapeCSV(item.meaningEn),
    escapeCSV(item.pronunciation),
    escapeCSV(item.exampleSentence),
    escapeCSV(item.exampleTranslation),
    escapeCSV(item.topic),
    escapeCSV(item.toeicParts),
  ]);

  // Prepend UTF-8 BOM \uFEFF for Excel compatibility
  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open a clean printable A4 sheet for offline revision
 */
export function printVocabularySheet(
  arg1: string | ExportVocabItem[],
  arg2?: string | ExportVocabItem[]
): void {
  let items: ExportVocabItem[] = [];
  let title = "Danh Sách Từ Vựng TOEIC";

  if (Array.isArray(arg1)) {
    items = arg1;
    if (typeof arg2 === "string") title = arg2;
  } else if (typeof arg1 === "string" && Array.isArray(arg2)) {
    title = arg1;
    items = arg2;
  }

  if (typeof window === "undefined" || items.length === 0) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Trình duyệt đã chặn cửa sổ in. Bạn vui lòng bật pop-up để in danh sách từ vựng nhé!");
    return;
  }

  const tableRows = items
    .map(
      (item, idx) => `
      <tr>
        <td style="text-align: center; width: 40px; color: #64748b;">${idx + 1}</td>
        <td style="width: 140px; font-weight: 700; color: #1e293b;">
          ${item.word}
          <div style="font-size: 11px; font-weight: 400; color: #64748b; font-family: monospace;">${item.pronunciation || ""}</div>
        </td>
        <td style="width: 90px; color: #2563eb; font-weight: 600; font-size: 12px;">${item.partOfSpeech}</td>
        <td style="width: 200px; font-weight: 600; color: #0f172a;">${item.meaningVi}</td>
        <td style="color: #334155; font-size: 12px; font-style: italic;">
          "${item.exampleSentence || ""}"
          <div style="color: #64748b; font-style: normal; font-size: 11px;">➜ ${item.exampleTranslation || ""}</div>
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${title} - Quang Minh TOEIC</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #0f172a; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: 900; color: #1e293b; }
        .subtitle { font-size: 12px; color: #64748b; }
        .brand { font-size: 16px; font-weight: 800; color: #2563eb; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
        tr:nth-child(even) { background-color: #f8fafc; }
        @media print {
          body { margin: 10mm; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">${title}</div>
          <div class="subtitle">Tổng số: ${items.length} từ vựng • Ngày in: ${new Date().toLocaleDateString("vi-VN")}</div>
        </div>
        <div class="brand">Quang Minh TOEIC Pro</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Từ vựng & Phiên âm</th>
            <th>Loại từ</th>
            <th>Nghĩa tiếng Việt</th>
            <th>Câu ví dụ trong đề thi TOEIC</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
