import { it, expect } from 'vitest';
import { readNiche, writeNiche } from '../src/router.js';
const valid = ['restaurantes', 'saude'];
it.each([['#restaurantes', 'restaurantes'], ['#SAUDE', 'saude'], ['#Sa%C3%BAde', 'saude'], ['#saúde', 'saude'],
  ['#xyz', 'todos'], ['', 'todos'], ['#', 'todos'], ['#%E0%A4%A', 'todos']])
  ('readNiche(%s)', (h, out) => expect(readNiche(h, valid)).toBe(out));
it('writeNiche sets and clears hash', () => {
  writeNiche('saude'); expect(location.hash).toBe('#saude');
  writeNiche('todos'); expect(location.hash).toBe('');
});
