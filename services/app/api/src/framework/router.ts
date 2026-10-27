import type { Hono } from 'hono';
import type { Action } from './action';
import { HttpError, ValidationError } from './errors';
import { validate } from './validation';

export function registerActions(app: Hono, actions: Action[]): void {
  for (const action of actions) {
    app.on(action.method, action.path, async (c) => {
      const raw = action.method === 'GET' || action.method === 'DELETE' ? {} : await c.req.json().catch(() => ({}));
      const input = action.rules ? validate(raw, action.rules) : (raw as Record<string, unknown>);
      const data = await action.handle({ params: c.req.param() as Record<string, string>, query: c.req.query(), input });
      const status = action.status ?? 200;
      return status === 204 ? c.body(null, 204) : c.json({ data }, status);
    });
  }

  app.onError((err, c) => {
    if (err instanceof ValidationError) return c.json({ error: err.message, errors: err.errors }, 422);
    if (err instanceof HttpError) return c.json({ error: err.message }, err.status);
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  });
}
