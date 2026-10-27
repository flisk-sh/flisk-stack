import { describe, expect, it } from 'bun:test';
import { apiBase } from '../src/apiBase';

describe('apiBase', () => {
  it('adds the page port when Flisk fell back from port 80', () => {
    expect(apiBase('http://api.flisk-stack.localhost/api/api', '8081')).toBe('http://api.flisk-stack.localhost:8081/api/api');
  });

  it('keeps a URL that already has a port, and an empty one', () => {
    expect(apiBase('http://api.x.localhost:9000/api/api', '8081')).toBe('http://api.x.localhost:9000/api/api');
    expect(apiBase('', '8081')).toBe('');
  });

  it('leaves the URL alone on the default port', () => {
    expect(apiBase('http://api.x.localhost/api/api', '')).toBe('http://api.x.localhost/api/api');
  });
});
