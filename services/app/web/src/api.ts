import { apiBase } from './apiBase';

// Flisk sets VITE_API_URL to the api's public URL (backendName in service.json).
export const API_URL = apiBase(import.meta.env.VITE_API_URL ?? '', globalThis.location?.port ?? '');

export interface Post {
  id: number;
  title: string;
  body: string;
  created_at: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API_URL + path, { headers: { 'Content-Type': 'application/json' }, ...init });
  if (res.status === 204) return undefined as T;
  const json = await res.json();
  if (!res.ok) throw new ApiError(json.error ?? res.statusText, json.errors);
  return json.data as T;
}

export const api = {
  posts: () => request<Post[]>('/posts'),
  post: (id: string | number) => request<Post>(`/posts/${id}`),
  createPost: (input: { title: string; body: string }) =>
    request<Post>('/posts', { method: 'POST', body: JSON.stringify(input) }),
  deletePost: (id: number) => request<void>(`/posts/${id}`, { method: 'DELETE' }),
};
