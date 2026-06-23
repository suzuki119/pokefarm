import { useState } from 'react'
import { searchPokemon } from '../api.jsx'

// 集める島：野生ポケモンを検索して、リゾートに連れてくる
export default function GatherIsland({ resort }) {
  const { state, addPokemon } = resort
  const [query, setQuery] = useState('')
  const [found, setFound] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFound(null)
    try {
      setFound(await searchPokemon(query))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const alreadyHere = found && state.pokemons.some((p) => p.id === found.id)

  return (
    <div className="island gather">
      <p className="island-lead">
        やせいのポケモンをさがして、リゾートにつれてこよう！
      </p>

      <form className="search" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="なまえ / ずかんばんごう (例: ピカチュウ, 25)"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'さがし中…' : 'さがす'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {found && (
        <div className="card">
          <span className="dex">No.{String(found.id).padStart(4, '0')}</span>
          <h2>{found.nameJa}</h2>
          {found.genusJa && <span className="genus">{found.genusJa}</span>}
          {found.image && (
            <img className="artwork" src={found.image} alt={found.nameJa} />
          )}
          <div className="types">
            {found.types.map((t) => (
              <span key={t.name} className={`type type-${t.name}`}>
                {t.ja}
              </span>
            ))}
          </div>
          {found.flavorJa && <p className="flavor">{found.flavorJa}</p>}

          <button
            className="primary-btn"
            disabled={alreadyHere}
            onClick={() => addPokemon(found)}
          >
            {alreadyHere ? 'もうリゾートにいるよ' : 'リゾートにつれてくる'}
          </button>
        </div>
      )}
    </div>
  )
}
