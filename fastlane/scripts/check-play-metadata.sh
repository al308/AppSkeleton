#!/usr/bin/env bash
set -euo pipefail

# Lint the fastlane supply metadata tree against Google Play's hard limits BEFORE
# pushing, so an over-length field doesn't bounce the upload (or worse, get
# silently truncated). Checks every locale under fastlane/metadata/android/.
#
# Play limits: title ≤ 30, short_description ≤ 80, full_description ≤ 4000,
# each changelog ≤ 500. Counts CHARACTERS (not bytes) so emoji/accents are fair.
#
# Usage: fastlane/scripts/check-play-metadata.sh [metadata-dir]
#   default dir: fastlane/metadata/android

ROOT="${1:-fastlane/metadata/android}"
fail=0

if [[ ! -d "$ROOT" ]]; then
  echo "No Play metadata tree at $ROOT (nothing to check)."
  exit 0
fi

# Character count of a file's contents with the trailing newline stripped
# (supply ignores it, so we must too or every field reads one over).
charlen() {
  local f="$1"
  [[ -f "$f" ]] || { echo "-1"; return; }
  # %s of content sans trailing newline, counted as characters via wc -m
  printf '%s' "$(cat "$f")" | wc -m | tr -d ' '
}

check() {
  local file="$1" limit="$2" label="$3" required="$4"
  local n
  n=$(charlen "$file")
  if [[ "$n" == "-1" ]]; then
    if [[ "$required" == "required" ]]; then
      echo "  ✗ MISSING  $label  ($file)"
      fail=1
    fi
    return
  fi
  if (( n > limit )); then
    echo "  ✗ $label: $n chars (max $limit) — $file"
    fail=1
  else
    echo "  ✓ $label: $n/$limit"
  fi
}

for locale_dir in "$ROOT"/*/; do
  [[ -d "$locale_dir" ]] || continue
  locale="$(basename "$locale_dir")"
  # skip non-locale dirs (e.g. a README lives at the android/ root, not here)
  [[ "$locale" == *-* ]] || continue
  echo "Locale: $locale"
  check "$locale_dir/title.txt"             30   "title"             required
  check "$locale_dir/short_description.txt"  80   "short_description" required
  check "$locale_dir/full_description.txt"  4000  "full_description"  required
  if [[ -d "$locale_dir/changelogs" ]]; then
    for cl in "$locale_dir"/changelogs/*.txt; do
      [[ -f "$cl" ]] || continue
      check "$cl" 500 "changelog $(basename "$cl")" optional
    done
  fi
  echo
done

if (( fail )); then
  echo "Play metadata lint FAILED."
  exit 1
fi
echo "Play metadata lint passed."
