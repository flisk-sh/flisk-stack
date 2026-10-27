// Throw from an Action to answer with that status and message.
export class HttpError extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 409 | 422,
    message: string,
  ) {
    super(message);
  }
}

export class ValidationError extends HttpError {
  constructor(readonly errors: Record<string, string[]>) {
    super(422, 'The given data was invalid.');
  }
}
