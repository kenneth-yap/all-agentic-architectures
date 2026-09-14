export type CellType = "empty" | "obstacle" | "shelf" | "packing" | "path";

export interface Cell {
  type: CellType;
  label: string;
  value: number;
}

export type Grid = Cell[][];

export function createWarehouseGrid(): Grid {
  const ROWS = 7, COLS = 7;
  const grid: Grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      type: "empty" as CellType,
      label: "",
      value: Infinity,
    }))
  );

  // Obstacles
  const obstacles: [number, number][] = [[2, 2], [2, 3], [3, 4], [4, 4], [1, 5]];
  obstacles.forEach(([r, c]) => { grid[r][c].type = "obstacle"; });

  // Shelves
  const shelves: [number, number, string][] = [[3, 0, "A"], [0, 3, "B"], [6, 1, "C"], [1, 6, "D"]];
  shelves.forEach(([r, c, l]) => { grid[r][c].type = "shelf"; grid[r][c].label = l; });

  // Packing station
  grid[5][3].type = "packing";
  grid[5][3].label = "P";
  grid[5][3].value = 0;

  return grid;
}

export function tick(grid: Grid): { newGrid: Grid; changed: boolean } {
  const ROWS = grid.length, COLS = grid[0].length;
  const newGrid: Grid = grid.map((row) => row.map((cell) => ({ ...cell })));
  let changed = false;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r][c];
      if (cell.type === "obstacle") continue;

      const neighbors: Cell[] = [];
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].type !== "obstacle") {
          neighbors.push(grid[nr][nc]);
        }
      });

      const minNeighbor = Math.min(...neighbors.map((n) => n.value));
      const newVal = minNeighbor === Infinity ? Infinity : minNeighbor + 1;
      if (newVal < newGrid[r][c].value) {
        newGrid[r][c].value = newVal;
        changed = true;
      }
    }
  }

  return { newGrid, changed };
}

export function tracePath(grid: Grid, startR: number, startC: number): [number, number][] {
  const ROWS = grid.length, COLS = grid[0].length;
  const path: [number, number][] = [[startR, startC]];
  let r = startR, c = startC;
  const visited = new Set<string>();
  visited.add(`${r},${c}`);

  while (grid[r][c].type !== "packing") {
    let bestR = r, bestC = c, bestVal = grid[r][c].value;
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS
        && grid[nr][nc].type !== "obstacle"
        && !visited.has(key)
        && grid[nr][nc].value < bestVal) {
        bestVal = grid[nr][nc].value;
        bestR = nr; bestC = nc;
      }
    });
    if (bestR === r && bestC === c) break;
    r = bestR; c = bestC;
    visited.add(`${r},${c}`);
    path.push([r, c]);
    if (path.length > 50) break;
  }
  return path;
}
