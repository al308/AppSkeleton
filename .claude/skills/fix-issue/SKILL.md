---
name: fix-issue
description: Diagnose and fix a bug. Reproduce first, then fix with a regression test.
---

Argument: $ARGUMENTS (issue number, URL, or short description)

1. **Reproduce.** Write a failing test in `tests/` that demonstrates the bug. Run `npm test` and confirm RED.
2. **Diagnose.** Identify root cause. Note the `file:line` where it originates. Do NOT fix yet — explain the cause in one paragraph.
3. **Approval gate.** Pause and wait for approval of the diagnosis before patching.
4. **Fix.** Minimal change to make the new test pass. No surrounding refactors.
5. **Verify.** `just check`. The new test must go GREEN; no other tests may regress.
6. **Commit.** `fix: <one-line summary>` with the issue reference in the body.
