/**
 * Tiny browser-only helpers to export a tabular report to CSV / PDF.
 *
 * No extra dependencies: CSV is built as a string and downloaded via a
 * `data:` URL; PDF reuses the browser's print-to-PDF flow by opening a
 * tiny popup window with the table HTML and calling `window.print()`.
 */

export interface ExportColumn<T = Record<string, unknown>> {
  /** Object key used to look up the row value (or pass `getValue`). */
  key: string;
  /** Header text shown in the file / printout. */
  label: string;
  /** Optional formatter — receives the raw cell value plus the whole row. */
  getValue?: (row: T) => string | number | null | undefined;
  /** Column alignment for the PDF/print view ("right" for money, etc.). */
  align?: 'left' | 'right' | 'center';
}

const escapeCsvCell = (value: unknown): string => {
  if (value == null) return '';
  const s = String(value);
  // RFC 4180: wrap in quotes if it contains comma, quote, or newline; double internal quotes.
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const triggerDownload = (content: string, mime: string, filename: string): void => {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so the download has time to start in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Resolve a row's value for a given column. Uses `getValue` if provided,
 * otherwise falls back to `row[key]`.
 */
const cellValue = <T extends Record<string, unknown>>(row: T, col: ExportColumn<T>): string => {
  const raw = col.getValue ? col.getValue(row) : (row as Record<string, unknown>)[col.key];
  return raw == null ? '' : String(raw);
};

/**
 * Trigger a CSV download.
 * @param rows       Array of objects, one per table row.
 * @param columns    Column definitions (header + accessor).
 * @param filename   With or without `.csv` extension.
 * @param totalsRow  Optional totals row already in the same shape as `rows`.
 */
export function exportToCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename: string,
  totalsRow?: T,
): void {
  const header = columns.map(c => escapeCsvCell(c.label)).join(',');
  const body = rows.map(r => columns.map(c => escapeCsvCell(cellValue(r, c))).join(','));
  const lines = [header, ...body];
  if (totalsRow) {
    lines.push(columns.map(c => escapeCsvCell(cellValue(totalsRow, c))).join(','));
  }
  // Prepend BOM so Excel opens UTF-8 (ñ/á/é) correctly.
  const csv = '﻿' + lines.join('\r\n');
  const name = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  triggerDownload(csv, 'text/csv', name);
}

/**
 * Open a clean print window with the table rendered. The user picks
 * "Save as PDF" from the system print dialog. Cross-browser, no deps.
 */
export function exportToPdf<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportColumn<T>[],
  title: string,
  totalsRow?: T,
): void {
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return; // popup blocker; caller can show a message if needed.

  const head = `<tr>${columns
    .map(c => `<th style="text-align:${c.align || 'left'}">${escapeHtml(c.label)}</th>`)
    .join('')}</tr>`;

  const body = rows
    .map(r =>
      `<tr>${columns
        .map(c => `<td style="text-align:${c.align || 'left'}">${escapeHtml(cellValue(r, c))}</td>`)
        .join('')}</tr>`,
    )
    .join('');

  const totals = totalsRow
    ? `<tr class="totals">${columns
        .map(c => `<td style="text-align:${c.align || 'left'}">${escapeHtml(cellValue(totalsRow, c))}</td>`)
        .join('')}</tr>`
    : '';

  w.document.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 16px; color: #1f2937; }
  h1 { font-size: 18px; margin: 0 0 12px; }
  .meta { font-size: 11px; color: #6b7280; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #d1d5db; padding: 4px 6px; }
  th { background: #f3f4f6; font-weight: 600; }
  tr.totals td { background: #eef2ff; font-weight: 700; }
  @page { size: landscape; margin: 12mm; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<div class="meta">Generado ${new Date().toLocaleString('es-DO')}</div>
<table>
  <thead>${head}</thead>
  <tbody>${body}${totals}</tbody>
</table>
<script>
  window.onload = () => { setTimeout(() => { window.print(); }, 250); };
</script>
</body>
</html>`);
  w.document.close();
}
