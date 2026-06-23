import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadState,
  saveState,
  applyElapsed,
  gainExp,
  isBerryReady,
  MAX_FRIENDSHIP,
  BERRY_YIELD,
} from './storage.jsx'

// リゾート全体の状態と操作をまとめたカスタムフック
export function useResort() {
  // 初回マウント時に保存データを読み込み、放置ぶんを反映する
  const [state, setState] = useState(() => applyElapsed(loadState()))
  // 1秒ごとに更新される現在時刻（進捗バーの再描画用）
  const [now, setNow] = useState(() => Date.now())

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // 毎秒：経過ぶんの経験値を進め、現在時刻を更新する
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => applyElapsed(prev))
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // 状態が変わるたびに保存
  useEffect(() => {
    saveState(state)
  }, [state])

  // タブを閉じる前にも保存
  useEffect(() => {
    const handler = () => saveState(stateRef.current)
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  // --- 操作 ---

  // ポケモンをリゾートに連れてくる
  const addPokemon = useCallback((p) => {
    setState((prev) => {
      if (prev.pokemons.some((x) => x.id === p.id)) return prev // 重複は無視
      const newcomer = {
        id: p.id,
        name: p.name,
        nameJa: p.nameJa,
        image: p.image,
        types: p.types,
        friendship: 0,
        level: 1,
        exp: 0,
        trainingSince: null,
      }
      return { ...prev, pokemons: [...prev.pokemons, newcomer] }
    })
  }, [])

  const releasePokemon = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      pokemons: prev.pokemons.filter((p) => p.id !== id),
    }))
  }, [])

  // なでる：なかよし度 +3（無料）
  const pet = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      pokemons: prev.pokemons.map((p) =>
        p.id === id
          ? { ...p, friendship: Math.min(MAX_FRIENDSHIP, p.friendship + 3) }
          : p,
      ),
    }))
  }, [])

  // きのみをあげる：なかよし度 +10（きのみ1個消費）
  const feedBerry = useCallback((id) => {
    setState((prev) => {
      if (prev.berries <= 0) return prev
      return {
        ...prev,
        berries: prev.berries - 1,
        pokemons: prev.pokemons.map((p) =>
          p.id === id
            ? { ...p, friendship: Math.min(MAX_FRIENDSHIP, p.friendship + 10) }
            : p,
        ),
      }
    })
  }, [])

  // トレーニングの開始 / 終了
  const toggleTraining = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      pokemons: prev.pokemons.map((p) =>
        p.id === id
          ? { ...p, trainingSince: p.trainingSince ? null : Date.now() }
          : p,
      ),
    }))
  }, [])

  // きのみを植える
  const plantBerry = useCallback((index) => {
    setState((prev) => {
      const plots = prev.plots.map((plot, i) =>
        i === index && plot.plantedAt == null
          ? { plantedAt: Date.now() }
          : plot,
      )
      return { ...prev, plots }
    })
  }, [])

  // きのみを収穫する
  const harvestBerry = useCallback((index) => {
    setState((prev) => {
      const plot = prev.plots[index]
      if (!isBerryReady(plot)) return prev
      const plots = prev.plots.map((p, i) =>
        i === index ? { plantedAt: null } : p,
      )
      return { ...prev, plots, berries: prev.berries + BERRY_YIELD }
    })
  }, [])

  return {
    state,
    now,
    addPokemon,
    releasePokemon,
    pet,
    feedBerry,
    toggleTraining,
    plantBerry,
    harvestBerry,
  }
}

export { gainExp }
