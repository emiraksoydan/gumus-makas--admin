import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// DejaVuSans, Türkçe karakterleri (ç ğ ı İ ö ş ü Ş Ğ Ö Ü) tam destekler — jsPDF'in
// varsayılan helvetica fontu Latin-1 dışına çıkamadığı için Türkçe karakterler bozuluyordu.
// ÖNEMLİ: Font base64 olarak gömülü (src/utils/dejaVuSansFont.ts) ve YALNIZCA PDF export
// anında dinamik import edilir. Böylece üçüncü-parti CDN, CORS, CSP ve IIS .ttf-MIME
// bağımlılıkları tamamen ortadan kalkar; helvetica fallback'ine düşüp bozulma yaşanmaz.
// Dinamik import, ana paketi şişirmeden ayrı bir chunk'a kodlanır.
const FONT_VFS_NAME = "DejaVuSans.ttf";
const FONT_FAMILY = "DejaVuSans";

let cachedFontBase64: string | null = null;

async function loadTurkishFont(): Promise<string | null> {
  if (cachedFontBase64) return cachedFontBase64;
  try {
    const { DEJAVU_SANS_BASE64 } = await import("./dejaVuSansFont");
    cachedFontBase64 = DEJAVU_SANS_BASE64;
    return cachedFontBase64;
  } catch {
    return null;
  }
}

export async function downloadPdf(
  headers: string[],
  rows: Record<string, string>[],
  filename: string,
) {
  const doc = new jsPDF({ orientation: "landscape" });

  let fontName = "helvetica";
  const fontBase64 = await loadTurkishFont();
  if (fontBase64) {
    try {
      doc.addFileToVFS(FONT_VFS_NAME, fontBase64);
      doc.addFont(FONT_VFS_NAME, FONT_FAMILY, "normal");
      doc.setFont(FONT_FAMILY);
      fontName = FONT_FAMILY;
    } catch {
      fontName = "helvetica";
    }
  }

  autoTable(doc, {
    head: [headers],
    body: rows.map((r) => headers.map((h) => r[h] ?? "")),
    styles: { font: fontName, fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246], font: fontName },
  });
  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
