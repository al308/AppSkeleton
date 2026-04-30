# TypeScript / React Native style rules

## Types

- `tsconfig` runs in `strict` mode plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` — keep them on.
- No `any` across module boundaries. Use `unknown` + a narrowed type guard when shape is genuinely unknown.
- Prefer `type` aliases for unions and primitives; `interface` for object shapes that are likely to be extended.
- Use discriminated unions over optional fields when state has distinct shapes.
- Annotate the return type of every exported function and React component.

## React Native components

- Function components only. No class components.
- Props go through a named `type Props = { ... }`; the component takes `(props: Props)` or destructures inline.
- Co-locate styles with `StyleSheet.create` at the bottom of the file. Don't allocate fresh style objects in render.
- Keep components < ~150 lines. Pull subviews into named local components or files in `components/`.
- No inline anonymous handlers in deeply nested children — name the handler so the stack trace is readable.

## Errors

- Never swallow errors. `try/catch` must either log and re-throw, surface to the user, or recover with an explicit fallback.
- Define domain errors as classes extending `Error` in a module's `errors.ts` rather than throwing strings.
- For async work, prefer `await` + try/catch over `.catch()` chains.

## Imports

- Order: builtins / RN core, third-party, expo, local — separated by blank lines. Prettier + ESLint enforce this.
- No wildcard imports.
- Absolute imports are fine if you set up `paths` in `tsconfig.json`; until then, relative.

## Naming

- `camelCase` for variables/functions, `PascalCase` for components/types, `SCREAMING_SNAKE_CASE` for module constants.
- Boolean variables read like predicates: `isLoading`, `hasError`, `canSubmit`.
- Files: `PascalCase.tsx` for components, `camelCase.ts` for everything else.

## Comments

- Default to no comments. Code should be self-explanatory.
- Write a comment only when the _why_ is non-obvious: a hidden constraint, a workaround, a subtle invariant.
- Never write comments that describe _what_ the code does — well-named identifiers already do that.

## Side effects

- Isolate network, storage, and timers behind a thin module so screens stay testable.
- No top-level side effects in modules other than the entry (`index.ts` registering the root component).
