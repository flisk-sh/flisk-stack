import { describe, expect, it } from 'bun:test';
import { pathFor, routesFrom } from '../src/routes';

describe('file-based routes', () => {
  it('maps view files to paths', () => {
    expect(pathFor('./views/Index.vue')).toBe('/');
    expect(pathFor('./views/About.vue')).toBe('/about');
    expect(pathFor('./views/BlogArchive.vue')).toBe('/blog-archive');
    expect(pathFor('./views/posts/[id].vue')).toBe('/posts/:id');
    expect(pathFor('./views/posts/index.vue')).toBe('/posts');
  });

  it('puts static paths before parameter paths', () => {
    const routes = routesFrom({ './views/posts/[id].vue': 'show', './views/posts/New.vue': 'new', './views/Index.vue': 'home' });
    expect(routes.map((r) => r.path)).toEqual(['/', '/posts/new', '/posts/:id']);
  });
});
