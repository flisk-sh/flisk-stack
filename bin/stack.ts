#!/usr/bin/env bun
// `bun stack <command>`: one CLI for the day-to-day loop. Runtime commands call the Flisk CLI.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { generators } from './generators';

const ROOT = join(import.meta.dir, '..');

const flisk: Record<string, { args: string[]; help: string }> = {
  dev: { args: ['up', 'app'], help: 'start the whole stack (postgres, migrations, api, worker, web)' },
  down: { args: ['down'], help: 'stop the stack' },
  status: { args: ['status'], help: 'show every resource and its URL' },
  migrate: { args: ['restart', 'migrations'], help: 'apply new migrations and seeders' },
  doctor: { args: ['doctor'], help: 'check Docker, Tilt and the project' },
};

function help(): void {
  console.log('Usage: bun stack <command> [name]\n');
  for (const [cmd, { help }] of Object.entries(flisk)) console.log(`  ${cmd.padEnd(16)} ${help}`);
  console.log(`  ${'test'.padEnd(16)} run every service's tests`);
  for (const cmd of Object.keys(generators)) console.log(`  ${`${cmd} <Name>`.padEnd(16)} scaffold a file`);
}

async function run(cmd: string[]): Promise<number> {
  return Bun.spawn(cmd, { cwd: ROOT, stdio: ['inherit', 'inherit', 'inherit'] }).exited;
}

const [command, name] = process.argv.slice(2);

if (!command || command === 'help' || command === '--help') {
  help();
} else if (command in flisk) {
  process.exit(await run(['flisk', ...flisk[command].args]));
} else if (command === 'test') {
  process.exit(await run(['bun', 'test']));
} else if (command in generators) {
  if (!name) {
    console.error(`Usage: bun stack ${command} <Name>`);
    process.exit(1);
  }
  for (const file of generators[command](name)) {
    const target = join(ROOT, file.path);
    if (existsSync(target)) {
      console.error(`exists, left alone: ${file.path}`);
      process.exitCode = 1;
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.content);
    console.log(`created ${file.path}`);
  }
} else {
  console.error(`Unknown command "${command}".\n`);
  help();
  process.exit(1);
}
