-- The database queue: api dispatches rows here, worker runs them (see services/app/worker).
CREATE TABLE jobs (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  payload       JSONB NOT NULL DEFAULT '{}',
  attempts      INTEGER NOT NULL DEFAULT 0,
  max_attempts  INTEGER NOT NULL DEFAULT 3,
  available_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  reserved_at   TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  failed_at     TIMESTAMPTZ,
  last_error    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX jobs_pending_idx ON jobs (available_at) WHERE completed_at IS NULL AND failed_at IS NULL;
