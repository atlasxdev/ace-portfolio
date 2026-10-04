"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Snake, behind "/play" in the chat palette. Arrow keys steer on desktop;
 * on touch, swipe the board or use the buttons under it. It waits for the
 * first move before starting, and keeps a best score per visitor.
 */

const COLS = 24;
const ROWS = 12;
const TICK = 120;
const BEST = "ag-snake-best";

type Point = { x: number; y: number };
type Game = {
  snake: Point[];
  dir: Point;
  next: Point;
  food: Point;
  score: number;
  over: boolean;
  started: boolean;
};

const DIRS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

function freshGame(): Game {
  return {
    snake: [
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 4, y: 6 },
    ],
    dir: { x: 1, y: 0 },
    next: { x: 1, y: 0 },
    food: { x: 16, y: 6 },
    score: 0,
    over: false,
    started: false,
  };
}

function step(g: Game): Game {
  if (!g.started || g.over) return g;
  const dir = g.next;
  const head = { x: g.snake[0].x + dir.x, y: g.snake[0].y + dir.y };
  const ate = head.x === g.food.x && head.y === g.food.y;
  const body = ate ? g.snake : g.snake.slice(0, -1);
  const hit =
    head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || body.some((p) => p.x === head.x && p.y === head.y);
  if (hit) return { ...g, dir, over: true };
  const snake = [head, ...body];
  let food = g.food;
  if (ate) {
    do
      food = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
    while (snake.some((p) => p.x === food.x && p.y === food.y));
  }
  return { ...g, snake, dir, food, score: g.score + (ate ? 1 : 0) };
}

function readBest() {
  try {
    return Number(localStorage.getItem(BEST)) || 0;
  } catch {
    return 0;
  }
}

export function PaletteSnake() {
  const [game, setGame] = useState(freshGame);
  const [best, setBest] = useState(readBest);
  const touchStart = useRef<Point | null>(null);

  const steer = (d: Point) =>
    setGame((g) => {
      if (g.over) return g;
      // No reversing into yourself.
      if (d.x === -g.dir.x && d.y === -g.dir.y) return g;
      return { ...g, next: d, started: true };
    });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = DIRS[e.key];
      if (d) {
        e.preventDefault();
        steer(d);
      } else if (e.key === "Enter") {
        setGame((g) => (g.over ? freshGame() : g));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const running = game.started && !game.over;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setGame(step), TICK);
    return () => clearInterval(t);
  }, [running]);

  // Record a new best when a game ends.
  const [recorded, setRecorded] = useState(false);
  if (game.over && !recorded) {
    setRecorded(true);
    if (game.score > best) setBest(game.score);
  }
  if (!game.over && recorded) setRecorded(false);
  useEffect(() => {
    try {
      localStorage.setItem(BEST, String(best));
    } catch {
      // A per-visitor nicety; nothing to do without storage.
    }
  }, [best]);

  const cells: string[] = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const head = game.snake[0].x === x && game.snake[0].y === y;
      const body = !head && game.snake.some((p) => p.x === x && p.y === y);
      const food = game.food.x === x && game.food.y === y;
      cells.push(head ? "head" : body ? "body" : food ? "food" : "");
    }

  return (
    <div className="flex flex-col gap-3 px-4 py-5 lg:px-6">
      <div className="flex justify-between text-body-sm text-muted-foreground">
        <span>
          Score <b className="font-semibold text-foreground tabular-nums">{game.score}</b>
        </span>
        <span>
          Best <b className="font-semibold text-foreground tabular-nums">{Math.max(best, game.score)}</b>
        </span>
      </div>

      <div
        role="img"
        aria-label={`Snake. Score ${game.score}.`}
        onTouchStart={(e) => {
          const t = e.touches[0];
          touchStart.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const s = touchStart.current;
          const t = e.changedTouches[0];
          if (!s) return;
          const dx = t.clientX - s.x;
          const dy = t.clientY - s.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
          steer(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
        }}
        className="relative grid touch-none gap-0.5 rounded-xl border border-rule bg-black/20 p-2"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
        {cells.map((c, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-[3px]",
              c === "head" && "bg-foreground",
              c === "body" && "bg-foreground/70",
              c === "food" && "rounded-full bg-available",
              !c && "bg-foreground/4",
            )}
          />
        ))}

        {(!game.started || game.over) && (
          <div className="absolute inset-0 grid place-items-center rounded-xl bg-card/70 text-center backdrop-blur-[1px]">
            <div>
              <p className="text-body-lg font-semibold">{game.over ? `Game over. Score ${game.score}.` : "Snake"}</p>
              <p className="mt-1 text-body-sm text-muted-foreground">
                {game.over ? (
                  <>
                    <span className="hidden lg:inline">Enter to play again, Esc to go back</span>
                    <button
                      type="button"
                      onClick={() => setGame(freshGame())}
                      className="mt-1 h-9 cursor-pointer rounded-full border border-foreground/12 px-4 text-foreground lg:hidden">
                      Play again
                    </button>
                  </>
                ) : (
                  <>
                    <span className="hidden lg:inline">Press an arrow key to start</span>
                    <span className="lg:hidden">Swipe or tap an arrow to start</span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* touch controls */}
      <div
        className="grid grid-cols-3 gap-2 self-center lg:hidden"
        style={{ gridTemplateAreas: '". up ." "left down right"' }}>
        {(
          [
            ["up", "Up", ArrowUp, DIRS.ArrowUp],
            ["left", "Left", ArrowLeft, DIRS.ArrowLeft],
            ["down", "Down", ArrowDown, DIRS.ArrowDown],
            ["right", "Right", ArrowRight, DIRS.ArrowRight],
          ] as const
        ).map(([area, label, Icon, d]) => (
          <button
            key={area}
            type="button"
            aria-label={label}
            onClick={() => steer(d)}
            style={{ gridArea: area }}
            className="grid size-12 cursor-pointer place-items-center rounded-xl border border-foreground/12 bg-foreground/4 text-foreground active:bg-foreground/10">
            <Icon className="size-5" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}
