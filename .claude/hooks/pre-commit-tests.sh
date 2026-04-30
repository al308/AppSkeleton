#!/usr/bin/env bash
set -euo pipefail

echo "Running full check before commit..." >&2

if ! npm run lint --silent >/dev/null 2>&1; then
  echo "Lint failed. Fix lint before committing." >&2
  exit 2
fi

if ! npm run format:check --silent >/dev/null 2>&1; then
  echo "Format check failed. Run 'npm run format'." >&2
  exit 2
fi

if ! npm run typecheck --silent >/dev/null 2>&1; then
  echo "Type check failed." >&2
  exit 2
fi

if ! npm test --silent >/dev/null 2>&1; then
  echo "Tests failed. Do not commit red." >&2
  exit 2
fi

exit 0
