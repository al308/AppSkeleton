# Testing rules

## Layout

- Tests live in `tests/` and mirror the app's source tree (`App.tsx` → `tests/App.test.tsx`, `components/Foo.tsx` → `tests/components/Foo.test.tsx`).
- `tests/` — fast component + unit tests using `jest-expo` and `@testing-library/react-native`. No real network.
- `tests/integration/` (optional) — tests that hit a real service (Supabase, your API, etc.). Tag with `@integration` in the test name and run separately in CI if introduced.
- Reusable render helpers and fixtures live next to their consumers or in `tests/helpers/`. **Reuse before creating new ones.**

## Style

- One assertion concept per test. Multiple `expect`s are fine if they check the same concept.
- Arrange / Act / Assert, separated by blank lines.
- Test names describe _behavior_, not _implementation_: `it('renders an empty state when the user has no orders')` — not `it('returns []')`.
- Query by accessibility role / label / text first (`getByRole`, `getByLabelText`, `getByText`). Fall back to `getByTestId` only when nothing else works.
- No mocking the component under test. Mock at the boundary (HTTP clients, async storage, timers).
- Prefer **fakes** and **in-memory implementations** over `jest.fn()` where feasible.

## Coverage

- Coverage gate: 80% (enforced once CI is wired). New code in a module should not lower that module's coverage.
- Do not chase coverage with tests that don't assert meaningful behavior.

## Speed

- `npm test` (the default bar) must finish in under 30 seconds locally.
- Mark slow / integration tests by file naming (`*.integration.test.tsx`) and exclude them from the default `jest` run.

## Determinism

- No real `setTimeout`/`setInterval`. Use `jest.useFakeTimers()` or inject a clock.
- Freeze randomness behind a seam (a `random()` dependency you can replace) — never `Math.random()` directly inside the unit under test.
- Never depend on test ordering. Each test sets up what it needs.
