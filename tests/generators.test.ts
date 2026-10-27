import { describe, expect, it } from 'bun:test';
import { makeAction, makeJob, makeMigration, makeModel, makeView, pascal, snake, timestamp } from '../bin/generators';

const at = new Date('2026-10-27T15:30:00Z');

describe('names', () => {
  it('converts between cases', () => {
    expect(pascal('send-welcome_email')).toBe('SendWelcomeEmail');
    expect(pascal('posts/archive-post')).toBe('Posts/ArchivePost');
    expect(snake('BlogPost')).toBe('blog_post');
    expect(timestamp(at)).toBe('20261027153000');
  });
});

describe('generators', () => {
  it('puts an action under api/src/Actions with a matching route and import depth', () => {
    const [file] = makeAction('posts/archive-post');
    expect(file.path).toBe('services/app/api/src/Actions/Posts/ArchivePost.ts');
    expect(file.content).toContain("from '../../framework/action'");
    expect(file.content).toContain("path: '/posts/archive-post'");
  });

  it('creates a model with its migration', () => {
    const files = makeModel('Comment', at);
    expect(files.map((f) => f.path)).toEqual([
      'services/app/api/src/Models/Comment.ts',
      'services/app/migrations/prisma/migrations/20261027153000_create_comments/migration.sql',
    ]);
    expect(files[1].content).toContain('CREATE TABLE comments');
  });

  it('creates an empty migration folder', () => {
    expect(makeMigration('AddSlugToPosts', undefined, at)[0].path).toBe(
      'services/app/migrations/prisma/migrations/20261027153000_add_slug_to_posts/migration.sql',
    );
  });

  it('places jobs and views where the loaders look', () => {
    expect(makeJob('send-welcome-email')[0].path).toBe('services/app/worker/src/Jobs/SendWelcomeEmail.ts');
    expect(makeView('pricing')[0].path).toBe('services/app/web/src/views/Pricing.vue');
  });
});
