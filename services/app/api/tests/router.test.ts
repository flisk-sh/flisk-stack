import { describe, expect, it } from 'bun:test';
import { createApp } from '../src/app';
import { defineAction } from '../src/framework/action';
import { HttpError } from '../src/framework/errors';

const echo = defineAction<{ name: string }>({
  name: 'Echo',
  method: 'POST',
  path: '/echo',
  status: 201,
  rules: { name: 'required|string' },
  handle: ({ input }) => ({ hello: input.name }),
});

const show = defineAction({
  name: 'Show',
  method: 'GET',
  path: '/things/:id',
  handle: ({ params, query }) => {
    if (params.id === '0') throw new HttpError(404, 'thing not found');
    return { id: params.id, q: query.q ?? null };
  },
});

const app = createApp([echo, show]);
const post = (path: string, body: unknown) =>
  app.request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

describe('registerActions', () => {
  it('reports health', async () => {
    expect(await (await app.request('/health')).json()).toEqual({ status: 'ok', service: 'api' });
  });

  it('lists the actions on the root', async () => {
    const { actions } = await (await app.request('/')).json();
    expect(actions).toEqual([
      { name: 'Echo', method: 'POST', path: '/echo' },
      { name: 'Show', method: 'GET', path: '/things/:id' },
    ]);
  });

  it('wraps the result in data and uses the action status', async () => {
    const res = await post('/echo', { name: 'flisk', extra: 1 });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ data: { hello: 'flisk' } });
  });

  it('answers 422 with field errors when validation fails', async () => {
    const res = await post('/echo', {});
    expect(res.status).toBe(422);
    expect((await res.json()).errors).toEqual({ name: ['name is required', 'name must be a string'] });
  });

  it('passes params and query, and maps HttpError to its status', async () => {
    expect(await (await app.request('/things/7?q=x')).json()).toEqual({ data: { id: '7', q: 'x' } });
    const missing = await app.request('/things/0');
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ error: 'thing not found' });
  });

  it('allows a *.localhost frontend origin only', async () => {
    const ok = await app.request('/health', { headers: { Origin: 'http://app.flisk-stack.localhost' } });
    expect(ok.headers.get('Access-Control-Allow-Origin')).toBe('http://app.flisk-stack.localhost');
    const other = await app.request('/health', { headers: { Origin: 'https://evil.example' } });
    expect(other.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
