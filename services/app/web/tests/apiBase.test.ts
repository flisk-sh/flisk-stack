import { describe, expect, it } from 'bun:test';
import { apiBase } from '../src/apiBase';

const page = (hostname: string, port = '') => ({ protocol: 'http:', hostname, port });

describe('apiBase', () => {
  it('derives the api URL from the page when the build had no VITE_API_URL', () => {
    expect(apiBase('', page('app.flisk-stack.localhost', '8081'))).toBe('http://api.flisk-stack.localhost:8081/api/api');
    expect(apiBase('', page('app.flisk-stack.localhost'))).toBe('http://api.flisk-stack.localhost/api/api');
  });

  it('falls back to same-origin for a page that is not an app.* host', () => {
    expect(apiBase('', page('example.com'))).toBe('');
  });

  it('adds the page port when Flisk fell back from port 80', () => {
    expect(apiBase('http://api.flisk-stack.localhost/api/api', page('app.flisk-stack.localhost', '8081'))).toBe(
      'http://api.flisk-stack.localhost:8081/api/api',
    );
  });

  it('keeps a URL that already has a port, and works without a page', () => {
    expect(apiBase('http://api.x.localhost:9000/api/api', page('app.x.localhost', '8081'))).toBe('http://api.x.localhost:9000/api/api');
    expect(apiBase('http://api.x.localhost/api/api', undefined)).toBe('http://api.x.localhost/api/api');
  });
});
