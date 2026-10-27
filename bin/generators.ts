// The templates behind `bun stack make:*`. Each returns the files to write; bin/stack.ts writes them.
export interface GeneratedFile {
  path: string;
  content: string;
}

const APP = 'services/app';

export function pascal(name: string): string {
  return name
    .split('/')
    .map((part) => part.replace(/(^|[-_\s]+)(\w)/g, (_, __, c: string) => c.toUpperCase()))
    .join('/');
}

export function snake(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

function last(name: string): string {
  return name.split('/').pop() as string;
}

function depth(name: string): string {
  return '../'.repeat(name.split('/').length);
}

// 20261027153000 — sorts the same way Prisma applies migrations.
export function timestamp(date = new Date()): string {
  return date.toISOString().replace(/[-:T]/g, '').slice(0, 14);
}

export function makeAction(rawName: string): GeneratedFile[] {
  const name = pascal(rawName);
  const route = name.split('/').map(snake).join('/').replace(/_/g, '-');
  return [
    {
      path: `${APP}/api/src/Actions/${name}.ts`,
      content: `import { defineAction } from '${depth(name)}framework/action';

export default defineAction({
  name: '${last(name)}',
  method: 'GET',
  path: '/${route}',
  handle() {
    return { message: '${last(name)} works' };
  },
});
`,
    },
  ];
}

export function makeMigration(rawName: string, sql?: string, date = new Date()): GeneratedFile[] {
  const name = snake(rawName);
  return [
    {
      path: `${APP}/migrations/prisma/migrations/${timestamp(date)}_${name}/migration.sql`,
      content: sql ?? `-- ${name}\n`,
    },
  ];
}

export function makeModel(rawName: string, date = new Date()): GeneratedFile[] {
  const name = pascal(rawName);
  const table = `${snake(name)}s`;
  return [
    {
      path: `${APP}/api/src/Models/${name}.ts`,
      content: `import { defineModel } from '../framework/model';

export interface ${name} {
  id: number;
  name: string;
  created_at: Date;
}

export const ${name} = defineModel<${name}>({
  table: '${table}',
  fillable: ['name'],
});
`,
    },
    ...makeMigration(
      `create_${table}`,
      `CREATE TABLE ${table} (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`,
      date,
    ),
  ];
}

export function makeJob(rawName: string): GeneratedFile[] {
  const name = pascal(rawName);
  return [
    {
      path: `${APP}/worker/src/Jobs/${name}.ts`,
      content: `import { defineJob } from '../framework/job';

// Queue it from the api: await dispatch('${name}', { ... })
export default defineJob({
  handle(payload) {
    console.log('[${name}]', payload);
  },
});
`,
    },
  ];
}

export function makeView(rawName: string): GeneratedFile[] {
  const name = pascal(rawName);
  return [
    {
      path: `${APP}/web/src/views/${name}.vue`,
      content: `<template>
  <h1>${last(name)}</h1>
</template>
`,
    },
  ];
}

export const generators: Record<string, (name: string) => GeneratedFile[]> = {
  'make:action': makeAction,
  'make:model': (name) => makeModel(name),
  'make:migration': (name) => makeMigration(name),
  'make:job': makeJob,
  'make:view': makeView,
};
