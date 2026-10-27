import { describe, expect, it } from 'bun:test';
import { ValidationError } from '../src/framework/errors';
import { validate } from '../src/framework/validation';

const errorsOf = (input: unknown, rules: Record<string, string>) => {
  try {
    validate(input, rules);
    return null;
  } catch (err) {
    if (err instanceof ValidationError) return err.errors;
    throw err;
  }
};

describe('validate', () => {
  it('returns only the fields the rules name', () => {
    expect(validate({ title: 'Hello', admin: true }, { title: 'required|string' })).toEqual({ title: 'Hello' });
  });

  it('collects every failure per field', () => {
    expect(errorsOf({ title: 'ab', email: 'nope' }, { title: 'required|string|min:3', email: 'email' })).toEqual({
      title: ['title must be at least 3'],
      email: ['email must be an email address'],
    });
  });

  it('requires required fields and skips absent optional ones', () => {
    expect(errorsOf({}, { title: 'required|string', body: 'string|max:5' })).toEqual({
      title: ['title is required', 'title must be a string'],
    });
  });

  it('checks numbers by value and strings by length', () => {
    expect(errorsOf({ age: 200, name: 'abcdef' }, { age: 'integer|max:150', name: 'max:5' })).toEqual({
      age: ['age must be at most 150'],
      name: ['name must be at most 5'],
    });
  });

  it('rejects an unknown rule', () => {
    expect(() => validate({ a: 1 }, { a: 'shiny' })).toThrow('Unknown validation rule "shiny" on a');
  });
});
