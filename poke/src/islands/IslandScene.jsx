import { useMemo, useState } from 'react'

// イーストク島ふうの俯瞰画面：島の上を、つれてきたポケモンが歩き回る
export default function IslandScene({ resort }) {
  const { state } = resort
  const [selected, setSelected] = useState(null)

  // ポケモンを島の上にばらまく（indexから決まる位置なので毎回同じ＝ちらつかない）
  const placed = useMemo(() => {
    const total = state.pokemons.length
    return state.pokemons.map((p, i) => {
      const angle = (i / Math.max(total, 1)) * Math.PI * 2 + (i % 3) * 0.4
      const r = 0.34 + (i % 3) * 0.12 // 中央の植物をよけて外周ぎみに配置
      const x = 50 + Math.cos(angle) * r * 40
      const y = 54 + Math.sin(angle) * r * 32
      return { ...p, x, y, delay: (i % 5) * 0.6 }
    })
  }, [state.pokemons])

  return (
    <div className="scene">
      <div className="island-outer">
        <div className="island-inner">
          {/* 散らばったきのみ（飾り） */}
          {BEANS.map((b, i) => (
            <span
              key={i}
              className="bean"
              style={{ left: `${b.x}%`, top: `${b.y}%`, background: b.color }}
            />
          ))}

          {/* 中央の植物 */}
          <Plant />

          {/* きのみ箱 */}
          <div className="bean-box" />

          {/* 歩き回るポケモンたち */}
          {placed.map((p) => (
            <button
              key={p.id}
              className="resort-mon"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDelay: `${p.delay}s`,
              }}
              title={`${p.nameJa} Lv.${p.level}`}
              onClick={() => setSelected(p)}
            >
              <img src={p.image} alt={p.nameJa} />
            </button>
          ))}

          {placed.length === 0 && (
            <p className="scene-hint">
              「あつめる」でポケモンをつれてくると
              <br />
              ここで遊びはじめるよ
            </p>
          )}
        </div>
      </div>

      {/* えらんだポケモンの吹き出し */}
      {selected && (
        <div className="mon-popup" onClick={() => setSelected(null)}>
          <img src={selected.image} alt={selected.nameJa} />
          <strong>{selected.nameJa}</strong>
          <span>Lv. {selected.level}</span>
          <small>なかよし度 {selected.friendship}/100</small>
        </div>
      )}
    </div>
  )
}

// 中央のまめのき（シンプルなSVG）
function Plant() {
  return (
    <svg className="plant" viewBox="0 0 100 120" aria-hidden="true">
      <path d="M50 120 V55" stroke="#3a7d34" strokeWidth="6" fill="none" />
      <g fill="#5fb85f" stroke="#3a7d34" strokeWidth="2">
        <path d="M50 60 C20 55 10 25 30 15 C45 30 55 45 50 60 Z" />
        <path d="M50 60 C80 55 90 25 70 15 C55 30 45 45 50 60 Z" />
        <path d="M50 48 C28 42 22 14 42 8 C52 22 56 36 50 48 Z" />
        <path d="M50 48 C72 42 78 14 58 8 C48 22 44 36 50 48 Z" />
        <path d="M50 40 C42 24 50 6 50 2 C50 6 58 24 50 40 Z" />
      </g>
    </svg>
  )
}

// 飾りのきのみ（色と位置）
const BEANS = [
  { x: 22, y: 70, color: '#ffd54f' },
  { x: 35, y: 80, color: '#ef5350' },
  { x: 48, y: 74, color: '#42a5f5' },
  { x: 60, y: 82, color: '#ab47bc' },
  { x: 72, y: 72, color: '#66bb6a' },
  { x: 30, y: 60, color: '#ff7043' },
  { x: 66, y: 60, color: '#26c6da' },
  { x: 44, y: 86, color: '#ec407a' },
  { x: 56, y: 64, color: '#ffca28' },
  { x: 20, y: 52, color: '#7e57c2' },
  { x: 78, y: 54, color: '#9ccc65' },
  { x: 40, y: 50, color: '#ff8a65' },
  { x: 62, y: 88, color: '#4fc3f7' },
  { x: 50, y: 90, color: '#fff176' },
]
