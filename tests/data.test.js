import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRows, waveCoordinates } from '../src/data.js';
test('CSV booleans are normalized rather than treated as truthy strings', () => {
  const rows = parseRows([{ status: 'false' }, { status: 'TRUE' }, { status: 0 }, { status: 1 }]);
  assert.deepEqual(rows.map((row) => row.status), [false, true, false, true]);
});
test('invalid records and oversized datasets are rejected', () => {
  assert.throws(() => parseRows([{ status: 'maybe' }]), /status/);
  assert.throws(() => parseRows([{ status: true, category: 'Other' }]), /category/);
  assert.throws(() => parseRows(Array(501).fill({ status: true })), /500/);
});
test('curve is centered and the first incorrect record has greater amplitude', () => {
  const points = waveCoordinates(parseRows([{ status: true }, { status: true }]));
  assert.equal(points[0][0] + points[1][0], 0);
  const correct = waveCoordinates(parseRows([{ status: true }]))[0];
  const wrong = waveCoordinates(parseRows([{ status: false }]))[0];
  assert.ok(Math.abs(wrong[1]) > Math.abs(correct[1]));
});
