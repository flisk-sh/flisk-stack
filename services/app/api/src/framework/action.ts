import type { Rules } from './validation';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ActionContext<I = Record<string, unknown>> {
  params: Record<string, string>;
  query: Record<string, string>;
  /** The request body, already checked against `rules` and stripped to the fields they name. */
  input: I;
}

export interface Action<I = Record<string, unknown>, O = unknown> {
  name: string;
  method: HttpMethod;
  path: string;
  /** Status for a successful response. Defaults to 200. */
  status?: 200 | 201 | 202 | 204;
  rules?: Rules;
  handle(ctx: ActionContext<I>): O | Promise<O>;
}

// One file in src/Actions = one endpoint. The loader picks it up; no route file to edit.
export function defineAction<I = Record<string, unknown>, O = unknown>(action: Action<I, O>): Action<I, O> {
  return action;
}
