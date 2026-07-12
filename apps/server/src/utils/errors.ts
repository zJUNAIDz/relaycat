/**
 * Typed application errors. Services/middleware throw these; the central
 * {@link errorhandler} maps them to the right HTTP status so route handlers
 * stop hand-rolling `return c.json({ error }, 4xx)` and returning `null`.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** 401 — no/invalid session. */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/** 403 — authenticated but lacking the required permission. */
export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to do this") {
    super(message, 403);
  }
}

/** 404 — resource (or membership) not found. */
export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

/** 400 — malformed/invalid request beyond schema validation. */
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}
