import { describe, expect, it } from 'bun:test';
import { config } from '../src/config/app';
import { loadActions } from '../src/framework/loader';

describe('loadActions', () => {
  it('discovers every file in src/Actions', async () => {
    const actions = await loadActions(config.actionsDir);
    expect(actions.map((a) => `${a.method} ${a.path}`).sort()).toEqual([
      'DELETE /posts/:id',
      'GET /posts',
      'GET /posts/:id',
      'POST /posts',
    ]);
  });
});
