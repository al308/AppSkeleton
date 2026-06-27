#!/usr/bin/env python3
"""
Precompute optimal move counts for all fixed-seed levels and write them into levels.ts.

Two values are computed per level (see docs/specs/numbered-solving.md):

  - optimalMoves         exact numeric solve (strict order) — the goal is
                         [1, 2, ..., n*n-1, 0]. Used when numbers are shown.
  - optimalMovesPattern  shortest path to ANY valid color-group arrangement
                         (pattern levels only). Used when solving by color.

The shuffled start state and the pattern tile→group mapping come from
tools/levels-dump.json, produced by `npx tsx tools/dump-levels.ts`. This keeps the
TS engine the single source of truth for the PRNG, the shuffle, and the pattern
shapes — Python never re-implements them.

On timeout the best proven lower bound is stored as `~N` with `approx: true`.

Usage:
    npx tsx tools/dump-levels.ts > tools/levels-dump.json
    python3 tools/precompute_solver.py              # solve + write levels.ts
    python3 tools/precompute_solver.py --dry-run    # solve + report only
    python3 tools/precompute_solver.py --write-cache # reuse last run, just rewrite levels.ts

Requirements: Python 3.9+, no extra dependencies.
"""

import json
import os
import re
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEVELS_PATH = os.path.join(ROOT, "src", "data", "levels.ts")
DUMP_PATH = os.path.join(ROOT, "tools", "levels-dump.json")

TIME_LIMITS = {3: 5.0, 4: 20.0, 5: 30.0, 6: 30.0, 7: 30.0}


def adjacent_indices(blank: int, size: int) -> list[int]:
    row, col = divmod(blank, size)
    adj = []
    if row > 0: adj.append(blank - size)
    if row < size - 1: adj.append(blank + size)
    if col > 0: adj.append(blank - 1)
    if col < size - 1: adj.append(blank + 1)
    return adj


# ── Heuristic: Manhattan + linear conflict (admissible, far tighter than plain
#    Manhattan, so IDA* prunes much more and solves more 4×4 states exactly). ──

def manhattan_linear_conflict(tiles: list[int], size: int) -> int:
    dist = 0
    for i, tile in enumerate(tiles):
        if tile == 0:
            continue
        goal = tile - 1
        dist += abs(i // size - goal // size) + abs(i % size - goal % size)

    conflict = 0
    # Row conflicts
    for row in range(size):
        for a in range(size):
            ta = tiles[row * size + a]
            if ta == 0 or (ta - 1) // size != row:
                continue
            for b in range(a + 1, size):
                tb = tiles[row * size + b]
                if tb == 0 or (tb - 1) // size != row:
                    continue
                if (ta - 1) % size > (tb - 1) % size:
                    conflict += 1
    # Column conflicts
    for col in range(size):
        for a in range(size):
            ta = tiles[a * size + col]
            if ta == 0 or (ta - 1) % size != col:
                continue
            for b in range(a + 1, size):
                tb = tiles[b * size + col]
                if tb == 0 or (tb - 1) % size != col:
                    continue
                if (ta - 1) // size > (tb - 1) // size:
                    conflict += 1

    return dist + 2 * conflict


# ── IDA* toward the exact numeric goal ───────────────────────────────────────

def ida_star_numeric(tiles: list[int], size: int, time_limit_s: float):
    """Return (optimal_moves, exact). On timeout exact=False and the value is a
    proven lower bound (the initial heuristic)."""
    start = time.time()
    lower_bound = manhattan_linear_conflict(tiles, size)
    bound = lower_bound
    path = [tuple(tiles)]

    def search(tiles, g, bound, blank):
        h = manhattan_linear_conflict(tiles, size)
        f = g + h
        if f > bound:
            return f
        if h == 0:
            return "FOUND"
        if time.time() - start > time_limit_s:
            return "TIMEOUT"
        minimum = float("inf")
        for nb in adjacent_indices(blank, size):
            nxt = tiles[:]
            nxt[blank], nxt[nb] = nxt[nb], nxt[blank]
            t = tuple(nxt)
            if t in path:
                continue
            path.append(t)
            result = search(nxt, g + 1, bound, nb)
            path.pop()
            if result in ("FOUND", "TIMEOUT"):
                return result
            if isinstance(result, (int, float)) and result < minimum:
                minimum = result
        return minimum

    while bound < 200:
        result = search(tiles, 0, bound, tiles.index(0))
        if result == "FOUND":
            return bound, True
        if result == "TIMEOUT":
            return lower_bound, False
        if not isinstance(result, (int, float)) or result == float("inf"):
            return lower_bound, False
        bound = int(result)
    return lower_bound, False


# ── IDA* toward the nearest valid color-group arrangement ────────────────────

def build_group_positions(size: int, goal_group_at: list[str]) -> dict[str, list[int]]:
    """For each group, the list of goal positions belonging to it."""
    by_group: dict[str, list[int]] = {}
    for pos, g in enumerate(goal_group_at):
        by_group.setdefault(g, []).append(pos)
    return by_group


def group_heuristic(tiles, size, group_of, goal_group_at, group_positions) -> int:
    """Admissible lower bound for the color-group solve: each tile must reach the
    NEAREST goal position sharing its group. Summed Manhattan over those nearest
    targets never over-counts (relaxes the one-tile-per-position constraint), so
    it stays admissible while being far tighter than a misplaced-count bound."""
    dist = 0
    for pos, tile in enumerate(tiles):
        if tile == 0:
            continue
        g = group_of.get(tile, str(tile))
        targets = group_positions.get(g)
        if not targets:
            continue
        r, c = divmod(pos, size)
        best = min(abs(r - t // size) + abs(c - t % size) for t in targets)
        dist += best
    return dist


def is_group_solved(tiles, size, group_of, goal_group_at) -> bool:
    for pos, tile in enumerate(tiles):
        if group_of.get(tile, str(tile)) != goal_group_at[pos]:
            return False
    return True


def ida_star_pattern(tiles, size, time_limit_s, tile_groups: dict[int, str]):
    """Shortest path until the color groups match the solved layout."""
    total = size * size
    group_of = {int(k): v for k, v in tile_groups.items()}
    # Goal group at each position: the group the solved tile (pos+1, blank last) has.
    goal_group_at = []
    for pos in range(total):
        goal_tile = 0 if pos == total - 1 else pos + 1
        goal_group_at.append(group_of.get(goal_tile, str(goal_tile)))

    group_positions = build_group_positions(size, goal_group_at)
    start = time.time()
    lower_bound = group_heuristic(tiles, size, group_of, goal_group_at, group_positions)
    bound = max(lower_bound, 0)
    path = [tuple(tiles)]

    def search(tiles, g, bound, blank):
        if is_group_solved(tiles, size, group_of, goal_group_at):
            return "FOUND"
        h = group_heuristic(tiles, size, group_of, goal_group_at, group_positions)
        f = g + h
        if f > bound:
            return f
        if time.time() - start > time_limit_s:
            return "TIMEOUT"
        minimum = float("inf")
        for nb in adjacent_indices(blank, size):
            nxt = tiles[:]
            nxt[blank], nxt[nb] = nxt[nb], nxt[blank]
            t = tuple(nxt)
            if t in path:
                continue
            path.append(t)
            result = search(nxt, g + 1, bound, nb)
            path.pop()
            if result in ("FOUND", "TIMEOUT"):
                return result
            if isinstance(result, (int, float)) and result < minimum:
                minimum = result
        return minimum

    while bound < 200:
        result = search(tiles, 0, bound, tiles.index(0))
        if result == "FOUND":
            return bound, True
        if result == "TIMEOUT":
            return lower_bound, False
        if not isinstance(result, (int, float)) or result == float("inf"):
            return lower_bound, False
        bound = int(result)
    return lower_bound, False


# ── levels.ts writer ─────────────────────────────────────────────────────────

OPTIMAL_FIELDS = ("optimalMoves", "optimalMovesPattern", "optimalApprox")


def write_level_optimals(source: str, level_id: str, fields: dict[str, object]) -> str:
    """Replace the optimal-* fields for one level in a single pass: strip any
    existing optimal-* lines that sit right after the level's shuffleSeed, then
    insert the fresh ones in canonical order. `fields` keeps the desired source
    order (optimalMoves, optimalMovesPattern, optimalApprox)."""
    anchor_re = re.compile(
        rf"(id:\s*'{re.escape(level_id)}'.*?shuffleSeed:\s*\d+,\n)"
        rf"((?:\s*optimal[A-Za-z]+:\s*(?:\d+|true|false),\n)*)",
        re.DOTALL,
    )
    m = anchor_re.search(source)
    if not m:
        raise ValueError(f"could not locate level block for {level_id}")

    indent = "    "
    lines = []
    for name in OPTIMAL_FIELDS:
        if name not in fields:
            continue
        v = fields[name]
        literal = "true" if v is True else "false" if v is False else str(v)
        lines.append(f"{indent}{name}: {literal},\n")

    replacement = m.group(1) + "".join(lines)
    return source[: m.start()] + replacement + source[m.end():]


CACHE_PATH = os.path.join(ROOT, "tools", "solver-results.json")


def compute_all(levels) -> dict:
    results: dict[str, dict[str, list]] = {}
    for lv in levels:
        lid, size = lv["id"], lv["gridSize"]
        tiles = lv["tiles"]
        limit = TIME_LIMITS.get(size, 30.0)
        results[lid] = {}

        t0 = time.time()
        num, exact = ida_star_numeric(tiles, size, limit)
        tag = f"{num}" if exact else f"~{num}"
        print(f"  {lid} ({size}×{size}) numeric: {tag} ({time.time()-t0:.2f}s)", end="")
        results[lid]["optimalMoves"] = [num, exact]

        if lv["isPattern"]:
            t1 = time.time()
            pat, pexact = ida_star_pattern(tiles, size, limit, lv["tileGroups"])
            ptag = f"{pat}" if pexact else f"~{pat}"
            print(f" | pattern: {ptag} ({time.time()-t1:.2f}s)")
            results[lid]["optimalMovesPattern"] = [pat, pexact]
        else:
            print()
    return results


def main():
    dry_run = "--dry-run" in sys.argv
    # --write-cache reuses a previous run's solver-results.json (skips the slow
    # search) so the levels.ts writer can be fixed and re-applied cheaply.
    write_cache = "--write-cache" in sys.argv

    if not os.path.exists(DUMP_PATH):
        print(f"Missing {DUMP_PATH}. Run:  npx tsx tools/dump-levels.ts > tools/levels-dump.json")
        sys.exit(1)

    with open(DUMP_PATH) as f:
        levels = json.load(f)

    print(f"Found {len(levels)} levels to process\n")

    if write_cache:
        with open(CACHE_PATH) as f:
            results = json.load(f)
        print(f"Loaded cached results from {CACHE_PATH}")
    else:
        results = compute_all(levels)
        with open(CACHE_PATH, "w") as f:
            json.dump(results, f, indent=2)

    if dry_run:
        print("\nDry run — no files written.")
        return

    with open(LEVELS_PATH) as f:
        source = f.read()

    written = 0
    for lid, res in results.items():
        num_val, num_exact = res["optimalMoves"]
        out: dict[str, object] = {"optimalMoves": num_val}
        if "optimalMovesPattern" in res:
            out["optimalMovesPattern"] = res["optimalMovesPattern"][0]
        if not num_exact:
            out["optimalApprox"] = True
        source = write_level_optimals(source, lid, out)
        written += len(out)

    with open(LEVELS_PATH, "w") as f:
        f.write(source)

    approx = [lid for lid, fs in results.items() if not fs["optimalMoves"][1]]
    print(f"\nWrote {written} values to {LEVELS_PATH}")
    if approx:
        print(f"Approximate (lower-bound) numeric optimal for {len(approx)} levels: {', '.join(approx)}")
        print("→ These are honest lower bounds; re-run with longer limits or a stronger solver to tighten.")


if __name__ == "__main__":
    main()
