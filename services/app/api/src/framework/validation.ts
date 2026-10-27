import { ValidationError } from './errors';

// Laravel-style rule strings: 'required|string|max:120'.
export type Rules = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function check(field: string, value: unknown, rule: string): string | null {
  const [name, arg] = rule.split(':');
  const n = Number(arg);
  const size = typeof value === 'string' ? value.length : typeof value === 'number' ? value : null;
  switch (name) {
    case 'required':
      return value === undefined || value === null || value === '' ? `${field} is required` : null;
    case 'string':
      return typeof value === 'string' ? null : `${field} must be a string`;
    case 'number':
      return typeof value === 'number' && Number.isFinite(value) ? null : `${field} must be a number`;
    case 'integer':
      return Number.isInteger(value) ? null : `${field} must be an integer`;
    case 'email':
      return typeof value === 'string' && EMAIL.test(value) ? null : `${field} must be an email address`;
    case 'min':
      return size !== null && size < n ? `${field} must be at least ${n}` : null;
    case 'max':
      return size !== null && size > n ? `${field} must be at most ${n}` : null;
    default:
      throw new Error(`Unknown validation rule "${name}" on ${field}`);
  }
}

// Returns only the fields named in `rules`, or throws a ValidationError (422) listing every failure.
export function validate<T extends Record<string, unknown>>(input: unknown, rules: Rules): T {
  const body = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const errors: Record<string, string[]> = {};
  const out: Record<string, unknown> = {};

  for (const [field, spec] of Object.entries(rules)) {
    const list = spec.split('|');
    const value = body[field];
    // An absent optional field skips its other rules.
    if (!list.includes('required') && (value === undefined || value === null)) continue;
    const failed = list.map((rule) => check(field, value, rule)).filter((m): m is string => m !== null);
    if (failed.length) errors[field] = failed;
    else out[field] = value;
  }

  if (Object.keys(errors).length) throw new ValidationError(errors);
  return out as T;
}
