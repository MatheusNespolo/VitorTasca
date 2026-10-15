import { it, expect } from 'vitest';
import { parseYouTubeId, thumbUrl, embedUrl } from '../src/domain/youtube.js';
it.each([
  ['DRcc5s0UkFE', 'DRcc5s0UkFE'],
  ['  qnKdh-0LO9A ', 'qnKdh-0LO9A'],
  ['https://www.youtube.com/watch?v=ffJgbxoG_5k&t=10s', 'ffJgbxoG_5k'],
  ['https://youtu.be/TmJ4nGZJyJ0?si=abc', 'TmJ4nGZJyJ0'],
  ['https://www.youtube.com/shorts/QjqutziGnm8', 'QjqutziGnm8'],
  ['https://www.youtube.com/embed/HZJqueu4HBk', 'HZJqueu4HBk'],
  ['https://m.youtube.com/watch?feature=share&v=Yue2URbdrhc', 'Yue2URbdrhc'],
  ['https://www.youtube-nocookie.com/embed/V0MzkmC9B1s?rel=0', 'V0MzkmC9B1s'],
])('parses %s', (input, id) => expect(parseYouTubeId(input)).toBe(id));
it.each(['', 'abc', 'https://vimeo.com/123', 'https://youtube.com/watch?v=short', null, undefined])
  ('rejects %s', input => expect(parseYouTubeId(input)).toBeNull());
it('builds thumb and embed urls', () => {
  expect(thumbUrl('abcdefghijk')).toBe('https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg');
  expect(thumbUrl('abcdefghijk', 'hqdefault')).toBe('https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg');
  expect(embedUrl('abcdefghijk')).toBe('https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0&modestbranding=1');
});
