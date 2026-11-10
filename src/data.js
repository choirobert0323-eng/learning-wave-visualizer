export const CATEGORY_WEIGHTS = { Practice: 1, Intermediate: 1.5, Outsource: 2.3, Exam: 3.2 };
export const SAMPLE_ROWS = Array.from({ length: 24 }, (_, i) => ({
  problem_id: i + 1,
  category: Object.keys(CATEGORY_WEIGHTS)[i % 4],
  section: `Unit ${Math.floor(i / 6) + 1}`,
  status: i % 5 !== 2,
}));
export function parseRows(rows) {
  if (!rows.length) throw new Error('The first sheet is empty.');
  if (rows.length > 500) throw new Error('Use 500 rows or fewer for this demo.');
  return rows.map((row, index) => {
    const status = String(row.status ?? '').trim().toLowerCase();
    if (!['true', 'false', '1', '0'].includes(status)) throw new Error(`Row ${index + 2}: status must be true, false, 1 or 0.`);
    const category = row.category || 'Practice';
    if (!(Object.hasOwn(CATEGORY_WEIGHTS, category))) throw new Error(`Row ${index + 2}: unknown category.`);
    return { problem_id: row.problem_id || index + 1, category, section: row.section || 'Unknown', status: status === 'true' || status === '1' };
  });
}
export function waveCoordinates(data) {
  return data.map((row, index) => {
    const frequency = CATEGORY_WEIGHTS[row.category];
    const raw = Math.sin(index * 91.133) * 43758.5453123;
    const distortion = row.status ? 0 : ((raw - Math.floor(raw)) * 2 - 1) * 2;
    const phase = index * 0.22 + frequency * 0.8;
    const amplitude = row.status ? 2 : 6;
    return [(index - (data.length - 1) / 2) * 2, Math.sin(phase) * amplitude + distortion, Math.cos(phase) * amplitude + frequency * 3];
  });
}
