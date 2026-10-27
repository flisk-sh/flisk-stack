import { Glob } from 'bun';
import { join } from 'node:path';
import type { Action } from './action';

// Imports every *.ts file under `dir` and returns its default export. Actions are sorted by path
// so that a static route (/posts/latest) registers before a parameter route (/posts/:id).
export async function loadActions(dir: string): Promise<Action[]> {
  const actions: Action[] = [];
  for await (const file of new Glob('**/*.{ts,js}').scan({ cwd: dir })) {
    const mod = await import(join(dir, file));
    if (!mod.default?.handle) throw new Error(`${file} has no default export from defineAction()`);
    actions.push(mod.default);
  }
  const rank = (a: Action) => a.path.split('/').map((s) => (s.startsWith(':') ? '~' : s)).join('/');
  return actions.sort((a, b) => (rank(a) < rank(b) ? -1 : 1));
}
