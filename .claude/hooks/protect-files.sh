#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

BASENAME=$(basename "$FILE_PATH")

case "$BASENAME" in
  .env.example) ;;
  .env|.env.*)
    echo "Blocked: $FILE_PATH is an env file. Only .env.example is safe to edit." >&2
    exit 2
    ;;
esac

PROTECTED_PATHS=( ".git/" "package-lock.json" "ios/" "android/" )
for p in "${PROTECTED_PATHS[@]}"; do
  if [[ "$FILE_PATH" == *"$p"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$p'. Propose the change in chat instead." >&2
    exit 2
  fi
done

exit 0
