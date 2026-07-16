// ポケリゾートの状態を localStorage に保存・復元する

const STORAGE_KEY = 'pokefarm-resort-v1'

// ゲームバランス用の定数
export const MAX_FRIENDSHIP = 100
export const BERRY_GROW_MS = 60_000 // きのみが実るまで（60秒）
export const BERRY_YIELD = 3 // 1回の収穫で得られるきのみ
export const PLOT_COUNT = 6 // きのみ畑の区画数

function createInitialState() {
  return {
    pokemons: [],
    berries: 5, // 最初に少しだけ持っておく
    plots: Array.from({ length: PLOT_COUNT }, () => ({ plantedAt: null })),
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

// きのみが収穫可能かどうか
export function isBerryReady(plot, now = Date.now()) {
  return plot.plantedAt != null && now - plot.plantedAt >= BERRY_GROW_MS
}

// きのみの成長進捗（0〜1）
export function berryProgress(plot, now = Date.now()) {
  if (plot.plantedAt == null) return 0
  return Math.min(1, (now - plot.plantedAt) / BERRY_GROW_MS)
}
