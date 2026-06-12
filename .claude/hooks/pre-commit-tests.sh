#!/usr/bin/env bash
set -euo pipefail

# PreToolUse(Bash) hook. The harness fires this for EVERY Bash call, so we must
# self-gate: only run the full check when the command actually commits. (The
# `"if": "Bash(git commit *)"` matcher in settings.json is not honored by every
# harness version, and even when it is, compound commands slip through — so the
# real guard lives here.)
#
# stdin is the hook payload JSON: { "tool_input": { "command": "..." }, ... }.
INPUT=$(cat)
COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || true)

# Only gate real commits. Match `git commit` allowing flags/paths in between
# (e.g. `git -C dir commit`, `git commit -m ...`). Skip `--no-verify`/`-n`
# (explicit user override) and amend-less status/log calls that merely contain
# the word "commit".
case "$COMMAND" in
  *"git commit"*|*"git "*" commit "*|*"git "*" commit") ;;
  *) exit 0 ;;  # not a commit — let it through untouched
esac

case "$COMMAND" in
  *"--no-verify"*|*" -n "*) exit 0 ;;  # user explicitly opted out
esac

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
