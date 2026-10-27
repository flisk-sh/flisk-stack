// File-based routing: every .vue file under src/views is a page.
//   views/Index.vue       -> /
//   views/About.vue       -> /about
//   views/posts/[id].vue  -> /posts/:id
export function pathFor(file: string): string {
  const segments = file
    .replace(/^\.?\/?views\//, '')
    .replace(/\.vue$/, '')
    .split('/')
    .map((s) => s.replace(/^\[(.+)\]$/, ':$1'))
    .map((s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase())
    .filter((s) => s !== 'index');
  return `/${segments.join('/')}`;
}

export interface PageRoute<C> {
  path: string;
  component: C;
}

// '~' sorts after every letter in code-point order, so static paths sort before parameter paths so /posts/new wins over /posts/:id.
const rank = (path: string) => path.replace(/:/g, '~');

export function routesFrom<C>(modules: Record<string, C>): PageRoute<C>[] {
  return Object.entries(modules)
    .map(([file, component]) => ({ path: pathFor(file), component }))
    .sort((a, b) => (rank(a.path) < rank(b.path) ? -1 : 1));
}
