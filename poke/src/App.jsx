import { useState } from 'react'
import { useResort } from './useResort.jsx'
import IslandScene from './islands/IslandScene.jsx'
import GatherIsland from './islands/GatherIsland.jsx'
import FriendshipIsland from './islands/FriendshipIsland.jsx'
import BerryFarm from './islands/BerryFarm.jsx'
import './App.css'

const ISLANDS = [
  { id: 'resort', label: 'リゾート', Component: IslandScene },
  { id: 'gather', label: 'あつめる', Component: GatherIsland },
  { id: 'friend', label: 'なかよし', Component: FriendshipIsland },
  { id: 'berry', label: 'きのみ畑', Component: BerryFarm },
]

function App() {
  const resort = useResort()
  const [tab, setTab] = useState('resort')

  const Active = ISLANDS.find((i) => i.id === tab).Component

  return (
    <div className="App">
      <header className="resort-header">
        <h1>ポケファーム・リゾート</h1>
        <div className="status">
          <span>ポケモン {resort.state.pokemons.length}ひき</span>
          <span>きのみ {resort.state.berries}こ</span>
        </div>
      </header>

      <nav className="island-tabs">
        {ISLANDS.map((i) => (
          <button
            key={i.id}
            className={tab === i.id ? 'active' : ''}
            onClick={() => setTab(i.id)}
          >
            <span className="tab-label">{i.label}</span>
          </button>
        ))}
      </nav>

      <main>
        <Active resort={resort} />
      </main>
    </div>
  )
}

export default App
