import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Action } from './framework/action';
import { registerActions } from './framework/router';

// The frontend runs on its own *.localhost origin (app.<project>.localhost), so the browser needs CORS to call this API.
const LOCAL_FRONTEND_ORIGIN = /^https?:\/\/([a-z0-9-]+\.)+localhost(:\d+)?$/;

export function createApp(actions: Action[]) {
  const app = new Hono();
  app.use('*', cors({ origin: (origin) => (LOCAL_FRONTEND_ORIGIN.test(origin) ? origin : undefined) }));

  // Health check endpoint (required by TILT_RESOURCE_DEFAULTS.star)
  app.get('/health', (c) => c.json({ status: 'ok', service: 'api' }));

  // Lists every Action, so `curl` on the root shows what the API offers.
  app.get('/', (c) =>
    c.json({
      service: 'api',
      actions: actions.map((a) => ({ name: a.name, method: a.method, path: a.path })),
    }),
  );

  registerActions(app, actions);
  return app;
}
