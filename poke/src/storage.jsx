// ポケリゾートの状態を localStorage に保存・復元し、
// 放置中の経過時間（トレーニング経験値・きのみ成長）を計算する

const STORAGE_KEY = 'pokefarm-resort-v1'

// ゲームバランス用の定数
export const MAX_FRIENDSHIP = 100
export const MAX_LEVEL = 100
export const EXP_PER_SEC = 2 // トレーニング中、1秒あたりの経験値
export const BERRY_GROW_MS = 60_000 // きのみが実るまで（60秒）
export const BERRY_YIELD = 3 // 1回の収穫で得られるきのみ
export const PLOT_COUNT = 6 // きのみ畑の区画数

export function expForLevel(level) {
  return level * 50 // 次のレベルに必要な経験値
}

function createInitialState() {
  return {
    pokemons: [],
    berries: 5, // 最初に少しだけ持っておく
    plots: Array.from({ length: PLOT_COUNT }, () => ({ plantedAt: null })),
    lastSeen: Date.now(),
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw)
    // 形が壊れていても落ちないように最低限の補正
    return {
      pokemons: Array.isArray(parsed.pokemons) ? parsed.pokemons : [],
      berries: typeof parsed.berries === 'number' ? parsed.berries : 0,
      plots:
        Array.isArray(parsed.plots) && parsed.plots.length === PLOT_COUNT
          ? parsed.plots
          : createInitialState().plots,
      lastSeen: typeof parsed.lastSeen === 'number' ? parsed.lastSeen : Date.now(),
    }
  } catch {
    return createInitialState()
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 保存できなくてもアプリは動かす
  }
}

// 前回からの経過時間ぶんだけトレーニング経験値を進める（純粋関数）
export function applyElapsed(state, now = Date.now()) {
  const elapsedSec = Math.max(0, (now - state.lastSeen) / 1000)
  if (elapsedSec === 0) return { ...state, lastSeen: now }

  const pokemons = state.pokemons.map((p) => {
    if (!p.trainingSince) return p
    return gainExp(p, EXP_PER_SEC * elapsedSec)
  })

  return { ...state, pokemons, lastSeen: now }
}

// 経験値を加算し、必要に応じてレベルアップさせる
export function gainExp(pokemon, amount) {
  let level = pokemon.level
  let exp = pokemon.exp + amount

  while (level < MAX_LEVEL && exp >= expForLevel(level)) {
    exp -= expForLevel(level)
    level += 1
  }
  if (level >= MAX_LEVEL) exp = 0

  return { ...pokemon, level, exp }
}

// きのみが収穫可能かどうか
export function isBerryReady(plot, now = Date.now()) {
  return plot.plantedAt != null && now - plot.plantedAt >= BERRY_GROW_MS
}

// きのみの成長進捗（0〜1）
export function berryProgress(plot, now = Date.now()) {
  if (plot.plantedAt == null) return 0
  return Math.min(1, (now - plot.plantedAt) / BERRY_GROW_MS)
}
