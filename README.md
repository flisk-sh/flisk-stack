# flisk-stack

**A convention-over-configuration full-stack app skeleton, run locally by [Flisk](https://github.com/flisk-sh/flisk).**

Add a feature by adding a file. An Action becomes an endpoint, a Job becomes a background task, a view becomes a page, and a migration folder becomes a schema change (plain SQL that `prisma migrate deploy` applies). You don't edit a route file, a queue registry or a router config. One command starts the whole thing on your laptop: Postgres, migrations, API, worker and web app.

Click **Use this template** on GitHub, or from the terminal:

```bash
gh repo create my-app --template flisk-sh/flisk-stack --clone && cd my-app
bun install
bun stack dev        # = flisk up app
```

| What | URL |
| --- | --- |
| Web app (Vue) | http://app.flisk-stack.localhost:8081/web |
| API (Hono on Bun) | http://api.flisk-stack.localhost:8081/api/api/ (Flisk's proxy adds the `/api/api` prefix, so `GET /posts` is `/api/api/posts`) |
| Tilt UI (logs, restarts) | http://localhost:10350 |

`flisk up` prints the actual URLs. The ports change if 80 or 8081 is taken.

> Flisk runs your stack **locally**. It is not a deploy tool. Build images from these services with your own pipeline when you ship.

## Layout

```text
services/app/
├── api/                      # backend: Bun + Hono
│   └── src/
│       ├── Actions/          # one file = one endpoint (auto-registered)
│       │   └── Posts/CreatePost.ts
│       ├── Models/           # one file = one table (thin Active Record)
│       ├── config/app.ts
│       └── framework/        # defineAction, defineModel, validate, dispatch
├── worker/                   # background jobs from the Postgres queue
│   └── src/Jobs/             # one file = one job, named after the file
├── migrations/               # appType "migrator": runs once before api/worker
│   ├── prisma/migrations/    # one folder per schema change (plain SQL)
│   └── src/seeders/          # seed data, applied after the migrations
└── web/                      # frontend: Vue 3 + vue-router
    └── src/
        ├── views/            # one file = one page (file-based routes)
        ├── components/
        └── layouts/
bin/stack.ts                  # the `bun stack` CLI
```

Every directory under `services/app/` is a Flisk resource described by its `service.json`. Flisk generates the Docker, Tilt and Traefik setup from those files.

## Actions

```ts
// services/app/api/src/Actions/Posts/CreatePost.ts
export default defineAction<{ title: string; body?: string }>({
  name: 'CreatePost',
  method: 'POST',
  path: '/posts',
  status: 201,
  rules: { title: 'required|string|min:3|max:120', body: 'string|max:5000' },
  async handle({ input }) {
    const post = await Post.create(input);
    await dispatch('NotifyNewPost', { postId: post.id, title: post.title });
    return post;
  },
});
```

- The result comes back as `{ "data": ... }`.
- A failed rule returns `422` with `{ "errors": { "title": ["title is required"] } }`.
- `throw new HttpError(404, 'post not found')` returns that status.
- `GET /` on the api lists every registered Action.

Rules: `required`, `string`, `number`, `integer`, `email`, `min:n`, `max:n` (length for strings, value for numbers).

## Models

```ts
export const Post = defineModel<Post>({ table: 'posts', fillable: ['title', 'body'] });

await Post.all();  await Post.find(1);  await Post.where('title', 'Hi');
await Post.create({ title: 'Hi' });  await Post.update(1, { body: '…' });  await Post.delete(1);
```

Models use Bun's built-in SQL client against the Postgres that Flisk starts, which provides `DATABASE_URL`. `create` and `update` only write `fillable` columns.

## Jobs

```ts
// services/app/worker/src/Jobs/NotifyNewPost.ts
export default defineJob<{ postId: number; title: string }>({
  backoffSeconds: 5,
  handle({ postId, title }) { console.log(`new post #${postId}: ${title}`); },
});
```

`dispatch('NotifyNewPost', payload)` in the api inserts a row into the `jobs` table. The worker claims rows with `FOR UPDATE SKIP LOCKED`, so you can run several replicas. A failing job retries with backoff until `max_attempts`, then it is marked failed and `last_error` holds the reason.

## Views

| File | Route |
| --- | --- |
| `views/Index.vue` | `/` |
| `views/About.vue` | `/about` |
| `views/posts/[id].vue` | `/posts/:id` |

## The `bun stack` CLI

```bash
bun stack dev                     # flisk up app
bun stack status                  # flisk status
bun stack migrate                 # flisk restart migrations
bun stack down                    # flisk down
bun stack doctor                  # flisk doctor
bun stack test                    # every service's tests

bun stack make:action Posts/ArchivePost
bun stack make:model Comment      # model + create_comments migration
bun stack make:migration add_slug_to_posts
bun stack make:job SendWelcomeEmail
bun stack make:view Pricing
```

Generators never overwrite an existing file.

## Tests

```bash
bun test                          # unit tests, no database needed
bun run typecheck
```

The api's Postgres test runs against the live stack:

```bash
bun stack dev
TEST_DATABASE_URL=postgresql://flisk_stack:<DB_PASSWORD from .env>@localhost:15432/flisk_stack_app bun test
```

## Related

- [Flisk CLI](https://github.com/flisk-sh/flisk): the engine that runs this
- [flisk-agent-stack](https://github.com/flisk-sh/flisk-agent-stack): the same idea for AI agents
- [flisk-ecommerce-example](https://github.com/flisk-sh/flisk-ecommerce-example)

Inspired by [Stacks](https://github.com/stacksjs/stacks) and Laravel's conventions.

## License

MIT

## Notes

- Flisk picks free host ports. If 80 is taken it uses 8081 for HTTP, and the web app then needs `FLISK_HTTP_PORT` set the same way it was started, or the printed URLs, to reach the api.
- The service images run compiled output (`tsc` to `dist/`), so each service has a `build` script and a `tsconfig.json` that emits.
