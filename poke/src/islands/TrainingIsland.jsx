import { expForLevel, MAX_LEVEL } from '../storage.jsx'

// トレーニング島：トレーニング中はじかんで経験値がたまり、レベルアップする
export default function TrainingIsland({ resort }) {
  const { state, toggleTraining } = resort

  if (state.pokemons.length === 0) {
    return (
      <div className="island empty">
        <p>まだポケモンがいません。</p>
        <p>「あつめる」タブからポケモンをつれてきてね！</p>
      </div>
    )
  }

  return (
    <div className="island">
      <p className="island-lead">
        トレーニングをはじめると、じかんがたつほど経験値がたまるよ！
      </p>

      <div className="poke-grid">
        {state.pokemons.map((p) => {
          const max = p.level >= MAX_LEVEL
          const need = expForLevel(p.level)
          const ratio = max ? 1 : Math.min(1, p.exp / need)
          const training = Boolean(p.trainingSince)
          return (
            <div
              key={p.id}
              className={`poke-tile ${training ? 'is-training' : ''}`}
            >
              <img className="tile-sprite" src={p.image} alt={p.nameJa} />
              <strong>{p.nameJa}</strong>
              <span className="level">Lv. {p.level}</span>

              <div className="bar exp-bar">
                <span className="bar-fill" style={{ width: `${ratio * 100}%` }} />
              </div>
              <small>
                {max ? 'レベルMAX!' : `EXP ${Math.floor(p.exp)}/${need}`}
              </small>

              <button
                className={training ? 'training-on' : ''}
                onClick={() => toggleTraining(p.id)}
                disabled={max}
              >
                {training ? 'トレーニング中（やめる）' : 'トレーニングする'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
