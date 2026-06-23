import { MAX_FRIENDSHIP } from '../storage.jsx'

// なかよし島：なでたり、きのみをあげてなかよし度を上げる
export default function FriendshipIsland({ resort }) {
  const { state, pet, feedBerry, releasePokemon } = resort

  if (state.pokemons.length === 0) {
    return <EmptyHint />
  }

  return (
    <div className="island">
      <p className="island-lead">
        ポケモンとあそんで「なかよし度」をあげよう！（きのみ: {state.berries}こ）
      </p>

      <div className="poke-grid">
        {state.pokemons.map((p) => {
          const max = p.friendship >= MAX_FRIENDSHIP
          return (
            <div key={p.id} className="poke-tile">
              <img className="tile-sprite" src={p.image} alt={p.nameJa} />
              <strong>{p.nameJa}</strong>

              <div className="bar friendship-bar">
                <span
                  className="bar-fill"
                  style={{ width: `${(p.friendship / MAX_FRIENDSHIP) * 100}%` }}
                />
              </div>
              <small>
                {max ? '💖 なかよしMAX!' : `なかよし度 ${p.friendship}/${MAX_FRIENDSHIP}`}
              </small>

              <div className="tile-actions">
                <button onClick={() => pet(p.id)} disabled={max}>
                  なでる +3
                </button>
                <button
                  onClick={() => feedBerry(p.id)}
                  disabled={max || state.berries <= 0}
                >
                  きのみ +10
                </button>
              </div>
              <button className="release" onClick={() => releasePokemon(p.id)}>
                にがす
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmptyHint() {
  return (
    <div className="island empty">
      <p>まだポケモンがいません。</p>
      <p>「あつめる」タブからポケモンをつれてきてね！</p>
    </div>
  )
}
